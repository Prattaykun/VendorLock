# VendorLock — Complete API Endpoint Documentation

> **Auto-generated** by `generate_api_docs.py` from FastAPI route introspection.

## Global Setup Requirements

| Requirement | Detail |
|-------------|--------|
| **Python** | 3.11+ with venv |
| **FastAPI** | Runs on `http://localhost:8000` via `uvicorn` |
| **Auth** | All endpoints (except public ones) require `Authorization: Bearer <JWT>` |
| **JWT payload** | `{ user_id, tenant_id, role, email, exp }` |
| **Roles** | `admin`, `distributor`, `salesman`, `retailer`, `viewer` |
| **Primary LLM** | Gemini 2.5 Flash via `google-genai` SDK (GOOGLE_API_KEY in .env) |
| **Fallback LLM** | NVIDIA NIM / DeepSeek v4 Pro (NVIDIA_API_KEY in .env) |
| **Database** | Supabase (PostgreSQL) + MongoDB Atlas (`pymongo[srv]`) |
| **Vector Store** | FAISS (for scheme PDF RAG) |
| **Frontend** | Next.js 15 + TypeScript + Tailwind (`frontend/`) |
| **Mobile** | Flutter (planned) |

## Table of Contents

1. [Auth](#auth)
2. [Orders](#orders)
3. [Trust Score](#trust-score)
4. [Risk Alerts](#risk-alerts)
5. [Beat Plan](#beat-plan)
6. [Schemes](#schemes)
7. [Returns](#returns)
8. [Expiry](#expiry)
9. [Trust Certificate](#trust-certificate)
10. [Distributor](#distributor)
11. [Retailer](#retailer)
12. [Salesman](#salesman)
13. [AI Agent Pipeline](#ai-agent-pipeline)
14. [Telegram Webhook](#telegram-webhook)
15. [ONDC](#ondc)
16. [Analytics](#analytics)
17. [PDF Parser](#pdf-parser)

---
## AI Agent Pipeline Overview

All agents use LangGraph `StateGraph`. LLM calls route through `app/core/llm.py`
(Gemini 2.5 Flash primary → DeepSeek fallback). Provider logged to console on every call.

### Agent 1 — Trade Capture & Normalisation
- **File**: `app/agents/agent1_trade_capture.py`
- **Purpose**: Converts informal multilingual chat messages (Hindi, Hinglish, etc.) into structured trade events.
- **Graph nodes**: parse_intent → validate_products → generate_confirmation
- **LLM calls**: chat_completion_json (parse), chat_completion (confirmation)
- **Triggered by**: /orders/ POST, /agent/run (agent_1), /agent/parse-message, /webhook/telegram

### Agent 2 — Trust & Behaviour Scoring
- **File**: `app/agents/agent2_trust_scoring.py`
- **Purpose**: Maintains CIBIL-style Trust Scores (0-100) for every retailer across 6 dimensions.
- **Graph nodes**: compute_sub_scores → compute_composite → compute_trend → generate_flags → persist_score
- **LLM calls**: chat_completion_json (sub-score computation)
- **Triggered by**: /trust-score/recalculate/{id} POST, /agent/run (agent_2)

### Agent 3 — Risk, Scheme & Compliance Intelligence
- **File**: `app/agents/agent3_risk_intelligence.py`
- **Purpose**: Surfaces hidden risks: credit risk, scheme leakage, fake returns, expiry, GST compliance.
- **Graph nodes**: credit_risk → scheme_leakage → return_validation → expiry_intelligence → gst_compliance
- **LLM calls**: chat_completion_json (credit risk), chat_completion_json (scheme leakage), chat_completion_json (return validation)
- **Triggered by**: /risk-alerts/run-scan POST, /agent/run (agent_3)

### Agent 4 — Action & Recommendation
- **File**: `app/agents/agent4_action_recommendation.py`
- **Purpose**: Converts Agent 3 risk alerts into concrete action cards with draft Hindi/Hinglish Telegram messages.
- **Graph nodes**: generate_cards → prioritize
- **LLM calls**: chat_completion_json (action card + message drafting)
- **Triggered by**: /agent/run (agent_4)

### Agent 5 — Demand & Pre-Stock Forecast
- **File**: `app/agents/agent5_demand_forecast.py`
- **Purpose**: Predicts SKU demand per zone, recommends pre-stocking.
- **Graph nodes**: time_series_forecast → scheme_adjusted_forecast → prestock_alerts
- **LLM calls**: chat_completion_json (demand forecast)
- **Triggered by**: /agent/run (agent_5)

### Agent 6 — Beat Intelligence & Coverage
- **File**: `app/agents/agent6_beat_intelligence.py`
- **Purpose**: Optimises salesman routes, detects ghost visits, generates daily beat plans.
- **Graph nodes**: coverage_gaps → ghost_visits → route_optimization → missed_revenue
- **LLM calls**: chat_completion_json (route optimization)
- **Triggered by**: /beat-plan/{id} GET, /beat-plan/generate POST, /agent/run (agent_6)

---
## Endpoint Reference

### Auth

#### `POST /auth/login`
**User login**

> Authenticate a user (distributor, salesman, retailer) and return a JWT.
Validates against Supabase Auth if available, otherwise uses local check.

| Field | Detail |
|-------|--------|
| Auth | **Public** (no auth) |
| Role | any authenticated |
| Agent | — |
| Frontend component | Login page (to be built) |
| API client function | `login()` |

#### `POST /auth/register`
**Register a new distributor / user**

> Register a new user. Creates entry in Supabase Auth + users table.

| Field | Detail |
|-------|--------|
| Auth | **Public** (no auth) |
| Role | any authenticated |
| Agent | — |
| Frontend component | Registration page |
| API client function | `register()` |

#### `GET /auth/me`
**Get current authenticated user**

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | Session validation |
| API client function | `getMe()` |

#### `POST /auth/logout`
**Invalidate session**

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | Logout action |
| API client function | `—` |

### Orders

#### `POST /orders/`
**Create / capture a new order**

> Captures a new order from any channel.
Triggers Agent 1 (Trade Capture & Normalisation).
Sets status to PENDING_CONFIRMATION — retailer must confirm via chat before final commit.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | Agent 1 — Trade Capture & Normalisation |
| Frontend component | DistributorControlTower.tsx → Orders table |
| API client function | `createOrder() / listOrders()` |

#### `GET /orders/{order_id}`
**Get order details**

> Fetch a single order by ID.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | Agent 1 — Trade Capture & Normalisation |
| Frontend component | Order detail modal |
| API client function | `getOrder()` |

#### `GET /orders/`
**List orders for tenant**

> Paginated list of orders for the authenticated distributor's tenant.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | Agent 1 — Trade Capture & Normalisation |
| Frontend component | DistributorControlTower.tsx → Orders table |
| API client function | `createOrder() / listOrders()` |

#### `PATCH /orders/{order_id}/confirm`
**Retailer confirms order (YES flow)**

> Retailer confirmation — moves order from PENDING_CONFIRMATION to CONFIRMED.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | Agent 1 — Trade Capture & Normalisation |
| Frontend component | Confirm button |
| API client function | `confirmOrder()` |

#### `PATCH /orders/{order_id}/dispute`
**Retailer disputes parsed order**

> Retailer disputes the parsed order — flags it for manual review.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | Agent 1 — Trade Capture & Normalisation |
| Frontend component | Dispute button |
| API client function | `disputeOrder()` |

#### `DELETE /orders/{order_id}`
**Cancel an order**

> Cancel order in PENDING or CONFIRMED state.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | Agent 1 — Trade Capture & Normalisation |
| Frontend component | Order detail modal |
| API client function | `getOrder()` |

### Trust Score

#### `GET /trust-score/{retailer_id}`
**Get Trust Score for a retailer**

> Returns the current Trust Score + tier + trend for a retailer.
Powered by Agent 2 — Trust & Behaviour Scoring.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | DistributorControlTower.tsx, CreditDecisionPanel.tsx |
| API client function | `getTrustScore()` |

#### `GET /trust-score/{retailer_id}/breakdown`
**Get sub-score breakdown**

> Detailed sub-score breakdown for audit / retailer self-service.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | CreditDecisionPanel.tsx → radar chart |
| API client function | `getTrustBreakdown()` |

#### `GET /trust-score/{retailer_id}/history`
**Get Trust Score history (trend)**

> Rolling score history — used to render the trend graph on the dashboard.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | Trend line chart |
| API client function | `getTrustHistory()` |

#### `GET /trust-score/query/myscore`
**Retailer self-service: MYSCORE query**

> Endpoint triggered when a retailer sends 'MYSCORE' via Telegram/WhatsApp.
Returns a chat-friendly summary of their score + tier.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | Retailer self-service / Telegram MYSCORE |
| API client function | `—` |

#### `POST /trust-score/recalculate/{retailer_id}`
**Trigger score recalculation (admin)**

> Force-trigger Agent 2 to recompute trust score for a retailer.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | CreditDecisionPanel.tsx → Recalculate btn |
| API client function | `recalculateScore()` |

### Risk Alerts

#### `GET /risk-alerts/`
**List all active risk alerts for tenant**

> Returns all unacknowledged risk alerts for the distributor's tenant.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | DistributorControlTower.tsx → Risk Alerts panel |
| API client function | `listAlerts()` |

#### `GET /risk-alerts/{alert_id}`
**Get alert detail**

> Fetch detailed view of a single alert including recommended action card.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | Alert detail modal |
| API client function | `—` |

#### `PATCH /risk-alerts/{alert_id}/acknowledge`
**Acknowledge an alert**

> Mark alert as reviewed / acknowledged by distributor.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | Acknowledge button |
| API client function | `acknowledgeAlert()` |

#### `POST /risk-alerts/run-scan`
**Trigger a full risk scan (Agent 3)**

> Manually trigger Agent 3 to scan entire tenant ledger for new risks.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | Agent 3 — Risk, Scheme & Compliance Intelligence |
| Frontend component | Run Scan button |
| API client function | `triggerRiskScan()` |

### Beat Plan

#### `GET /beat-plan/{salesman_id}`
**Get daily beat plan for a salesman**

> Returns today's optimised beat plan for the given salesman. Generated by Agent 6.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | BeatIntelligencePanel.tsx |
| API client function | `getBeatPlan()` |

#### `GET /beat-plan/coverage/gaps`
**Get coverage gap report**

> Outlets not visited in the past N days — coverage gap report.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | BeatIntelligencePanel.tsx → heatmap |
| API client function | `getCoverageGaps()` |

#### `GET /beat-plan/ghost-visits/report`
**Ghost visit detection report**

> Salesmen who logged check-ins with zero orders and zero 2-way messages.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | BeatIntelligencePanel.tsx |
| API client function | `getGhostVisitReport()` |

#### `POST /beat-plan/generate`
**Generate beat plans for all salesmen (Agent 6)**

> Trigger Agent 6 to generate tomorrow's beat plans for all salesmen in tenant.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | Agent 6 — Beat Intelligence & Coverage |
| Frontend component | Generate Plans button |
| API client function | `generateBeatPlans()` |

#### `POST /beat-plan/checkin`
**Salesman logs a check-in at an outlet**

> Records a salesman check-in. GPS coordinates optionally provided.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | Flutter salesman app → check-in |
| API client function | `—` |

### Schemes

#### `POST /schemes/`
**Create a new scheme**

> Register a brand scheme. Feeds Agent 3 leakage detection.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | SchemeLeakagePanel.tsx |
| API client function | `listSchemes() / createScheme()` |

#### `POST /schemes/ingest-pdf`
**Upload scheme PDF — Agent 3 RAG extraction**

> Upload a brand scheme PDF. Agent 3 uses RAG to extract scheme rules.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Upload | `multipart/form-data` file upload |
| Frontend component | Upload PDF form |
| API client function | `—` |

#### `GET /schemes/`
**List all active schemes for tenant**

> Returns all active schemes for the distributor's tenant.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | SchemeLeakagePanel.tsx |
| API client function | `listSchemes() / createScheme()` |

#### `GET /schemes/leakage`
**Scheme leakage report (Agent 3)**

> Month-to-date scheme leakage report across all active schemes.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | SchemeLeakagePanel.tsx → leakage chart |
| API client function | `getSchemeLeakage()` |

#### `GET /schemes/{scheme_id}/pass-through`
**Per-retailer scheme pass-through for one scheme**

> Detailed per-retailer benefit pass-through for a single scheme.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | Scheme detail drill-down |
| API client function | `—` |

### Returns

#### `POST /returns/`
**Submit a return request**

> New return claim. Agent 3 classifies it as GENUINE / SUSPICIOUS / WITHIN_WINDOW / EXPIRED_WINDOW.
Credits above threshold go on hold for distributor approval.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | ExpiryCalendarPanel.tsx (returns section) |
| API client function | `listReturns() / submitReturn()` |

#### `POST /returns/{return_id}/evidence`
**Upload photo/voice evidence for a return**

> Upload supporting evidence — photo of damaged goods, batch sticker, etc.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Upload | `multipart/form-data` file upload |
| Frontend component | Evidence upload modal |
| API client function | `—` |

#### `PATCH /returns/{return_id}/approve`
**Distributor approves a return**

> Approve return — generates credit note in ledger.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | Approve button |
| API client function | `approveReturn()` |

#### `PATCH /returns/{return_id}/reject`
**Distributor rejects a return**

> Reject return — notifies retailer via Telegram with reason.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | Reject button |
| API client function | `rejectReturn()` |

#### `GET /returns/`
**List returns for tenant**

> Paginated returns list — default shows pending approvals.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | ExpiryCalendarPanel.tsx (returns section) |
| API client function | `listReturns() / submitReturn()` |

### Expiry

#### `GET /expiry/alerts`
**List near-expiry stock alerts**

> Lists all batches expiring within the threshold window.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | ExpiryCalendarPanel.tsx |
| API client function | `getExpiryAlerts()` |

#### `GET /expiry/batches`
**List all batches with expiry data**

> Full batch registry with expiry dates — for distributor review.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | ExpiryCalendarPanel.tsx → batch list |
| API client function | `listBatches()` |

#### `POST /expiry/batches`
**Register a new batch with expiry**

> Register a batch received from brand / manufacturer.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | ExpiryCalendarPanel.tsx → batch list |
| API client function | `listBatches()` |

#### `POST /expiry/claim-brand-return/{batch_id}`
**Initiate brand return claim for expiring batch**

> Distributor initiates a return claim to brand before the expiry window closes.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | Claim button |
| API client function | `—` |

### Trust Certificate

#### `POST /certificate/generate`
**Generate a Trust Certificate PDF**

> Generate a tamper-proof Trust Certificate for a retailer.
Contains Trust Score, tier, behavioural aggregates, and a QR code
linking to a read-only public verification page.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | Certificate generation button |
| API client function | `generateCertificate()` |

#### `GET /certificate/verify/{certificate_id}`
**Public verification of a Trust Certificate**

> Public read-only endpoint — linked via QR on the PDF.
No auth required; returns sanitised summary only.

| Field | Detail |
|-------|--------|
| Auth | **Public** (no auth) |
| Role | any authenticated |
| Agent | — |
| Frontend component | Public verification page (no auth) |
| API client function | `verifyCertificate()` |

#### `GET /certificate/{retailer_id}/history`
**List all certificates issued for a retailer**

> All certificates issued for a retailer — for audit.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | Certificate history list |
| API client function | `—` |

### Distributor

#### `GET /distributor/profile`
**Get distributor profile / control tower summary**

> Distributor control tower overview.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | DistributorControlTower.tsx → header |
| API client function | `getDistributorProfile()` |

#### `GET /distributor/dashboard/summary`
**Dashboard KPI summary**

> High-level KPIs for the distributor dashboard control tower.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | DistributorControlTower.tsx → KPI cards |
| API client function | `getDashboardSummary()` |

#### `GET /distributor/retailers`
**List all retailers for distributor**

> Paginated retailer list with Trust Score summary.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | DistributorControlTower.tsx → retailer table |
| API client function | `getRetailers()` |

#### `GET /distributor/salesmen`
**List all salesmen**

> List all salesmen with reliability scores.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | DistributorControlTower.tsx → salesmen list |
| API client function | `getSalesmen()` |

### Retailer

#### `POST /retailer/`
**Onboard a new retailer**

> Onboard a new retailer. Requires GSTN or Aadhaar-linked mobile.
Initial Trust Score set to 50 (neutral starting point).

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | Retailer onboarding form |
| API client function | `—` |

#### `GET /retailer/{retailer_id}`
**Get retailer profile**

> Full profile including current trust score and outstanding.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | Retailer profile page |
| API client function | `—` |

#### `GET /retailer/{retailer_id}/ledger`
**Get retailer transaction ledger**

> Paginated transaction history (orders, payments, returns) for a retailer.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | Retailer ledger view |
| API client function | `—` |

#### `PATCH /retailer/{retailer_id}/credit-limit`
**Update credit limit for a retailer**

> Manually update credit limit. Every change is logged to the audit trail.
Must be backed by a reason for audit compliance.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | Credit limit editor |
| API client function | `—` |

### Salesman

#### `GET /salesman/`
**List all salesmen with reliability scores**

> Salesmen list with Agent 6 reliability metrics.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | Salesman management |
| API client function | `—` |

#### `GET /salesman/{salesman_id}/reliability`
**Get reliability score for a salesman**

> Agent 6 computed reliability score with ghost visit metrics.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | BeatIntelligencePanel.tsx |
| API client function | `—` |

#### `GET /salesman/{salesman_id}/beat-history`
**Check-in and beat history**

> Historical check-ins + route coverage for a salesman.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | Beat history view |
| API client function | `—` |

#### `POST /salesman/`
**Add a new salesman**

> Register a new field salesman under the distributor tenant.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | Salesman management |
| API client function | `—` |

### AI Agent Pipeline

#### `POST /agent/run`
**Manually trigger an AI agent run**

> Trigger a specific agent in the LangGraph pipeline.
In production, agents are triggered automatically by events.
This endpoint is for debugging and manual runs.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | Agent 6 — Beat Intelligence & Coverage |
| Frontend component | Agent debug panel |
| API client function | `runAgent()` |

#### `GET /agent/status/{run_id}`
**Get the status of an agent run**

> Poll the status of an async agent graph run.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | Agent status poller |
| API client function | `—` |

#### `POST /agent/parse-message`
**Test Agent 1: parse a raw chat message**

> Dev/test endpoint: feed a raw text message to Agent 1 and return the
structured trade event it extracts. Useful for testing Hindi/Hinglish parsing.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | Agent 1 — Trade Capture & Normalisation |
| Frontend component | Agent test panel |
| API client function | `parseMessage()` |

### Telegram Webhook

#### `POST /webhook/telegram/`
**Telegram Bot webhook receiver**

> Receives incoming Telegram updates via webhook.
Validates the secret token, then routes to Agent 1 for parsing.

Telegram update types handled:
- message (text, photo, voice)
- callback_query (inline button responses — YES / DISPUTE)

| Field | Detail |
|-------|--------|
| Auth | **Public** (no auth) |
| Role | any authenticated |
| Agent | Agent 1 — Trade Capture & Normalisation |
| Frontend component | Telegram Bot (external) |
| API client function | `—` |

#### `POST /webhook/telegram/set-webhook`
**Register webhook URL with Telegram**

> One-time setup: register our FastAPI URL as the Telegram Bot webhook.
Call this during deployment.

| Field | Detail |
|-------|--------|
| Auth | **Public** (no auth) |
| Role | any authenticated |
| Agent | Agent 1 — Trade Capture & Normalisation |
| Frontend component | Deployment setup |
| API client function | `—` |

### ONDC

#### `POST /ondc/on_search`
**ONDC on_search callback**

> ONDC on_search — returns catalog items. Mock in MVP.

| Field | Detail |
|-------|--------|
| Auth | **Public** (no auth) |
| Role | any authenticated |
| Agent | — |
| Frontend component | ONDC integration (mock MVP) |
| API client function | `—` |

#### `POST /ondc/on_select`
**ONDC on_select callback**

> ONDC on_select — confirms item selection.

| Field | Detail |
|-------|--------|
| Auth | **Public** (no auth) |
| Role | any authenticated |
| Agent | — |
| Frontend component | ONDC integration (mock MVP) |
| API client function | `—` |

#### `POST /ondc/on_init`
**ONDC on_init callback**

> ONDC on_init — order initialization.

| Field | Detail |
|-------|--------|
| Auth | **Public** (no auth) |
| Role | any authenticated |
| Agent | — |
| Frontend component | ONDC integration (mock MVP) |
| API client function | `—` |

#### `POST /ondc/on_confirm`
**ONDC on_confirm callback**

> ONDC on_confirm — order confirmed.

| Field | Detail |
|-------|--------|
| Auth | **Public** (no auth) |
| Role | any authenticated |
| Agent | — |
| Frontend component | ONDC integration (mock MVP) |
| API client function | `—` |

#### `GET /ondc/status`
**ONDC integration status**

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | ONDC integration (mock MVP) |
| API client function | `—` |

### Analytics

#### `GET /analytics/trust-distribution`
**Trust score distribution across retailers**

> Histogram of trust scores — used for dashboard heatmap.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | DistributorControlTower.tsx → pie chart |
| API client function | `getTrustDistribution()` |

#### `GET /analytics/revenue-heatmap`
**Revenue heatmap by route/zone**

> Route-level revenue heatmap data for dashboard.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | Revenue heatmap (v2) |
| API client function | `—` |

#### `GET /analytics/quick-commerce-threat`
**Quick commerce threat monitor**

> QC price monitoring — shows where Blinkit/Zepto undercut retailer margins.
Background job scrapes QC prices; this endpoint surfaces results.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | Quick Commerce Threat Map (v2) |
| API client function | `—` |

#### `GET /analytics/secondary-sales-estimate`
**Estimated secondary sales by SKU**

> Inferred sell-through velocity by SKU/region using reorder frequency. Agent 5 output.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | Secondary sales panel (v2) |
| API client function | `—` |

#### `GET /analytics/audit-trail`
**SHA-256 hash-chain audit log**

> Immutable audit trail secured by SHA-256 hash chain.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | AuditTrailPanel.tsx |
| API client function | `getAuditTrail()` |

### PDF Parser

#### `POST /pdf/parse-invoice`
**Parse invoice PDF to extract batch/expiry/SKU data**

> Upload invoice PDF or image. OCR extracts:
- SKU names, quantities, unit prices
- Batch numbers
- Expiry dates (validated — must be future)
- Invoice date, supplier GSTIN

Extracted data is confirmed with the user before committing to ledger.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Upload | `multipart/form-data` file upload |
| Frontend component | Invoice upload form |
| API client function | `—` |

#### `POST /pdf/parse-scheme`
**Parse scheme PDF for rules extraction (Agent 3 RAG)**

> Upload a brand scheme PDF. Uses RAG (pdfplumber + embeddings) to extract scheme rules.
Extracted rules are fed to Agent 3 leakage detection.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Upload | `multipart/form-data` file upload |
| Frontend component | Scheme PDF upload |
| API client function | `—` |

#### `GET /pdf/extraction-status/{job_id}`
**Check PDF extraction job status**

> Poll the status of an async PDF extraction job.

| Field | Detail |
|-------|--------|
| Auth | JWT required |
| Role | any authenticated |
| Agent | — |
| Frontend component | Extraction status poller |
| API client function | `—` |

---
## Frontend Component → Endpoint Mapping

| Component | Endpoints Used |
|-----------|---------------|
| Acknowledge button | `/risk-alerts/{alert_id}/acknowledge` |
| Agent debug panel | `/agent/run` |
| Agent status poller | `/agent/status/{run_id}` |
| Agent test panel | `/agent/parse-message` |
| Alert detail modal | `/risk-alerts/{alert_id}` |
| Approve button | `/returns/{return_id}/approve` |
| AuditTrailPanel.tsx | `/analytics/audit-trail` |
| Beat history view | `/salesman/{salesman_id}/beat-history` |
| BeatIntelligencePanel.tsx | `/beat-plan/{salesman_id}`, `/beat-plan/ghost-visits/report`, `/salesman/{salesman_id}/reliability` |
| BeatIntelligencePanel.tsx → heatmap | `/beat-plan/coverage/gaps` |
| Certificate generation button | `/certificate/generate` |
| Certificate history list | `/certificate/{retailer_id}/history` |
| Claim button | `/expiry/claim-brand-return/{batch_id}` |
| Confirm button | `/orders/{order_id}/confirm` |
| Credit limit editor | `/retailer/{retailer_id}/credit-limit` |
| CreditDecisionPanel.tsx → Recalculate btn | `/trust-score/recalculate/{retailer_id}` |
| CreditDecisionPanel.tsx → radar chart | `/trust-score/{retailer_id}/breakdown` |
| Deployment setup | `/webhook/telegram/set-webhook` |
| Dispute button | `/orders/{order_id}/dispute` |
| DistributorControlTower.tsx → KPI cards | `/distributor/dashboard/summary` |
| DistributorControlTower.tsx → Orders table | `/orders` |
| DistributorControlTower.tsx → Risk Alerts panel | `/risk-alerts` |
| DistributorControlTower.tsx → header | `/distributor/profile` |
| DistributorControlTower.tsx → pie chart | `/analytics/trust-distribution` |
| DistributorControlTower.tsx → retailer table | `/distributor/retailers` |
| DistributorControlTower.tsx → salesmen list | `/distributor/salesmen` |
| DistributorControlTower.tsx, CreditDecisionPanel.tsx | `/trust-score/{retailer_id}` |
| Evidence upload modal | `/returns/{return_id}/evidence` |
| ExpiryCalendarPanel.tsx | `/expiry/alerts` |
| ExpiryCalendarPanel.tsx (returns section) | `/returns` |
| ExpiryCalendarPanel.tsx → batch list | `/expiry/batches` |
| Extraction status poller | `/pdf/extraction-status/{job_id}` |
| Flutter salesman app → check-in | `/beat-plan/checkin` |
| Generate Plans button | `/beat-plan/generate` |
| Invoice upload form | `/pdf/parse-invoice` |
| Login page (to be built) | `/auth/login` |
| Logout action | `/auth/logout` |
| ONDC integration (mock MVP) | `/ondc` |
| Order detail modal | `/orders/{order_id}` |
| Public verification page (no auth) | `/certificate/verify/{certificate_id}` |
| Quick Commerce Threat Map (v2) | `/analytics/quick-commerce-threat` |
| Registration page | `/auth/register` |
| Reject button | `/returns/{return_id}/reject` |
| Retailer ledger view | `/retailer/{retailer_id}/ledger` |
| Retailer onboarding form | `/retailer` |
| Retailer profile page | `/retailer/{retailer_id}` |
| Retailer self-service / Telegram MYSCORE | `/trust-score/query/myscore` |
| Revenue heatmap (v2) | `/analytics/revenue-heatmap` |
| Run Scan button | `/risk-alerts/run-scan` |
| Salesman management | `/salesman` |
| Scheme PDF upload | `/pdf/parse-scheme` |
| Scheme detail drill-down | `/schemes/{scheme_id}/pass-through` |
| SchemeLeakagePanel.tsx | `/schemes` |
| SchemeLeakagePanel.tsx → leakage chart | `/schemes/leakage` |
| Secondary sales panel (v2) | `/analytics/secondary-sales-estimate` |
| Session validation | `/auth/me` |
| Telegram Bot (external) | `/webhook/telegram` |
| Trend line chart | `/trust-score/{retailer_id}/history` |
| Upload PDF form | `/schemes/ingest-pdf` |

---
## Database Tables Required (Supabase)

| Table | Used By | Purpose |
|-------|---------|---------|
| `users` | Auth | User accounts with role |
| `orders` | Orders, Agent 1-3 | Trade ledger |
| `trust_scores` | Trust Score, Agent 2 | CIBIL-style scores per retailer |
| `risk_alerts` | Risk Alerts, Agent 3 | Generated risk alerts |
| `schemes` | Schemes, Agent 3 | Brand scheme definitions |
| `returns` | Returns, Agent 3 | Return requests + classification |
| `batches` | Expiry, Agent 3 | Batch registry with expiry dates |
| `outlets` | Beat Plan, Agent 6 | Outlet/retailer master list |
| `beat_checkins` | Beat Plan, Agent 6 | Salesman check-in logs |
| `salesmen` | Salesman, Beat Plan | Field staff registry |
| `retailers` | Retailer, Distributor | Retailer profiles |
| `tenants` | Distributor | Multi-tenant config |
| `audit_events` | Analytics | SHA-256 hash chain audit trail |
| `certificates` | Certificate | Trust Certificate records |