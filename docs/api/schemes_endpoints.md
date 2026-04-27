# Schemes API Endpoints

> This document details the endpoints related to **Schemes**, mapping them to business logic in `vendorlock.txt` and frontend components.

## `GET /api/v1/schemes/`
**List all active schemes for tenant**

Returns all active schemes for the distributor's tenant.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---

## `POST /api/v1/schemes/`
**Create a new scheme**

Register a brand scheme. Feeds Agent 3 leakage detection.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Request Body
```typescript
{
    brand_id*: string
    scheme_name*: string
    sku_id*: string
    min_quantity*: integer
    discount_percent*: number
    valid_from*: string
    valid_to*: string
    source: string
}
```

### Response (Success)
```typescript
None
```

---

## `POST /api/v1/schemes/ingest-pdf`
**Upload scheme PDF — Agent 3 RAG extraction**

Upload a brand scheme PDF. Agent 3 uses RAG to extract scheme rules.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:**
  - **Agent 3 — Risk, Scheme & Compliance Intelligence**: Detects credit risk, scheme leakage, return fraud, expiry issues, and GST compliance.
  - *VendorLock Spec Reference*: Section: 3, 5, 6 (Leakage, Returns, Expiry)
  - *Setup*: Requires DB: `risk_alerts`, `schemes`, `returns`, `batches`. Vector store (FAISS) for PDF RAG.
- **Frontend Components:** Generic Dashboard Component

### Request
`multipart/form-data` (File Upload)

### Response (Success)
```typescript
None
```

---

## `GET /api/v1/schemes/leakage`
**Scheme leakage report (Agent 3)**

Month-to-date scheme leakage report across all active schemes.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:**
  - **Agent 3 — Risk, Scheme & Compliance Intelligence**: Detects credit risk, scheme leakage, return fraud, expiry issues, and GST compliance.
  - *VendorLock Spec Reference*: Section: 3, 5, 6 (Leakage, Returns, Expiry)
  - *Setup*: Requires DB: `risk_alerts`, `schemes`, `returns`, `batches`. Vector store (FAISS) for PDF RAG.
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
Array<any>
```

---

## `GET /api/v1/schemes/{scheme_id}/pass-through`
**Per-retailer scheme pass-through for one scheme**

Detailed per-retailer benefit pass-through for a single scheme.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---
