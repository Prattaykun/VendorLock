<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# see , the webhook of telegram is ready

"""
Telegram Webhook endpoint — receives all Telegram Bot messages.
Routes to Agent 1 for parsing, handles confirmations/disputes.
"""
from fastapi import APIRouter, Request, HTTPException, Header
from typing import Optional
from loguru import logger

from app.core.config import settings
from app.agents.agent1_trade_capture import agent1_graph
from app.services import supabase_service

router = APIRouter()

@router.post("/", summary="Telegram Bot webhook receiver")
async def telegram_webhook(
    request: Request,
    x_telegram_bot_api_secret_token: Optional[str] = Header(None),
):
    """
    Receives incoming Telegram updates via webhook.
    Validates the secret token, then routes to Agent 1 for parsing.

Telegram update types handled:
    - message (text, photo, voice)
    - callback_query (inline button responses — YES / DISPUTE)
    """
    \# Validate Telegram's secret header
    if settings.TELEGRAM_WEBHOOK_SECRET:
        if x_telegram_bot_api_secret_token != settings.TELEGRAM_WEBHOOK_SECRET:
            raise HTTPException(status_code=403, detail="Invalid webhook secret")

body = await request.json()
    logger.debug(f"Telegram update: {body}")

update_id = body.get("update_id")

\# ── Text message ──────────────────────────────────────────────────────────
    if "message" in body:
        message = body["message"]
        chat_id = message["chat"]["id"]
        text = message.get("text", "")
        photo = message.get("photo")
        voice = message.get("voice")

logger.info(f"[TG] Message from chat {chat_id}: {text[:80]}")

\# Handle MYSCORE command
        if text.strip().upper() in ("MYSCORE", "MY SCORE", "MERA SCORE"):
            \# Return trust score for this retailer
            logger.info(f"[TG] MYSCORE command from {chat_id}")
            \# In production: look up retailer by chat_id and return score
            return {"ok": True, "update_id": update_id, "handled": "MYSCORE"}

\# Route to Agent 1 for intent parsing
        if text and len(text.strip()) > 2:
            try:
                state = {
                    "raw_message": text,
                    "sender_id": str(chat_id),
                    "tenant_id": "default",  \# In production: map chat_id to tenant
                    "channel": "telegram",
                    "language_hint": "auto",
                    "parsed_event": None,
                    "confirmation_text": None,
                    "error": None,
                }
                result = agent1_graph.invoke(state)
                logger.info(f"[TG] Agent 1 parsed: {result.get('parsed_event', {}).get('intent', '?')}")

\# In production: send confirmation_text back to Telegram
                confirmation = result.get("confirmation_text", "Message received.")
                logger.info(f"[TG] Confirmation to send: {confirmation[:100]}")

except Exception as e:
                logger.error(f"[TG] Agent 1 invocation failed: {e}")

\# ── Callback query (inline keyboard: YES / DISPUTE) ──────────────────────
    elif "callback_query" in body:
        callback = body["callback_query"]
        data = callback.get("data", "")
        chat_id = callback["message"]["chat"]["id"]
        logger.info(f"[TG] Callback from chat {chat_id}: {data}")

if data.startswith("CONFIRM:"):
            order_id = data.split(":")[1]
            try:
                await supabase_service.update_order_status(order_id, "default", "CONFIRMED")
                logger.info(f"Order {order_id} confirmed via Telegram")
            except Exception as e:
                logger.error(f"Order confirmation failed: {e}")

elif data.startswith("DISPUTE:"):
            order_id = data.split(":")[1]
            try:
                await supabase_service.update_order_status(order_id, "default", "DISPUTED")
                logger.info(f"Order {order_id} disputed via Telegram")
            except Exception as e:
                logger.error(f"Order dispute failed: {e}")

return {"ok": True, "update_id": update_id}

@router.post("/set-webhook", summary="Register webhook URL with Telegram")
async def set_webhook(webhook_url: str):
    """
    One-time setup: register our FastAPI URL as the Telegram Bot webhook.
    Call this during deployment.
    """
    import httpx
    url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/setWebhook"
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, json={
            "url": webhook_url,
            "secret_token": settings.TELEGRAM_WEBHOOK_SECRET,
            "allowed_updates": ["message", "callback_query"],
        })
    return resp.json()

