# Analytics API Endpoints

> This document details the endpoints related to **Analytics**, mapping them to business logic in `vendorlock.txt` and frontend components.

## `GET /api/v1/analytics/pass-through-metrics`
**Comprehensive pass-through analytics**

Returns aggregate pass-through metrics, regional leakage data, monthly trends, SKU fragility analysis, and AI-powered intelligence advisory for monitoring scheme benefit distribution.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** 
  - **Agent 5 — Demand & Pre-Stock Forecast**: Provides SKU fragility analysis and demand forecasting
  - **Agent 6 — Scheme Leakage Detection**: Identifies regional leakage patterns and provides intelligence advisory
  - *VendorLock Spec Reference*: Section: Agent 5 — Demand & Pre-Stock Forecast, Agent 6 — Scheme Leakage Detection
- **Frontend Components:** PassThroughAnalytics

### Response (Success)
```typescript
{
  aggregate_pass_through: {
    percentage: 76.2,
    trend: "+4.1%",
    trend_period: "vs Last Month",
    total_disbursed: "$1.24M",
    verified_reach: "$945K"
  },
  regional_leakage: [
    {
      region_id: "R012",
      region_name: "DELHI NCR",
      leakage_percentage: 14.2,
      status: "HIGH_RISK",
      confidence: 98.4,
      latency_days: 5.2,
      likely_cause: "Distributor Absorption"
    }
  ],
  monthly_trends: [
    {
      month: "MAY",
      pass_through: 62,
      cost_basis: 40
    }
  ],
  sku_fragility: [
    {
      category: "Category A: Beverage Essentials",
      leakage_percentage: 12.4,
      status: "HIGH_LEAK",
      insight: "Distributor margin absorption high in suburban zones"
    }
  ],
  intelligence_advisory: {
    priority: "HIGH",
    summary: "Scheme pass-through has increased by 4.1% since implementing direct OTP-based kirana verification.",
    detail: "Leakage remains concentrated in Tier-3 North Region distributors due to logistics latency.",
    mitigation_strategy: "Implement real-time GPS tracking for last-mile delivery and automated distributor compliance scoring.",
    confidence: 98.4
  }
}
```

---

## `GET /api/v1/analytics/trust-distribution`
**Trust score distribution across retailers**

Histogram of trust scores — used for dashboard heatmap.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
{
  distribution: {
    A: 150,
    B: 85,
    C: 42,
    D: 12
  }
}
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
{
  heatmap: []
}
```

---

## `GET /api/v1/analytics/quick-commerce-threat`
**Quick commerce threat monitor**

QC price monitoring — shows where Blinkit/Zepto undercut retailer margins.
Background job scrapes QC prices; this endpoint surfaces results.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Query Parameters
- `pincode` (optional): Filter by pincode
- `sku_id` (optional): Filter by SKU

### Response (Success)
```typescript
{
  threats: [],
  last_scan: null
}
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
{
  sku_estimates: []
}
```

---

## `GET /api/v1/analytics/audit-trail`
**SHA-256 hash-chain audit log**

Immutable audit trail secured by SHA-256 hash chain.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Query Parameters
- `limit` (optional, default: 50): Number of events to return
- `entity_id` (optional): Filter by specific entity

### Response (Success)
```typescript
{
  events: [],
  total: 0
}
```

---
