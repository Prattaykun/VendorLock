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

        # Handle MYSCORE command
        if text.strip().upper() in ("MYSCORE", "MY SCORE", "MERA SCORE"):
            # Return trust score for this retailer
            logger.info(f"[TG] MYSCORE command from {chat_id}")
            # In production: look up retailer by chat_id and return score
            return {"ok": True, "update_id": update_id, "handled": "MYSCORE"}

        # Route to Agent 1 for intent parsing
        if text and len(text.strip()) > 2:
            try:
                state = {
                    "raw_message": text,
                    "sender_id": str(chat_id),
                    "tenant_id": "default",  # In production: map chat_id to tenant
                    "channel": "telegram",
                    "language_hint": "auto",
                    "parsed_event": None,
                    "confirmation_text": None,
                    "error": None,
                }
                result = agent1_graph.invoke(state)
                logger.info(f"[TG] Agent 1 parsed: {result.get('parsed_event', {}).get('intent', '?')}")

                # In production: send confirmation_text back to Telegram
                confirmation = result.get("confirmation_text", "Message received.")
                logger.info(f"[TG] Confirmation to send: {confirmation[:100]}")

            except Exception as e:
                logger.error(f"[TG] Agent 1 invocation failed: {e}")

    # ── Callback query (inline keyboard: YES / DISPUTE) ──────────────────────
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