router:
"""
API v1 — Master router: aggregates all sub-routers.
"""
from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    orders,
    trust_score,
    risk_alerts,
    beat_plan,
    schemes,
    returns,
    expiry,
    certificate,
    telegram_webhook,
    distributor,
    retailer,
    salesman,
    agent,
    ondc,
    analytics,
    pdf_parser,
)

api_router = APIRouter()

# ── Authentication ────────────────────────────────────────────────────────────

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])

# ── Core Trade Endpoints (MVP) ────────────────────────────────────────────────

api_router.include_router(orders.router, prefix="/orders", tags=["Orders"])
api_router.include_router(trust_score.router, prefix="/trust-score", tags=["Trust Score"])
api_router.include_router(risk_alerts.router, prefix="/risk-alerts", tags=["Risk Alerts"])
api_router.include_router(beat_plan.router, prefix="/beat-plan", tags=["Beat Plan"])
api_router.include_router(schemes.router, prefix="/schemes", tags=["Schemes"])
api_router.include_router(returns.router, prefix="/returns", tags=["Returns"])
api_router.include_router(expiry.router, prefix="/expiry", tags=["Expiry"])
api_router.include_router(certificate.router, prefix="/certificate", tags=["Trust Certificate"])

# ── Stakeholder Endpoints ─────────────────────────────────────────────────────

api_router.include_router(distributor.router, prefix="/distributor", tags=["Distributor"])
api_router.include_router(retailer.router, prefix="/retailer", tags=["Retailer"])
api_router.include_router(salesman.router, prefix="/salesman", tags=["Salesman"])
api_router.include_router(agent.router, prefix="/agent", tags=["AI Agent Pipeline"])

# ── Channel Webhooks ──────────────────────────────────────────────────────────

api_router.include_router(
    telegram_webhook.router, prefix="/webhook/telegram", tags=["Telegram Webhook"]
)

# ── Integrations ──────────────────────────────────────────────────────────────

api_router.include_router(ondc.router, prefix="/ondc", tags=["ONDC"])

# ── Intelligence / Analytics ──────────────────────────────────────────────────

api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(pdf_parser.router, prefix="/pdf", tags=["PDF Parser"])

now tell me how can ai make a system where distributer can register there numbers as the automated reply givers and order registerer and retailers can talk like regular user and get the automated response

This is a great architectural question. Here's the complete system design for how distributors can register their numbers as **automated reply givers** and retailers can chat naturally to get responses — built on top of your existing webhook infrastructure.

***

## The Core Model: Tenant-Mapped Chat Identity

Your existing webhook receives messages from any Telegram chat. The key is **mapping every `chat_id` to a role (distributor/retailer) and tenant** at registration time.

***

## Step 1: Distributor Registration Flow

A distributor registers their Telegram number/account via your dashboard or a `/start` command on the bot:

```
Distributor sends: /register_distributor
Bot replies: "Enter your business GSTIN and name to register as a VendorLock distributor."
Distributor sends: GSTN + Business Name
Bot: "✅ You are now registered as [Ravi Distributors]. Your Distributor ID: DIST_001.
     Share this bot link with your retailers to onboard them."
```

**What happens in the backend:**

```python
# When distributor registers
await supabase_service.create_distributor(
    chat_id=str(chat_id),
    tenant_id=generated_tenant_id,   # Each distributor = 1 tenant
    gstin=parsed_gstin,
    business_name=parsed_name,
    role="DISTRIBUTOR"
)
```

Your `telegram_webhook.py` currently hardcodes `"tenant_id": "default"` — this gets replaced with a lookup:

```python
# In your webhook, replace hardcoded tenant_id
identity = await supabase_service.resolve_identity(str(chat_id))
# Returns: { role: "RETAILER", tenant_id: "DIST_001", entity_id: "RET_042" }
```


***

## Step 2: Retailer Onboarding via Deep Link

Each distributor gets a **unique Telegram deep link**:

```
https://t.me/VendorLockBot?start=DIST_001
```

When a retailer clicks this and sends `/start DIST_001`:

