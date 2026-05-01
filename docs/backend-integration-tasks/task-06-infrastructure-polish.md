# Task 6: Infrastructure, Audit Trail, ONDC & Dashboard Polish

## Overview
Implement the remaining infrastructure components: SHA-256 hash-chain audit trail, background job scheduling, ONDC integration scaffolding, and complete the unfinished dashboard pages (NBFC, HORECA, Retailer, Company). Add data export capabilities, error handling improvements, and final polish for production readiness.

## Current State
- Audit trail endpoint `GET /analytics/audit-trail` is functional with fallback
- `create_audit_event()` in supabase_service.py implements SHA-256 hash chaining
- ONDC endpoints are all mock MVP stubs
- No background job scheduler exists (no Celery/APScheduler)
- MongoDB and Redis are configured but unused
- `/agent`, `/nbfc`, `/horeca`, `/retailer` pages are stubs with default Next.js templates
- `/company` page has hardcoded stats and empty Sidebar/Navbar components
- No data export functionality (CSV, PDF reports)
- No error boundary or global error handling on frontend
- `components/company/Sidebar.tsx` and `components/company/Navbar.tsx` are empty files

## Backend Endpoints Involved
| Method | Path | Status | Action Needed |
|--------|------|--------|---------------|
| GET | `/api/v1/analytics/audit-trail` | Functional (with fallback) | Wire to AuditTrailPanel |
| POST | `/api/v1/ondc/on_search` | Stub (mock) | Implement or document for v2 |
| POST | `/api/v1/ondc/on_select` | Stub (mock) | Implement or document for v2 |
| POST | `/api/v1/ondc/on_init` | Stub (mock) | Implement or document for v2 |
| POST | `/api/v1/ondc/on_confirm` | Stub (mock) | Implement or document for v2 |
| GET | `/api/v1/ondc/status` | Stub (disabled) | Document or enable |
| GET | `/api/v1/` (root) | Functional | Use for health checks |
| GET | `/api/v1/health` | Functional | Use for monitoring |

## Tasks

### 6.1 Implement Audit Trail Viewer
- Wire `GET /analytics/audit-trail?limit=100` to AuditTrailPanel
- Display audit events in filterable table:
  - Event type (order_created, trust_score_updated, return_approved, etc.)
  - Entity ID
  - Timestamp
  - Payload summary (expandable JSON)
  - Event hash
  - Previous hash (for chain verification)
- Implement hash chain verification:
  - Verify each event_hash matches SHA-256(payload + prev_hash)
  - Show verification status banner (chain intact/broken)
  - Highlight any broken links in the chain
- Add filters:
  - Event type dropdown
  - Date range picker
  - Entity ID search
- Implement CSV export of audit events (client-side generation)
- Add pagination for large audit logs

### 6.2 Implement Background Job Scheduler
- Add APScheduler or Celery Beat to backend for scheduled tasks:
  - Daily trust score recalculation (run Agent 2 for all retailers at midnight)
  - Nightly risk scan (run Agent 3 at 2 AM)
  - Daily beat plan generation (run Agent 6 at 6 AM)
  - Expiry sweep (check batches approaching expiry every 6 hours)
  - Quick commerce price scrape (if implemented, every 4 hours)
  - GST status check (weekly)
- Build job monitoring UI showing:
  - Scheduled jobs list
  - Last run time and status
  - Next run time
  - Run history with success/failure counts
- Add manual "Run Now" button for each scheduled job
- Log job execution to audit trail

### 6.3 Implement Redis Integration
- Use Redis for JWT token blocklist (proper logout invalidation)
- Use Redis for caching frequently accessed data:
  - Dashboard summary (cache for 5 minutes)
  - Trust scores (cache for 15 minutes)
  - Scheme list (cache for 1 hour)
- Implement cache invalidation on data mutations
- Add Redis health check to `/health` endpoint

### 6.4 Implement MongoDB Integration
- Use MongoDB for storing raw chat payloads from Telegram webhooks
- Store Agent 1 parsing outputs (full LLM response, confidence scores, intermediate states)
- Store scheme PDF extracted text and chunks
- Build raw data explorer UI (admin-only) for debugging:
  - View raw chat messages
  - View AI parsing outputs
  - Search by chat_id, date, intent

