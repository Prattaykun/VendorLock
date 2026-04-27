# Salesman API Endpoints

> This document details the endpoints related to **Salesman**, mapping them to business logic in `vendorlock.txt` and frontend components.

## `GET /api/v1/salesman/`
**List all salesmen with reliability scores**

Salesmen list with Agent 6 reliability metrics.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---

## `POST /api/v1/salesman/`
**Add a new salesman**

Register a new field salesman under the distributor tenant.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---

## `GET /api/v1/salesman/{salesman_id}/reliability`
**Get reliability score for a salesman**

Agent 6 computed reliability score with ghost visit metrics.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
{
    salesman_id*: string
    name*: string
    ghost_visit_rate*: number
    collection_confirmation_rate*: number
    outlets_covered_this_week*: integer
    outlets_target_this_week*: integer
    coverage_pct*: number
    overall_reliability_score*: number
}
```

---

## `GET /api/v1/salesman/{salesman_id}/beat-history`
**Check-in and beat history**

Historical check-ins + route coverage for a salesman.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---
