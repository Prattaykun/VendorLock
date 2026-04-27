# Expiry API Endpoints

> This document details the endpoints related to **Expiry**, mapping them to business logic in `vendorlock.txt` and frontend components.

## `GET /api/v1/expiry/alerts`
**List near-expiry stock alerts**

Lists all batches expiring within the threshold window.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
Array<any>
```

---

## `GET /api/v1/expiry/batches`
**List all batches with expiry data**

Full batch registry with expiry dates — for distributor review.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---

## `POST /api/v1/expiry/batches`
**Register a new batch with expiry**

Register a batch received from brand / manufacturer.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---

## `POST /api/v1/expiry/claim-brand-return/{batch_id}`
**Initiate brand return claim for expiring batch**

Distributor initiates a return claim to brand before the expiry window closes.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---
