# Task 2: Order Processing & Trust Score Integration

## Overview
Build the complete order lifecycle from chat capture through confirmation, and integrate the CIBIL-style Trust Score system across all relevant UI surfaces. Connect Agent 1 (Trade Capture) and Agent 2 (Trust Scoring) to the frontend dashboard.

## Current State
- Backend order endpoints are functional with DB fallback via Supabase
- Agent 1 (Trade Capture) is fully implemented as LangGraph pipeline
- Agent 2 (Trust Scoring) is fully implemented with weighted composite scoring
- Frontend has `listOrders()` and `getOrder()` API functions defined
- Trust Score API functions are defined (`getTrustScore`, `getTrustBreakdown`, `getTrustHistory`, `recalculateScore`) but never called
- DistributorControlTower maps orders with placeholder retailer names (`"Retailer " + o.retailer_id.slice(0, 4)`)
- No order creation UI exists on frontend
- Trust Score data never displayed in any UI component

## Backend Endpoints Involved
| Method | Path | Status | Action Needed |
|--------|------|--------|---------------|
| POST | `/api/v1/orders/` | Functional | Build order creation UI |
| GET | `/api/v1/orders/{id}` | Functional | Wire to order detail view |
| GET | `/api/v1/orders/` | Functional | Wire to order list with pagination |
| PATCH | `/api/v1/orders/{id}/confirm` | Functional | Wire confirm button |
| PATCH | `/api/v1/orders/{id}/dispute` | Functional | Wire dispute flow |
| DELETE | `/api/v1/orders/{id}` | Functional | Wire cancel order |
| GET | `/api/v1/trust-score/{retailer_id}` | Functional (falls to default 50) | Wire to retailer cards |
| GET | `/api/v1/trust-score/{retailer_id}/breakdown` | Functional (falls to defaults) | Wire to score detail |
| GET | `/api/v1/trust-score/{retailer_id}/history` | Functional (with fallback) | Wire to trend chart |
| GET | `/api/v1/trust-score/query/myscore` | Stub (hardcoded) | Implement retailer lookup |
| POST | `/api/v1/trust-score/recalculate/{retailer_id}` | Functional | Wire recalculate button |
| POST | `/api/v1/agent/parse-message` | Functional | Wire message testing UI |

## Tasks

### 2.1 Build Order Management UI
- Create order list page/table with pagination using `GET /orders/`
- Filter by retailer_id, status_filter (pending, confirmed, disputed, cancelled)
- Display order details: retailer name (resolved, not placeholder), items, total_amount, payment_type, channel, created_at, status
- Build order detail modal/page calling `GET /orders/{id}` showing full itemized breakdown
- Wire confirm button to `PATCH /orders/{id}/confirm`
- Wire dispute button to `PATCH /orders/{id}/dispute` with reason input
- Wire cancel button to `DELETE /orders/{id}` with confirmation dialog
- Add real-time status indicators (pending confirmation, confirmed, disputed)

### 2.2 Integrate Trust Scores into Distributor Dashboard
- Replace hardcoded retailer data with Trust Score integration
- For each retailer in the list, fetch `GET /trust-score/{retailer_id}` and display:
  - Composite score (0-100) with visual gauge/progress bar
  - Tier badge (A/B/C/D with color coding: A=green, B=blue, C=orange, D=red)
  - Trend indicator (UP/DOWN/STABLE with arrows)
- Build Trust Score detail modal showing breakdown from `GET /trust-score/{retailer_id}/breakdown`:
  - Payment discipline (30%)
  - Order consistency (20%)
  - Cancellation rate (15%)
  - Return frequency (15%)
  - Communication reliability (10%)
  - Trade stability (10%)
- Build Trust Score history chart using `GET /trust-score/{retailer_id}/history?days=90` with Recharts line chart
- Add "Recalculate Score" button calling `POST /trust-score/recalculate/{retailer_id}`

### 2.3 Build Credit Decision Panel with Real Data Integration
- Replace hardcoded order data in CreditDecisionPanel with real orders from `GET /orders/` filtered by payment_type=credit
- Cross-reference each credit order with retailer's trust score and outstanding balance
- Implement decision logic based on trust tiers:
  - Tier A (80-100): Auto-approve with green indicator
  - Tier B (60-79): Conditional approval with warning
  - Tier C (40-59): Flag for manual review
  - Tier D (0-39): Block with red indicator
- Wire action buttons to actual API calls:
  - "Approve" → `PATCH /orders/{id}/confirm`
  - "Reduce Limit" → `PATCH /retailer/{id}/credit-limit`
  - "BLOCK + NUDGE" → `PATCH /orders/{id}/dispute` + collection message draft
  - "Send via Telegram" → trigger Telegram message via backend
- Replace hardcoded Telegram draft with AI-generated collection nudge from Agent 4 output

### 2.4 Implement Order Volume Trend Chart
- Replace stub SVG placeholder in DistributorControlTower with Recharts component
- Fetch orders grouped by date from `GET /orders/` with date range params
- Build line/bar chart showing order volume over time (7/30/90 day views)
- Add overlay for credit vs cash order distribution
- Add revenue totals per period

### 2.5 Implement Credit Distribution Visualization
- Replace stub chart placeholder with pie/donut chart
- Show distribution of orders by payment_type (credit, cash, partial)
- Show distribution of retailers by trust tier (A/B/C/D)
- Make charts interactive with hover tooltips showing counts and percentages

### 2.6 Fix Retailer Name Resolution
- Replace placeholder `"Retailer " + o.retailer_id.slice(0, 4)` mapping
- Join order data with retailer data to show actual retailer names
- Include retailer trust tier badge next to name in order list

### 2.7 Build MYSCORE Retailer Self-Service
- Fix `GET /trust-score/query/myscore` stub to look up retailer by telegram_chat_id
- Build simple retailer-facing page/component showing:
  - Current Trust Score and tier
  - Brief explanation of score factors
  - Tips for improving score
- This is the chat-equivalent of "MYSCORE" query for the web dashboard

## Acceptance Criteria
- Orders can be listed, viewed, confirmed, disputed, and cancelled from the UI
- Trust scores are displayed for every retailer with visual tier indicators
- Trust score breakdown shows all 6 sub-scores with correct weights
- Trust score history chart shows 90-day trend
- Credit Decision Panel uses real data and wires actions to backend
- Order volume trend and credit distribution charts are populated with real data
- Retailer names are resolved correctly (no placeholders)
- MYSCORE self-service works for retailers

## Dependencies
- Task 1 completed (auth, retailer management working)
- Seed data with orders and trust scores in PostgreSQL
- Agent 1 and Agent 2 LangGraph pipelines operational
- Supabase connection confirmed
