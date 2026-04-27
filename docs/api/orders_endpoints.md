# Orders API Endpoints

> This document details the endpoints related to **Orders**, mapping them to business logic in `vendorlock.txt` and frontend components.

## `POST /api/v1/orders/`
**Create / capture a new order**

Captures a new order from any channel.
Triggers Agent 1 (Trade Capture & Normalisation).
Sets status to PENDING_CONFIRMATION — retailer must confirm via chat before final commit.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:**
  - **Agent 1 — Trade Capture & Normalisation**: Converts informal multilingual chat messages into structured trade events. Confirm-before-commit logic.
  - *VendorLock Spec Reference*: Section: 1. Captures All Trade on Chat (MVP)
  - *Setup*: Requires Gemini 2.5 Flash via google-genai. DB: `orders` table. Webhook setup for Telegram.
- **Frontend Components:** Generic Dashboard Component

### Request Body
```typescript
{
    retailer_id*: string
    items*: Array<OrderItem>
    payment_type: string
    notes: any
    channel: string
    raw_message: any
}
```

### Response (Success)
```typescript
{
    order_id*: string
    status*: string
    retailer_id*: string
    total_items*: integer
    payment_type*: string
    pending_confirmation*: boolean
    created_at*: string
}
```

---

## `GET /api/v1/orders/`
**List orders for tenant**

Paginated list of orders for the authenticated distributor's tenant.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:**
  - **Agent 1 — Trade Capture & Normalisation**: Converts informal multilingual chat messages into structured trade events. Confirm-before-commit logic.
  - *VendorLock Spec Reference*: Section: 1. Captures All Trade on Chat (MVP)
  - *Setup*: Requires Gemini 2.5 Flash via google-genai. DB: `orders` table. Webhook setup for Telegram.
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---

## `GET /api/v1/orders/{order_id}`
**Get order details**

Fetch a single order by ID.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:**
  - **Agent 1 — Trade Capture & Normalisation**: Converts informal multilingual chat messages into structured trade events. Confirm-before-commit logic.
  - *VendorLock Spec Reference*: Section: 1. Captures All Trade on Chat (MVP)
  - *Setup*: Requires Gemini 2.5 Flash via google-genai. DB: `orders` table. Webhook setup for Telegram.
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---

## `DELETE /api/v1/orders/{order_id}`
**Cancel an order**

Cancel order in PENDING or CONFIRMED state.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:**
  - **Agent 1 — Trade Capture & Normalisation**: Converts informal multilingual chat messages into structured trade events. Confirm-before-commit logic.
  - *VendorLock Spec Reference*: Section: 1. Captures All Trade on Chat (MVP)
  - *Setup*: Requires Gemini 2.5 Flash via google-genai. DB: `orders` table. Webhook setup for Telegram.
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---

## `PATCH /api/v1/orders/{order_id}/confirm`
**Retailer confirms order (YES flow)**

Retailer confirmation — moves order from PENDING_CONFIRMATION to CONFIRMED.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:**
  - **Agent 1 — Trade Capture & Normalisation**: Converts informal multilingual chat messages into structured trade events. Confirm-before-commit logic.
  - *VendorLock Spec Reference*: Section: 1. Captures All Trade on Chat (MVP)
  - *Setup*: Requires Gemini 2.5 Flash via google-genai. DB: `orders` table. Webhook setup for Telegram.
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---

## `PATCH /api/v1/orders/{order_id}/dispute`
**Retailer disputes parsed order**

Retailer disputes the parsed order — flags it for manual review.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:**
  - **Agent 1 — Trade Capture & Normalisation**: Converts informal multilingual chat messages into structured trade events. Confirm-before-commit logic.
  - *VendorLock Spec Reference*: Section: 1. Captures All Trade on Chat (MVP)
  - *Setup*: Requires Gemini 2.5 Flash via google-genai. DB: `orders` table. Webhook setup for Telegram.
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---
