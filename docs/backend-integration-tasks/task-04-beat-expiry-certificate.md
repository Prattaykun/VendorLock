# Task 4: Beat Intelligence, Expiry & Returns, Certificate Integration

## Overview
Connect the beat intelligence system (Agent 6), expiry monitoring, returns reconciliation engine, and Trust Certificate generator to the frontend. Replace all mock data in the BeatIntelligencePanel, ExpiryCalendarPanel, and implement the certificate generation/verification flow.

## Current State
- Agent 6 (Beat Intelligence) is mostly implemented with coverage gap and ghost visit detection
- `GET /beat-plan/{salesman_id}` is functional with fallback
- `GET /beat-plan/coverage/gaps` is a stub returning empty
- `GET /beat-plan/ghost-visits/report` is a stub returning empty
- `POST /beat-plan/generate` is a stub returning `{"queued": true}`
- `POST /beat-plan/checkin` is functional with fallback
- Expiry endpoints are functional with fallback except `POST /expiry/claim-brand-return` (stub)
- Returns endpoints are functional except `POST /returns/{id}/evidence` (stub)
- Certificate endpoints are all stubs (hardcoded responses, no PDF/QR generation)
- Frontend BeatIntelligencePanel calls `getBeatPlan("sm-1")` with hardcoded ID, falls back to mock
- Frontend ExpiryCalendarPanel calls `listBatches()` but uses hardcoded calendar grid and static alerts
- Certificate generation and verification pages don't exist on frontend

## Backend Endpoints Involved
| Method | Path | Status | Action Needed |
|--------|------|--------|---------------|
| GET | `/api/v1/beat-plan/{salesman_id}` | Functional (with fallback) | Wire with dynamic salesman selection |
| GET | `/api/v1/beat-plan/coverage/gaps` | Stub (empty) | Implement gap detection |
| GET | `/api/v1/beat-plan/ghost-visits/report` | Stub (empty) | Implement ghost visit detection |
| POST | `/api/v1/beat-plan/generate` | Stub (queued) | Implement actual generation |
| POST | `/api/v1/beat-plan/checkin` | Functional | Wire check-in UI |
| GET | `/api/v1/expiry/alerts` | Functional (with fallback) | Wire to expiry alerts |
| GET | `/api/v1/expiry/batches` | Functional (with fallback) | Wire to batch list |
| POST | `/api/v1/expiry/batches` | Functional | Wire batch registration |
| POST | `/api/v1/expiry/claim-brand-return/{batch_id}` | Stub | Implement claim workflow |
| POST | `/api/v1/returns/` | Functional | Wire return submission |
| POST | `/api/v1/returns/{id}/evidence` | Stub | Implement file upload |
| PATCH | `/api/v1/returns/{id}/approve` | Functional | Wire approve action |
| PATCH | `/api/v1/returns/{id}/reject` | Functional | Wire reject action |
| GET | `/api/v1/returns/` | Functional | Wire returns list |
| POST | `/api/v1/certificate/generate` | Stub (hardcoded) | Implement PDF + QR generation |
| GET | `/api/v1/certificate/verify/{id}` | Stub (hardcoded) | Implement verification |
| GET | `/api/v1/certificate/{retailer_id}/history` | Stub (empty) | Implement history query |

## Tasks

### 4.1 Implement Beat Intelligence Panel with Real Data
- Replace hardcoded salesman ID `"sm-1"` with dynamic selection from salesman dropdown
- Fetch salesmen list from `GET /distributor/salesmen` and populate selector
- Call `GET /beat-plan/{salesman_id}` with selected salesman ID
- Display beat plan table with:
  - Outlet name and address
  - Priority level (based on trust score, near-expiry SKUs, scheme-active items)
  - Last visit date
  - Recommended SKUs to push
- Replace mock coverage zones with real data from outlets table
- Build coverage heatmap on Leaflet map using real outlet locations and visit data

### 4.2 Implement Coverage Gap Detection
- Fix `GET /beat-plan/coverage/gaps` stub to:
  - Query outlets table for all active outlets
  - Join with beat_checkins to find outlets not visited in N days
  - Calculate missed revenue estimates from historical order data
  - Return structured gap report with outlet, days since visit, estimated revenue loss
- Wire to UI showing coverage gaps table with:
  - Outlet name and route
  - Days since last visit
  - Risk level (based on outlet value)
  - Estimated missed revenue
- Add "Generate Beat Plans" button calling `POST /beat-plan/generate`

### 4.3 Implement Ghost Visit Detection
- Fix `GET /beat-plan/ghost-visits/report` stub to:
  - Query beat_checkins for check-ins with no associated orders or chat messages
  - Group by salesman and calculate ghost visit rate
  - Estimate missed revenue from ghost visits
  - Return structured report with salesman, ghost visit count, total check-ins, missed revenue
- Wire to UI showing ghost visit report:
  - Salesman name
  - Ghost visits vs total check-ins
  - Ghost visit percentage
  - Estimated revenue impact
  - Alert severity based on ghost visit rate threshold

