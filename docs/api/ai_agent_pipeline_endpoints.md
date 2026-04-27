# AI Agent Pipeline API Endpoints

> This document details the endpoints related to **AI Agent Pipeline**, mapping them to business logic in `vendorlock.txt` and frontend components.

## `POST /api/v1/agent/run`
**Manually trigger an AI agent run**

Trigger a specific agent in the LangGraph pipeline.
In production, agents are triggered automatically by events.
This endpoint is for debugging and manual runs.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Request Body
```typescript
{
    agent*: AgentName
    input_payload: any
    tenant_id: any
}
```

### Response (Success)
```typescript
None
```

---

## `GET /api/v1/agent/status/{run_id}`
**Get the status of an agent run**

Poll the status of an async agent graph run.

- **Authentication / Roles:** Any Authenticated (Admin, Distributor, Salesman, Retailer)
- **AI Agents Involved:** None directly (CRUD or utility endpoint).
- **Frontend Components:** Generic Dashboard Component

### Response (Success)
```typescript
None
```

---

## `POST /api/v1/agent/parse-message`
**Test Agent 1: parse a raw chat message**

Dev/test endpoint: feed a raw text message to Agent 1 and return the
structured trade event it extracts. Useful for testing Hindi/Hinglish parsing.

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