```python
if text.startswith("/start "):
    distributor_code = text.split(" ")[^1]      # "DIST_001"
    # Register retailer under this distributor's tenant
    await supabase_service.create_retailer(
        chat_id=str(chat_id),
        tenant_id=distributor_code,
        role="RETAILER"
    )
    # Bot replies in Hindi/regional language
    reply = "नमस्ते! आप [Ravi Distributors] के नेटवर्क में जुड़ गए हैं। अपना ऑर्डर भेजें!"
```


***

## Step 3: Auto-Routing Logic in Your Webhook

Your existing webhook `if "message" in body` block becomes **role-aware**:

```python
identity = await supabase_service.resolve_identity(str(chat_id))

if identity is None:
    # Unknown user — prompt registration
    await send_telegram_message(chat_id, "Please register first. Contact your distributor for a link.")
    return {"ok": True}

if identity["role"] == "RETAILER":
    # Route to Agent 1 → parse order → confirm back to retailer
    state = {
        "raw_message": text,
        "sender_id": str(chat_id),
        "tenant_id": identity["tenant_id"],   # Mapped to their distributor
        "entity_id": identity["entity_id"],
        "channel": "telegram",
        ...
    }
    result = agent1_graph.invoke(state)
    await send_telegram_message(chat_id, result["confirmation_text"])

elif identity["role"] == "DISTRIBUTOR":
    # Distributor commands: /dashboard, /alerts, /beat_plan, etc.
    await handle_distributor_command(chat_id, text, identity)
```


***

## Step 4: The Automated Reply Layer

Every retailer message gets a **structured automated response** back in their language — no human needed:


| Retailer sends | Bot auto-replies |
| :-- | :-- |
| `"bhai 50 Surf 1kg bhej do udhaar pe"` | `"✅ Order noted: Surf 1kg ×50, Credit. Balance: ₹32,000/₹40,000. Reply YES to confirm."` |
| `"MYSCORE"` | `"📊 Your Trust Score: 84/100 (Tier A). Credit Limit: ₹40,000. Keep it up! 🌟"` |
| `"pichhla order kab aayega"` | `"🚚 Last order #ORD-421 dispatched today. Expected delivery: tomorrow."` |
| `"kitna baaki hai mera"` | `"💳 Outstanding: ₹12,400 (due in 8 days). Pay now to maintain Tier A."` |
| Sends invoice photo | `"📄 Invoice scanned. Expiry tracked: Batch HUL2024B, 200 units, 90 days."` |


***

## Step 5: Distributor as Silent Operator

The distributor **never manually replies** — they only see the **dashboard**. The bot is their agent:

```
Distributor sends: /alerts
Bot: "⚠️ 3 alerts today:
     1. Kiran Stores — ₹48,000 overdue (45 days)
     2. Batch HUL2024B — expires in 2 days, file return claim
     3. Rahul — 6 ghost visits this week, ₹14,000 missed"

Distributor sends: /beat_plan today
Bot: "📍 Today's Beat Plan:
     Rahul: Sector 4 (6 outlets, priority: Kiran, Mahesh)
     Suresh: Sector 7 (8 outlets, push: Surf Excel scheme active)"
```


***

## Step 6: Multi-Distributor Isolation

Since each distributor is a **separate tenant**, retailers of Distributor A never interact with Distributor B's data. Your `tenant_id` in every Agent call enforces this — exactly as your current code already passes it.

***

## What You Need to Build Next

| Component | Where | Priority |
| :-- | :-- | :-- |
| `resolve_identity(chat_id)` in `supabase_service` | Backend | 🔴 MVP |
| `/start <code>` deep link handler in webhook | `telegram_webhook.py` | 🔴 MVP |
| `send_telegram_message(chat_id, text)` utility | New service | 🔴 MVP |
| Inline YES/DISPUTE keyboard on every order confirm | Agent 1 output | 🔴 MVP |
| `/alerts`, `/myscore`, `/beat_plan` command handlers | Webhook router | 🟡 V2 |
| Language detection per `chat_id` preference | Agent 1 | 🟡 V2 |

Your `callback_query` handler for `CONFIRM:` and `DISPUTE:` already exists — that's the last piece of the automated loop. Once `resolve_identity` and `send_telegram_message` are wired in, the full chat-native loop closes.[^1]

<div align="center">⁂</div>

[^1]: VendorLock-Somewhat-Supreme-Final.docx