### 4.4 Implement Salesman Check-In UI
- Build check-in form for salesmen calling `POST /beat-plan/checkin`
- Fields: salesman_id, outlet_id, optional GPS coordinates (lat/lon from browser geolocation)
- Show check-in confirmation with timestamp
- Display recent check-in history for the salesman
- Add duplicate check-in prevention (same outlet within short time window)

### 4.5 Implement Expiry Monitoring Dashboard
- Wire `GET /expiry/alerts?days_threshold=90` to expiry alert cards in ExpiryCalendarPanel
- Display alerts sorted by urgency (days until expiry/return window close)
- Show batch number, product name, quantity, expiry date, brand return window deadline
- Color-code alerts:
  - Red: Within 7 days of return window close
  - Orange: Within 30 days of expiry
  - Yellow: Within 90 days of expiry
- Add "File Brand Return Claim" button calling `POST /expiry/claim-brand-return/{batch_id}`

### 4.6 Implement Batch Management
- Wire `GET /expiry/batches` to batch list table showing:
  - Batch number, product, quantity, manufacturing date, expiry date
  - Days until expiry
  - Return window status (within/outside)
- Build "Register Batch" form calling `POST /expiry/batches`:
  - Product selection
  - Batch number
  - Quantity
  - Manufacturing date
  - Expiry date
  - Brand return window days
- Implement batch search/filter by product, expiry range, return window status

### 4.7 Implement Brand Return Claim Workflow
- Fix `POST /expiry/claim-brand-return/{batch_id}` stub to:
  - Create return claim record in database
  - Generate claim reference number
  - Calculate claimable amount (quantity x unit price)
  - Set status as PENDING
  - Trigger notification to distributor
- Wire claim confirmation UI showing:
  - Claim reference number
  - Claimable amount
  - Expected resolution timeline
  - Status tracking

### 4.8 Implement Returns Management
- Wire `GET /returns/` to returns list table with:
  - Return ID, retailer name, product, quantity, reason, classification, status, credit note amount
  - Filter by status (pending, approved, rejected)
- Build "Submit Return" form calling `POST /returns/`:
  - Retailer selection
  - Order reference
  - Product and quantity
  - Reason (near-expiry, damaged, wrong delivery, other)
  - Evidence upload (photo/voice note)
- Wire approve button to `PATCH /returns/{id}/approve`
- Wire reject button to `PATCH /returns/{id}/reject` with reason input
- Show return classification result (GENUINE, WITHIN_WINDOW, EXPIRED_WINDOW, SUSPICIOUS) from Agent 3 analysis

### 4.9 Implement Return Evidence Upload
- Fix `POST /returns/{id}/evidence` stub to:
  - Accept file upload (image, voice note)
  - Save to S3 or local storage
  - Return file URL
  - Link evidence to return record
- Build file upload UI in return submission form with preview
- Show uploaded evidence in return detail view

### 4.10 Implement Trust Certificate Generation
- Fix `POST /certificate/generate` stub to:
  - Fetch retailer's trust score, tier, and history
  - Calculate payment discipline %, return rate vs peer average, consistency index
  - Generate PDF using ReportLab containing:
    - Retailer name and ID
    - Trust Score and tier
    - Score breakdown
    - Months of history
    - Payment discipline percentage
    - Return rate comparison
    - Consistency index
    - QR code linking to verification URL
  - Upload PDF to S3
  - Generate QR code with verification URL
  - Save certificate record to database
  - Return certificate ID, PDF URL, QR URL
- Build "Generate Certificate" button on retailer profile page
- Show certificate preview/download after generation

### 4.11 Implement Trust Certificate Verification
- Fix `GET /certificate/verify/{certificate_id}` stub to:
  - Fetch certificate from database
  - Validate hash chain integrity
  - Return certificate data with verification status
  - Include tamper detection flag
- Build public verification page at `/certificate/verify/{id}` (public route, no auth required)
- Display certificate details with verification badge
- Show QR scan result with trust score summary

### 4.12 Implement Certificate History
- Fix `GET /certificate/{retailer_id}/history` stub to query certificates table
- Build certificate history list on retailer profile showing:
  - Certificate ID, generation date, trust score at time of generation
  - Download link for each certificate
  - Verification link

## Acceptance Criteria
- Beat plan displays real data with dynamic salesman selection
- Coverage gaps are detected and displayed with missed revenue estimates
- Ghost visits are detected and reported per salesman
- Salesman check-in works with GPS coordinates
- Expiry alerts show real batch data with color-coded urgency
- Batches can be registered and searched
- Brand return claims can be filed and tracked
- Returns can be submitted, approved, and rejected with evidence
- Trust certificates are generated as PDFs with QR codes
- Certificate verification works publicly via QR scan
- Certificate history is accessible per retailer

## Dependencies
- Task 1 and 2 completed (auth, retailers, orders, trust scores working)
- Leaflet map configured with outlet coordinates
- ReportLab installed for PDF generation
- QR code generation library available (qrcode or similar)
- S3 bucket configured (or local storage fallback for MVP)
- Seed data with outlets, beat_checkins, batches, returns