### 6.5 Implement ONDC Integration Scaffolding
- Document ONDC protocol requirements for each endpoint:
  - on_search: catalog discovery
  - on_select: order selection
  - on_init: order initialization
  - on_confirm: order confirmation
- Implement basic ONDC message formatting (even if mocked):
  - Create ONDC message schemas
  - Build request/response transformers
- Add ONDC toggle in distributor settings (enable/disable)
- When enabled, route eligible orders through ONDC protocol
- Log ONDC interactions to audit trail
- Build ONDC status page showing:
  - Integration status
  - Recent ONDC messages
  - Error logs

### 6.6 Implement Quick Commerce Threat Monitor (Stub with Mock Data)
- Since full QC scraping is v2, implement a structured stub:
  - Accept manual QC price entries via UI (SKU, QC price, pincode, platform)
  - Store in a `quick_commerce_prices` table
  - Compare QC prices with distributor's average retailer selling prices
  - Flag SKUs where QC price undercuts retailer margin beyond threshold
- Build QC threat visualization:
  - Table of flagged SKUs with margin impact
  - Pincode-level threat map (can be simple table for MVP)
  - Recommendation: "Shift [SKU] push to [area] where QC is not active"
- Document the planned automated scraper architecture for v2

### 6.7 Implement Secondary Sales Estimator
- Build estimation logic using re-order frequency and volumes:
  - Calculate average days between orders per SKU per retailer
  - Estimate sell-through velocity (units/day)
  - Compare with primary sales (distributor to retailer)
  - Flag retailers with low secondary sales (potential scheme abuse or demand drop)
- Wire to `GET /analytics/secondary-sales-estimate`
- Build secondary sales dashboard showing:
  - Top SKUs by sell-through velocity
  - Retailers with declining secondary sales
  - Region-wise demand trends

### 6.8 Complete NBFC Dashboard Page
- Build NBFC-facing dashboard at `/nbfc`:
  - Trust Score distribution of loan applicants
  - Portfolio risk summary (tier A/B/C/D breakdown)
  - Individual retailer trust certificates (view-only)
  - Payment discipline analytics
  - Default rate trends
- Wire to relevant analytics endpoints:
  - `GET /analytics/trust-distribution`
  - `GET /analytics/audit-trail`
  - Trust score and history endpoints
- Build NBFC-specific views:
  - Loan applicant lookup (by retailer ID or GSTIN)
  - Trust Certificate verification
  - Risk assessment report generation
- Read-only access — NBFCs cannot modify data

### 6.9 Complete HORECA Dashboard Page
- Build HORECA-facing dashboard at `/horeca`:
  - Daily order summary
  - Vendor reliability scores
  - Price history charts per category (fresh produce, proteins, dry goods)
  - Overcharge alerts (current price vs average)
  - Menu-linked demand patterns (e.g., paneer spikes Thu-Sun)
- Wire to relevant endpoints:
  - Orders filtered by HORECA mode
  - Trust scores for vendors
  - Returns and disputes
- Build HORECA-specific views:
  - Vendor comparison table
  - Category-wise spend dashboard
  - Price negotiation recommendations
- Add HORECA mode toggle in distributor settings

### 6.10 Complete Retailer Self-Service Dashboard
- Build retailer-facing dashboard at `/retailer`:
  - Current Trust Score and tier (from `GET /trust-score/{id}`)
  - Order history (from `GET /orders/?retailer_id={id}`)
  - Outstanding balance and credit limit
  - Active scheme benefits
  - Recent return status
- Build retailer actions:
  - Place new order (text input parsed by Agent 1, or form-based)
  - View order status
  - Make payment (log payment entry)
  - Submit return request
  - Request Trust Certificate export
  - Dispute a collection
- Mobile-optimized layout (retailers primarily use phones)

### 6.11 Complete Company Dashboard Page
- Build Company (Brand/Principal) dashboard at `/company`:
  - Replace hardcoded stats with real data
  - Active schemes overview (from `GET /schemes/`)
  - Scheme pass-through analytics (from `GET /analytics/pass-through-metrics`)
  - Regional scheme performance
  - Distributor-level scheme compliance
- Implement Sidebar.tsx and Navbar.tsx (currently empty files)
- Build "Policy Settings" page (currently "Coming Soon"):
  - Scheme design interface
  - Pass-through requirement configuration
  - Compliance threshold settings
