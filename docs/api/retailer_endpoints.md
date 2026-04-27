# Retailer API Endpoints

> This document details the endpoints related to **Retailer**, mapping them to business logic in `vendorlock.txt` and frontend components.

## `POST /api/v1/retailer/`
**Onboard a new retailer**

Onboard a new retailer. Requires GSTN or Aadhaar-linked mobile.
Initial Trust Score set to 50 (neutral starting point).

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---

## `GET /api/v1/retailer/{retailer_id}`
**Get retailer profile**

Full profile including current trust score and outstanding.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
{
    retailer_id*: string
    name*: string
    gstin: any
    mobile*: string
    address*: string
    pincode*: string
    credit_limit*: number
    outstanding*: number
    trust_score*: number
    tier*: string
}
```

---

## `GET /api/v1/retailer/{retailer_id}/ledger`
**Get retailer transaction ledger**

Paginated transaction history (orders, payments, returns) for a retailer.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---

## `PATCH /api/v1/retailer/{retailer_id}/credit-limit`
**Update credit limit for a retailer**

Manually update credit limit. Every change is logged to the audit trail.
Must be backed by a reason for audit compliance.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---
