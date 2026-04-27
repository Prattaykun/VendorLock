# Returns API Endpoints

> This document details the endpoints related to **Returns**, mapping them to business logic in `vendorlock.txt` and frontend components.

## `POST /api/v1/returns/`
**Submit a return request**

New return claim. Agent 3 classifies it as GENUINE / SUSPICIOUS / WITHIN_WINDOW / EXPIRED_WINDOW.
Credits above threshold go on hold for distributor approval.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:**
  - **Agent 3 — Risk, Scheme & Compliance Intelligence**: Detects credit risk, scheme leakage, return fraud, expiry issues, and GST compliance.
  - *VendorLock Spec Reference*: Section: 3, 5, 6 (Leakage, Returns, Expiry)
  - *Setup*: Requires DB: `risk_alerts`, `schemes`, `returns`, `batches`. Vector store (FAISS) for PDF RAG.
- **Frontend Components:** Generic Dashboard Component

### Request Body
```typescript
{
    retailer_id*: string
    order_id*: string
    batch_number*: string
    quantity*: integer
    reason*: string
    claimed_expiry: any
}
```

### Response (Success)
```typescript
{
    return_id*: string
    classification*: string
    status*: string
    credit_note_amount: any
    hold_reason: any
    created_at*: string
}
```

---

## `GET /api/v1/returns/`
**List returns for tenant**

Paginated returns list — default shows pending approvals.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:**
  - **Agent 3 — Risk, Scheme & Compliance Intelligence**: Detects credit risk, scheme leakage, return fraud, expiry issues, and GST compliance.
  - *VendorLock Spec Reference*: Section: 3, 5, 6 (Leakage, Returns, Expiry)
  - *Setup*: Requires DB: `risk_alerts`, `schemes`, `returns`, `batches`. Vector store (FAISS) for PDF RAG.
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---

## `POST /api/v1/returns/{return_id}/evidence`
**Upload photo/voice evidence for a return**

Upload supporting evidence — photo of damaged goods, batch sticker, etc.

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

## `PATCH /api/v1/returns/{return_id}/approve`
**Distributor approves a return**

Approve return — generates credit note in ledger.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:**
  - **Agent 3 — Risk, Scheme & Compliance Intelligence**: Detects credit risk, scheme leakage, return fraud, expiry issues, and GST compliance.
  - *VendorLock Spec Reference*: Section: 3, 5, 6 (Leakage, Returns, Expiry)
  - *Setup*: Requires DB: `risk_alerts`, `schemes`, `returns`, `batches`. Vector store (FAISS) for PDF RAG.
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---

## `PATCH /api/v1/returns/{return_id}/reject`
**Distributor rejects a return**

Reject return — notifies retailer via Telegram with reason.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:**
  - **Agent 3 — Risk, Scheme & Compliance Intelligence**: Detects credit risk, scheme leakage, return fraud, expiry issues, and GST compliance.
  - *VendorLock Spec Reference*: Section: 3, 5, 6 (Leakage, Returns, Expiry)
  - *Setup*: Requires DB: `risk_alerts`, `schemes`, `returns`, `batches`. Vector store (FAISS) for PDF RAG.
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---
