# Distributor API Endpoints

> This document details the endpoints related to **Distributor**, mapping them to business logic in `vendorlock.txt` and frontend components.

## `GET /api/v1/distributor/profile`
**Get distributor profile / control tower summary**

Distributor control tower overview.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
{
    distributor_id*: string
    name*: string
    gstin*: string
    territory*: string
    plan*: string
    active_salesmen*: integer
    active_retailers*: integer
    total_outstanding*: number
    monthly_revenue*: number
}
```

---

## `GET /api/v1/distributor/dashboard/summary`
**Dashboard KPI summary**

High-level KPIs for the distributor dashboard control tower.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---

## `GET /api/v1/distributor/retailers`
**List all retailers for distributor**

Paginated retailer list with Trust Score summary.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---

## `GET /api/v1/distributor/salesmen`
**List all salesmen**

List all salesmen with reliability scores.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---
