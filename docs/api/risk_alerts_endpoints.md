# Risk Alerts API Endpoints

> This document details the endpoints related to **Risk Alerts**, mapping them to business logic in `vendorlock.txt` and frontend components.

## `GET /api/v1/risk-alerts/`
**List all active risk alerts for tenant**

Returns all unacknowledged risk alerts for the distributor's tenant.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:**
  - **Agent 4 — Action & Recommendation**: Converts risk alerts into action cards and draft Telegram messages for the distributor.
  - *VendorLock Spec Reference*: Section: Agent 4 — Action & Recommendation
  - *Setup*: Requires DB: `risk_alerts`. Agent 4 pipeline.
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---

## `GET /api/v1/risk-alerts/{alert_id}`
**Get alert detail**

Fetch detailed view of a single alert including recommended action card.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:**
  - **Agent 4 — Action & Recommendation**: Converts risk alerts into action cards and draft Telegram messages for the distributor.
  - *VendorLock Spec Reference*: Section: Agent 4 — Action & Recommendation
  - *Setup*: Requires DB: `risk_alerts`. Agent 4 pipeline.
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---

## `PATCH /api/v1/risk-alerts/{alert_id}/acknowledge`
**Acknowledge an alert**

Mark alert as reviewed / acknowledged by distributor.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:**
  - **Agent 4 — Action & Recommendation**: Converts risk alerts into action cards and draft Telegram messages for the distributor.
  - *VendorLock Spec Reference*: Section: Agent 4 — Action & Recommendation
  - *Setup*: Requires DB: `risk_alerts`. Agent 4 pipeline.
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---

## `POST /api/v1/risk-alerts/run-scan`
**Trigger a full risk scan (Agent 3)**

Manually trigger Agent 3 to scan entire tenant ledger for new risks.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:**
  - **Agent 3 — Risk, Scheme & Compliance Intelligence**: Detects credit risk, scheme leakage, return fraud, expiry issues, and GST compliance.
  - *VendorLock Spec Reference*: Section: 3, 5, 6 (Leakage, Returns, Expiry)
  - *Setup*: Requires DB: `risk_alerts`, `schemes`, `returns`, `batches`. Vector store (FAISS) for PDF RAG.
  - **Agent 4 — Action & Recommendation**: Converts risk alerts into action cards and draft Telegram messages for the distributor.
  - *VendorLock Spec Reference*: Section: Agent 4 — Action & Recommendation
  - *Setup*: Requires DB: `risk_alerts`. Agent 4 pipeline.
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---
