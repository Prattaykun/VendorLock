"""
Telegram Webhook endpoint — receives all Telegram Bot messages.
"""
from fastapi import APIRouter, Request, HTTPException, Header
from typing import Optional
from loguru import logger

from app.core.config import settings

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
    # Validate Telegram's secret header
    if settings.TELEGRAM_WEBHOOK_SECRET:
        if x_telegram_bot_api_secret_token != settings.TELEGRAM_WEBHOOK_SECRET:
            raise HTTPException(status_code=403, detail="Invalid webhook secret")

    body = await request.json()
    logger.debug(f"Telegram update: {body}")

    update_id = body.get("update_id")

    # ── Text message ──────────────────────────────────────────────────────────
    if "message" in body:
        message = body["message"]
        chat_id = message["chat"]["id"]
        text = message.get("text", "")
        photo = message.get("photo")
        voice = message.get("voice")

        logger.info(f"[TG] Message from chat {chat_id}: {text[:80]}")

        # TODO: identify sender (retailer / distributor / salesman) by chat_id
        # TODO: route to Agent 1 for intent parsing
        # TODO: handle MYSCORE command → trust_score endpoint
        # TODO: handle voice notes → transcribe → Agent 1

    # ── Callback query (inline keyboard: YES / DISPUTE) ──────────────────────
    elif "callback_query" in body:
        callback = body["callback_query"]
        data = callback.get("data", "")
        chat_id = callback["message"]["chat"]["id"]
        logger.info(f"[TG] Callback from chat {chat_id}: {data}")

        if data.startswith("CONFIRM:"):
            order_id = data.split(":")[1]
            # TODO: call orders.confirm_order(order_id)
            logger.info(f"Order {order_id} confirmed via Telegram")

        elif data.startswith("DISPUTE:"):
            order_id = data.split(":")[1]
            # TODO: call orders.dispute_order(order_id)
            logger.info(f"Order {order_id} disputed via Telegram")

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
