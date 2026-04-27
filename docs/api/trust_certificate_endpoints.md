# Trust Certificate API Endpoints

> This document details the endpoints related to **Trust Certificate**, mapping them to business logic in `vendorlock.txt` and frontend components.

## `POST /api/v1/certificate/generate`
**Generate a Trust Certificate PDF**

Generate a tamper-proof Trust Certificate for a retailer.
Contains Trust Score, tier, behavioural aggregates, and a QR code
linking to a read-only public verification page.

- **Authentication / Roles:** Distributor, Admin
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Request Body
```typescript
{
    retailer_id*: string
    requested_by*: string
    otp_verified: boolean
}
```

### Response (Success)
```typescript
{
    certificate_id*: string
    retailer_id*: string
    trust_score*: number
    tier*: string
    months_of_history*: integer
    payment_discipline_pct*: number
    return_rate_vs_peer*: number
    consistency_index*: number
    qr_verification_url*: string
    pdf_url*: string
    issued_at*: string
    valid_until*: string
}
```

---

## `GET /api/v1/certificate/verify/{certificate_id}`
**Public verification of a Trust Certificate**

Public read-only endpoint — linked via QR on the PDF.
No auth required; returns sanitised summary only.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---

## `GET /api/v1/certificate/{retailer_id}/history`
**List all certificates issued for a retailer**

All certificates issued for a retailer — for audit.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---
