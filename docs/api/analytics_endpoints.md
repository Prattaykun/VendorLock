# Analytics API Endpoints

> This document details the endpoints related to **Analytics**, mapping them to business logic in `vendorlock.txt` and frontend components.

## `GET /api/v1/analytics/trust-distribution`
**Trust score distribution across retailers**

Histogram of trust scores — used for dashboard heatmap.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---

## `GET /api/v1/analytics/revenue-heatmap`
**Revenue heatmap by route/zone**

Route-level revenue heatmap data for dashboard.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---

## `GET /api/v1/analytics/quick-commerce-threat`
**Quick commerce threat monitor**

QC price monitoring — shows where Blinkit/Zepto undercut retailer margins.
Background job scrapes QC prices; this endpoint surfaces results.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---

## `GET /api/v1/analytics/secondary-sales-estimate`
**Estimated secondary sales by SKU**

Inferred sell-through velocity by SKU/region using reorder frequency. Agent 5 output.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:**
  - **Agent 5 — Demand & Pre-Stock Forecast**: Predicts SKU demand per zone and recommends pre-stocking. Used in secondary sales estimates.
  - *VendorLock Spec Reference*: Section: Agent 5 — Demand & Pre-Stock Forecast
  - *Setup*: Requires historical order data.
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---

## `GET /api/v1/analytics/audit-trail`
**SHA-256 hash-chain audit log**

Immutable audit trail secured by SHA-256 hash chain.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---
