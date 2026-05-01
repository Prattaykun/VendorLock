# Task 3: Risk Alerts, Scheme Leakage & Analytics Integration

## Overview
Connect the risk intelligence engine (Agent 3), scheme leakage detection, and analytics dashboards to the frontend. Replace all hardcoded analytics data with real API-driven metrics and implement the scheme leakage monitoring panel.

## Current State
- Agent 3 (Risk Intelligence) is mostly implemented with LLM-driven credit risk, scheme leakage, return validation, and expiry intelligence nodes
- `POST /risk-alerts/run-scan` is functional and invokes LangGraph
- `GET /risk-alerts/` and `GET /risk-alerts/{id}` are functional with fallback
- `PATCH /risk-alerts/{id}/acknowledge` is functional
- `GET /schemes/leakage` is a stub returning empty list
- `GET /schemes/{id}/pass-through` is a stub returning empty
- `POST /schemes/ingest-pdf` is a stub returning QUEUED_FOR_EXTRACTION
- `GET /analytics/pass-through-metrics` returns hardcoded simulated data
- `GET /analytics/revenue-heatmap` returns empty
- `GET /analytics/quick-commerce-threat` returns empty
- `GET /analytics/secondary-sales-estimate` returns empty
- `GET /analytics/trust-distribution` is functional (calls Supabase)
- Frontend SchemeLeakagePanel uses hardcoded static data (VitaGlow, CleanSweep, NutriCrunch)
- Frontend PassThroughAnalytics has its own mock fallback
- Scheme upload page has no API integration

## Backend Endpoints Involved
| Method | Path | Status | Action Needed |
|--------|------|--------|---------------|
| GET | `/api/v1/risk-alerts/` | Functional (with fallback) | Wire to alert list UI |
| GET | `/api/v1/risk-alerts/{id}` | Functional (with fallback) | Wire to alert detail |
| PATCH | `/api/v1/risk-alerts/{id}/acknowledge` | Functional | Wire acknowledge button |
| POST | `/api/v1/risk-alerts/run-scan` | Functional | Wire "Run Scan" button |
| POST | `/api/v1/schemes/` | Functional (with fallback) | Connect scheme creation form |
| POST | `/api/v1/schemes/ingest-pdf` | Stub | Implement PDF parsing pipeline |
| GET | `/api/v1/schemes/` | Functional (with fallback) | Wire to scheme list |
| GET | `/api/v1/schemes/leakage` | Stub (empty) | Implement leakage calculation |
| GET | `/api/v1/schemes/{id}/pass-through` | Stub (empty) | Implement per-retailer tracking |
| GET | `/api/v1/analytics/pass-through-metrics` | Stub (hardcoded) | Implement real aggregation |
| GET | `/api/v1/analytics/trust-distribution` | Functional | Wire to trust heatmap |
| GET | `/api/v1/analytics/revenue-heatmap` | Stub (empty) | Implement revenue aggregation |
| GET | `/api/v1/analytics/quick-commerce-threat` | Stub (empty) | Implement or mark as v2 |
| GET | `/api/v1/analytics/secondary-sales-estimate` | Stub (empty) | Implement or mark as v2 |
| POST | `/api/v1/agent/run` | Functional | Wire agent trigger UI |

## Tasks

### 3.1 Implement Risk Alerts Dashboard
- Build risk alerts list view calling `GET /risk-alerts/` with filters:
  - severity: INFO, WARNING, CRITICAL
  - alert_type: credit_risk, scheme_leakage, return_fraud, expiry_risk, gst_compliance
  - acknowledged/unacknowledged toggle
- Display alerts as cards with:
  - Severity badge (color-coded: INFO=blue, WARNING=orange, CRITICAL=red)
  - Alert title and description
  - Rupee impact amount
  - Timestamp
  - Related entity (retailer, scheme, batch)
- Wire "Acknowledge" button to `PATCH /risk-alerts/{id}/acknowledge`
- Build alert detail modal from `GET /risk-alerts/{id}` showing full context
- Add "Run Risk Scan" button calling `POST /risk-alerts/run-scan` with loading state
- Implement alert count badge in dashboard header (unacknowledged count)

