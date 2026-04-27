# Telegram Webhook API Endpoints

> This document details the endpoints related to **Telegram Webhook**, mapping them to business logic in `vendorlock.txt` and frontend components.

## `POST /api/v1/webhook/telegram/`
**Telegram Bot webhook receiver**

Receives incoming Telegram updates via webhook.
Validates the secret token, then routes to Agent 1 for parsing.

Telegram update types handled:
- message (text, photo, voice)
- callback_query (inline button responses — YES / DISPUTE)

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

## `POST /api/v1/webhook/telegram/set-webhook`
**Register webhook URL with Telegram**

One-time setup: register our FastAPI URL as the Telegram Bot webhook.
Call this during deployment.

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
