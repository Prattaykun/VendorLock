# VendorLock: Full Integration Plan

## What This Plan Achieves

1. **Supabase Schema** — Apply the `schema.sql` tables + seed the Supabase project with mock data from the frontend (retailers, orders, alerts, schemes, etc.)
2. **Distributor JWT Auth** — A real login page for distributors that hits `/auth/login` and stores a JWT, gating the dashboard.
3. **Frontend → Live API** — Replace `setAuthToken("dev-token")` with real auth; wire the dashboard KPI summary, retailers, orders, and alerts from the backend (falls back to mock gracefully).
4. **Telegram Bot — Full Loop** — Complete the two missing pieces: `resolve_identity(chat_id)` + `send_telegram_message(chat_id, text)`, plus the `/start <DIST_CODE>` deep-link handler so distributors can onboard retailers.
5. **Retailer identity = phone number as unique ID** — Retailers stored with `mobile` as their unique business identifier; `telegram_chat_id` is mapped on first `/start`.

---

## Architecture Overview

```
Distributor Frontend (Next.js)
  └── /distributor/login  →  POST /auth/login  →  JWT (tenant_id = distributor's UUID)
  └── /distributor         →  All panels call API with Bearer JWT

Telegram Bot
  Distributor registers → creates tenant row + gets deep link
  Retailer clicks link  → /start DIST_CODE  → retailer row created (mobile = phone)
  Retailer messages     → resolve_identity → Agent 1 → send_telegram_message back
  Retailer replies YES  → callback_query CONFIRM: → update_order_status
```

---

## Open Questions

> [!IMPORTANT]
> **Do you have a Telegram Bot Token set up?** The `.env` currently has `TELEGRAM_BOT_TOKEN=your-telegram-bot-token` as a placeholder. For the Telegram flow to work end-to-end, you'll need to provide the real token (from @BotFather). The backend code will be wired regardless; I'll make it degrade gracefully.

> [!IMPORTANT]
> **JWT Secret** — `.env` has `JWT_SECRET=your-jwt-secret`. For the login to persist correctly across restarts, this should be a stable secret. I'll update it to a fixed dev value; please change it for production.

> [!NOTE]
> **Supabase Tables** — The Supabase project (`hlzmlqejfdfmwzdgldaz`) currently has **no tables**. I'll apply the full `schema.sql` migration via MCP and then seed it with the mock data from `mock-data.ts`.

---

## Proposed Changes

### Phase 1 — Supabase Schema + Seed Data

#### [APPLY] Supabase Migration
Apply `app/db/schema.sql` to the live Supabase project via `mcp_supabase_apply_migration`.

#### [APPLY] Add missing columns to retailers table
Add `telegram_chat_id` column (already in schema) and ensure `mobile` has a UNIQUE constraint per tenant (not globally — since same phone may order from two distributors).

#### [SEED] Insert mock data
Seed tables with data from `mock-data.ts`:
- 1 demo tenant (distributor "Ravi Mehta Distributors")
- 8 retailers with trust scores
- Sample orders, alerts, schemes, expiry batches, return requests, audit events

---

### Phase 2 — Backend: Distributor Auth + Telegram Identity

#### [MODIFY] `app/api/v1/endpoints/auth.py`
- Add `POST /auth/register-distributor` — creates a tenant row + user row, returns JWT with `tenant_id`
- The existing `/auth/login` already works; we clean up the fallback so it uses the seeded demo user

#### [MODIFY] `app/services/supabase_service.py`
Add two critical missing functions:
```python
async def resolve_identity(chat_id: str) -> Optional[Dict]:
    """Returns {role, tenant_id, entity_id} for a Telegram chat_id."""

async def send_telegram_message(chat_id: str, text: str, reply_markup=None) -> None:
    """Sends a message to a Telegram chat via Bot API."""
```

#### [MODIFY] `app/api/v1/endpoints/telegram_webhook.py`
Full rewrite of the webhook logic:
- `/start <DIST_CODE>` → register retailer under distributor's tenant, welcome message
- `MYSCORE` → look up retailer by chat_id → return trust score
- Any text → `resolve_identity` → if RETAILER → Agent 1 → `send_telegram_message(confirmation)`
- If DISTRIBUTOR → handle `/alerts`, `/beat_plan`, `/dashboard` commands
- `CONFIRM:` / `DISPUTE:` callbacks → update order, reply confirmation
- Unknown users → prompt to get link from distributor

#### [MODIFY] `app/api/v1/endpoints/retailer.py`
- Wire `POST /retailer/` to actually create in Supabase (currently returns static mock)
- Wire `GET /retailer/{id}` to fetch from DB

#### [NEW] `app/api/v1/endpoints/distributor.py` (additions)
- `GET /distributor/telegram-link` → returns the deep-link `https://t.me/<BOT_USERNAME>?start=<tenant_id_short>`

---

### Phase 3 — Frontend: Real Auth + Login Page

#### [NEW] `frontend/src/app/distributor/login/page.tsx`
A premium login page with:
- Email + Password + Tenant ID fields
- Calls `POST /auth/login` → stores JWT → redirects to `/distributor`
- Demo credentials shown: `demo@vendorlock.in / demo123 / (auto-filled tenant_id)`

#### [MODIFY] `frontend/src/components/dashboard/DistributorControlTower.tsx`
- Remove `setAuthToken("dev-token")` hardcode
- On mount: check localStorage for real token; if absent, redirect to `/distributor/login`
- The sidebar user card shows the real distributor name from `/auth/me`
- Add a "Telegram Bot" section in the sidebar showing the distributor's deep-link QR code / URL

#### [MODIFY] `frontend/src/app/distributor/layout.tsx`
- Add auth guard: if no token in localStorage → redirect to login

#### [MODIFY] `frontend/src/lib/api-client.ts`
- Add `loginDistributor(email, password)` which auto-resolves `tenant_id` from the response
- Add `getTelegramLink()` → calls `/distributor/telegram-link`

---

### Phase 4 — Frontend: Telegram Panel in Dashboard

#### [MODIFY] `frontend/src/components/dashboard/DistributorControlTower.tsx`
Add a new panel: **"Telegram Bot"** with:
- Bot status (active/inactive indicator)
- Deep-link for distributor to share with retailers
- QR code display of the link
- List of retailers who have connected via Telegram (those with `telegram_chat_id`)
- Stats: orders placed via Telegram today

---

## Verification Plan

### Automated / MCP
- Run all migrations via MCP and verify tables appear
- Seed demo data and verify row counts
- Call `/auth/login` with demo credentials and verify JWT decode

### Manual Browser Testing
1. Open `http://localhost:3000/distributor` — should redirect to `/distributor/login`
2. Login with `demo@vendorlock.in / demo123` — should land on dashboard with real data
3. Dashboard Command Center should show real retailer/order/alert counts from Supabase
4. Telegram deep-link panel should show the bot link

### Telegram Flow (requires real bot token)
1. Distributor sends `/start` to bot → gets their deep link
2. Retailer opens deep link, sends `/start DIST_CODE` → registered in DB
3. Retailer sends order text → gets confirmation back via bot
4. Retailer sends `MYSCORE` → gets trust score