### 3.2 Implement Scheme Leakage Panel with Real Data
- Replace hardcoded leakage data in SchemeLeakagePanel with real data from `GET /schemes/leakage?period_days=30`
- Display MTD (month-to-date) total leakage amount from API
- Build leakage bar chart showing leakage per scheme (replace hardcoded VitaGlow/CleanSweep/NutriCrunch)
- Build retailer leakage hotspots table from API data (replace static data)
- Add leakage trend indicator (increasing/decreasing vs previous period)
- Show leakage as percentage and rupee amount

### 3.3 Implement Scheme Pass-Through Analytics
- Fix `GET /analytics/pass-through-metrics` to return real aggregated data from PostgreSQL
- Build pass-through gauge showing overall pass-through percentage
- Build regional leakage map (can use simple table if map is complex)
- Implement trend velocity chart with Recharts showing pass-through rate over time
- Build SKU fragility bars showing which SKUs have highest leakage
- Build AI advisory banner with recommendations from Agent 4 output
- Replace custom SVG charts with Recharts for consistency

### 3.4 Implement Scheme Management
- Build scheme list view from `GET /schemes/` showing:
  - Scheme name, brand, discount percentage
  - Valid from/to dates
  - Status (active/expired)
  - Associated products
- Build "Create Scheme" form calling `POST /schemes/` with fields:
  - brand, scheme_name, description
  - discount_percent, benefit_pass_through_percent
  - valid_from, valid_to
  - applicable products/SKUs (multi-select)
- Implement scheme detail view with pass-through breakdown from `GET /schemes/{id}/pass-through`

### 3.5 Implement Scheme PDF Upload & RAG Extraction
- Fix `POST /schemes/ingest-pdf` stub to actually:
  - Accept file upload (multipart/form-data)
  - Save PDF to S3 or local storage
  - Extract text using pdfplumber
  - Chunk and embed into FAISS vector store
  - Feed to Agent 3 for scheme rule extraction
- Connect scheme upload page (`/scheme/upload`) to the API endpoint
- Replace simulated upload progress with real upload state
- Show extraction status from `GET /pdf/extraction-status/{job_id}`
- Display extracted scheme rules for review before activation

### 3.6 Implement PDF Parser Endpoints
- Fix `POST /pdf/parse-invoice` stub:
  - Accept invoice PDF/image upload
  - Save to S3
  - Run OCR with pytesseract or pdfplumber
  - Extract entities (batch numbers, expiry dates, quantities, prices)
  - Return structured data for review
- Fix `POST /pdf/parse-scheme` stub:
  - Accept scheme PDF upload
  - Extract scheme rules (discount %, eligibility, validity)
  - Return structured scheme object for creation

### 3.7 Implement Revenue Heatmap
- Fix `GET /analytics/revenue-heatmap` to aggregate revenue by route/zone from orders table
- Build heatmap visualization (can use table with conditional formatting if Leaflet heatmap is complex)
- Show revenue per zone with color intensity
- Add period selector (7/30/90 days)

### 3.8 Implement Trust Distribution Analytics
- Wire `GET /analytics/trust-distribution` to a visualization component
- Show trust score distribution as histogram (count of retailers per score range)
- Show tier distribution as pie chart (A/B/C/D percentages)
- Add filters by route, zone, or time period

### 3.9 Build Agent Pipeline Trigger UI
- Create a developer/admin panel to manually trigger agents via `POST /agent/run`
- Dropdown to select agent (agent1 through agent6)
- JSON input area for custom payload
- Display agent run results in formatted output
- Show run history with status

## Acceptance Criteria
- Risk alerts are displayed with real data, filterable, and acknowledgeable
- Scheme leakage panel shows real leakage amounts and per-scheme breakdown
- Pass-through analytics dashboard uses real aggregated data
- Schemes can be created, listed, and viewed with pass-through details
- Scheme PDF upload triggers real extraction pipeline
- Revenue heatmap shows real revenue data by zone
- Trust distribution visualization shows real score distribution
- Agent pipeline can be manually triggered from UI

## Dependencies
- Task 1 and 2 completed
- FAISS vector store configured and accessible
- S3 bucket configured for file uploads (or local fallback for MVP)
- pdfplumber and pytesseract installed in backend environment
- Seed data with schemes, returns, and risk alerts in PostgreSQL