- Build brand-facing analytics:
  - Sell-through by region
  - Scheme ROI analysis
  - Distributor ranking by compliance

### 6.12 Complete Agent Pipeline Page
- Build AI agent monitoring page at `/agent`:
  - Replace default Next.js template
  - Show all 6 agents with status indicators:
    - Agent 1: Trade Capture & Normalisation
    - Agent 2: Trust & Behaviour Scoring
    - Agent 3: Risk, Scheme & Compliance Intelligence
    - Agent 4: Action & Recommendation
    - Agent 5: Demand & Pre-Stock Forecast
    - Agent 6: Beat Intelligence & Coverage
  - For each agent, show:
    - Last run time and duration
    - Input/output summary
    - Success/failure rate
    - Configuration parameters
  - Build agent test console:
    - Select agent from dropdown
    - Input test payload (JSON)
    - View agent output in formatted display
    - View LangGraph execution trace
  - Wire to `POST /agent/run` and `GET /agent/status/{run_id}`

### 6.13 Implement Data Export Functionality
- Build export buttons across relevant pages:
  - Orders → CSV export (filtered by date range, retailer, status)
  - Retailers → CSV export (with trust scores)
  - Risk alerts → CSV export
  - Audit trail → CSV export (already partially implemented)
  - Trust certificates → PDF download
  - Scheme leakage report → CSV/PDF export
  - Beat plan → CSV export
- Implement server-side export endpoints for large datasets:
  - `GET /export/orders?format=csv&from=&to=`
  - `GET /export/retailers?format=csv&tier=`
  - `GET /export/alerts?format=csv&from=&to=`
- Show export progress and download link

### 6.14 Implement Global Error Handling
- Add error boundary wrapper around Next.js app
- Build error page for unhandled exceptions
- Add API error interceptor in `api-client.ts`:
  - Show toast notification on API errors
  - Handle 401 (redirect to login)
  - Handle 403 (show permission denied)
  - Handle 500 (show server error with retry)
  - Handle network errors (show offline message)
- Add loading skeletons for all data-fetching components
- Implement retry logic for failed API calls

### 6.15 Add Seed Data & Database Initialization
- Create seed script to populate database with realistic test data:
  - 1 tenant (distributor)
  - 20+ retailers with varying trust scores (A/B/C/D distribution)
  - 5 salesmen with routes
  - 50+ products across categories
  - 200+ orders over 90 days
  - 10+ active and expired schemes
  - 30+ batches with varying expiry dates
  - 20+ beat checkins (including some ghost visits)
  - 10+ returns (mix of genuine and suspicious)
  - 15+ risk alerts (mix of INFO/WARNING/CRITICAL)
  - 5+ audit events
- Run seed script on database initialization
- Document seed data generation process

### 6.16 Final Integration Testing & Polish
- Test complete order flow: Telegram message → Agent 1 parse → confirmation → order creation → trust score update → risk alert → action card → distributor approval
- Test complete return flow: Return request → Agent 3 classification → distributor review → approve/reject → credit note
- Test complete beat flow: Check-in → coverage gap detection → ghost visit detection → beat plan generation → salesman notification
- Test certificate flow: Generate → download → verify via QR
- Test all CRUD operations for retailers, salesmen, schemes, batches
- Verify responsive layout on mobile (retailer dashboard)
- Test dark/light theme toggle across all pages
- Verify all charts render correctly with real data
- Test error states (no data, API down, network error)
- Run lighthouse audit for performance and accessibility

## Acceptance Criteria
- Audit trail displays real events with hash chain verification
- Background jobs run on schedule with monitoring UI
- Redis is used for caching and token blocklist
- MongoDB stores raw chat payloads and AI outputs
- ONDC integration is documented and scaffolded
- QC threat monitor accepts manual entries and flags margin risks
- NBFC, HORECA, Retailer, Company, and Agent pages are fully built
- Data export works for orders, retailers, alerts, and audit trail
- Global error handling shows appropriate messages for all error types
- Database is seeded with realistic test data
- Complete end-to-end flows work without errors
- Dashboard is responsive and accessible

## Dependencies
- All previous tasks (1-5) completed
- Redis server available
- MongoDB server available
- APScheduler or Celery installed
- ReportLab installed for PDF exports
- Seed data script tested and verified
