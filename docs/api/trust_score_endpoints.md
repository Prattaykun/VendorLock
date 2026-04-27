# Trust Score API Endpoints

> This document details the endpoints related to **Trust Score**, mapping them to business logic in `vendorlock.txt` and frontend components.

## `GET /api/v1/trust-score/{retailer_id}`
**Get Trust Score for a retailer**

Returns the current Trust Score + tier + trend for a retailer.
Powered by Agent 2 — Trust & Behaviour Scoring.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:**
  - **Agent 2 — Trust & Behaviour Scoring**: Maintains CIBIL-style Trust Scores (0-100) across 6 dimensions. Recalculates based on ledger events.
  - *VendorLock Spec Reference*: Section: 2. Builds a CIBIL-Style Trust Score (MVP)
  - *Setup*: Requires DB: `trust_scores`, `orders`, `returns`. Agent 2 LangGraph pipeline.
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
{
    retailer_id*: string
    score*: number
    tier*: string
    trend*: string
    consistency_index*: number
    flags*: Array<string>
    last_updated*: string
}
```

---

## `GET /api/v1/trust-score/{retailer_id}/breakdown`
**Get sub-score breakdown**

Detailed sub-score breakdown for audit / retailer self-service.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:**
  - **Agent 2 — Trust & Behaviour Scoring**: Maintains CIBIL-style Trust Scores (0-100) across 6 dimensions. Recalculates based on ledger events.
  - *VendorLock Spec Reference*: Section: 2. Builds a CIBIL-Style Trust Score (MVP)
  - *Setup*: Requires DB: `trust_scores`, `orders`, `returns`. Agent 2 LangGraph pipeline.
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
{
    payment_discipline*: number
    order_consistency*: number
    cancellation_rate*: number
    return_frequency*: number
    communication_reliability*: number
    trade_stability*: number
    composite*: number
}
```

---

## `GET /api/v1/trust-score/{retailer_id}/history`
**Get Trust Score history (trend)**

Rolling score history — used to render the trend graph on the dashboard.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:**
  - **Agent 2 — Trust & Behaviour Scoring**: Maintains CIBIL-style Trust Scores (0-100) across 6 dimensions. Recalculates based on ledger events.
  - *VendorLock Spec Reference*: Section: 2. Builds a CIBIL-Style Trust Score (MVP)
  - *Setup*: Requires DB: `trust_scores`, `orders`, `returns`. Agent 2 LangGraph pipeline.
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---

## `GET /api/v1/trust-score/query/myscore`
**Retailer self-service: MYSCORE query**

Endpoint triggered when a retailer sends 'MYSCORE' via Telegram/WhatsApp.
Returns a chat-friendly summary of their score + tier.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:**
  - **Agent 2 — Trust & Behaviour Scoring**: Maintains CIBIL-style Trust Scores (0-100) across 6 dimensions. Recalculates based on ledger events.
  - *VendorLock Spec Reference*: Section: 2. Builds a CIBIL-Style Trust Score (MVP)
  - *Setup*: Requires DB: `trust_scores`, `orders`, `returns`. Agent 2 LangGraph pipeline.
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---

## `POST /api/v1/trust-score/recalculate/{retailer_id}`
**Trigger score recalculation (admin)**

Force-trigger Agent 2 to recompute trust score for a retailer.

- **Authentication / Roles:** Distributor, Admin
- **AI Agents Involved:**
  - **Agent 2 — Trust & Behaviour Scoring**: Maintains CIBIL-style Trust Scores (0-100) across 6 dimensions. Recalculates based on ledger events.
  - *VendorLock Spec Reference*: Section: 2. Builds a CIBIL-Style Trust Score (MVP)
  - *Setup*: Requires DB: `trust_scores`, `orders`, `returns`. Agent 2 LangGraph pipeline.
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---
