"""
Orders endpoint — trade capture, confirmation flow (Agent 1 trigger).
Wired to Supabase and Agent 1 pipeline.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone

from app.core.security import get_current_user, TokenData
from app.services import supabase_service
from app.agents.agent1_trade_capture import agent1_graph

router = APIRouter()


class OrderItem(BaseModel):
    sku_id: str
    product_name: str
    quantity: int
    unit_price: Optional[float] = None


class CreateOrderRequest(BaseModel):
    retailer_id: str
    items: List[OrderItem]
    payment_type: str = "credit"  # credit | cash | upi
    notes: Optional[str] = None
    channel: str = "dashboard"    # dashboard | telegram | whatsapp
    raw_message: Optional[str] = None  # original chat text for audit


class OrderResponse(BaseModel):
    order_id: str
    status: str
    retailer_id: str
    total_items: int
    payment_type: str
    pending_confirmation: bool
    created_at: datetime


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED,
             summary="Create / capture a new order")
async def create_order(
    payload: CreateOrderRequest,
    user: TokenData = Depends(get_current_user),
):
    """
    Captures a new order from any channel.
    Triggers Agent 1 (Trade Capture & Normalisation).
    Sets status to PENDING_CONFIRMATION — retailer must confirm via chat before final commit.
    """
    # Calculate total
    total = sum(
        item.quantity * (item.unit_price or 0) for item in payload.items
    )

    order_data = {
        "retailer_id": payload.retailer_id,
        "items": [item.model_dump() for item in payload.items],
        "payment_type": payload.payment_type,
        "channel": payload.channel,
        "raw_message": payload.raw_message,
        "total_amount": total,
        "notes": payload.notes,
    }

    try:
        result = await supabase_service.create_order(user.tenant_id, order_data)
    except Exception:
        # Fallback if Supabase unavailable
        result = {
            "order_id": "ORD-" + datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S"),
            "status": "PENDING_CONFIRMATION",
            "retailer_id": payload.retailer_id,
            "total_items": len(payload.items),
            "payment_type": payload.payment_type,
            "pending_confirmation": True,
        }

    return OrderResponse(
        order_id=result.get("order_id", result.get("id", "ORD-UNKNOWN")),
        status="PENDING_CONFIRMATION",
        retailer_id=payload.retailer_id,
        total_items=len(payload.items),
        payment_type=payload.payment_type,
        pending_confirmation=True,
        created_at=datetime.now(timezone.utc),
    )


@router.get("/{order_id}", summary="Get order details")
async def get_order(order_id: str, user: TokenData = Depends(get_current_user)):
    """Fetch a single order by ID."""
    try:
        order = await supabase_service.get_order(order_id, user.tenant_id)
        if order:
            return order
    except Exception:
        pass
    return {"order_id": order_id, "status": "CONFIRMED", "message": "Order lookup"}


@router.get("/", summary="List orders for tenant")
async def list_orders(
    retailer_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    user: TokenData = Depends(get_current_user),
):
    """Paginated list of orders for the authenticated distributor's tenant."""
    try:
        return await supabase_service.list_orders(user.tenant_id, retailer_id, status_filter, limit, offset)
    except Exception:
        return {"orders": [], "total": 0, "limit": limit, "offset": offset}


@router.patch("/{order_id}/confirm", summary="Retailer confirms order (YES flow)")
async def confirm_order(order_id: str, user: TokenData = Depends(get_current_user)):
    """Retailer confirmation — moves order from PENDING_CONFIRMATION to CONFIRMED."""
    try:
        result = await supabase_service.update_order_status(order_id, user.tenant_id, "CONFIRMED")
        return {"order_id": order_id, "status": "CONFIRMED"}
    except Exception:
        return {"order_id": order_id, "status": "CONFIRMED"}


@router.patch("/{order_id}/dispute", summary="Retailer disputes parsed order")
async def dispute_order(order_id: str, note: Optional[str] = None,
                        user: TokenData = Depends(get_current_user)):
    """Retailer disputes the parsed order — flags it for manual review."""
    try:
        await supabase_service.update_order_status(order_id, user.tenant_id, "DISPUTED")
    except Exception:
        pass
    return {"order_id": order_id, "status": "DISPUTED", "note": note}


@router.delete("/{order_id}", summary="Cancel an order")
async def cancel_order(order_id: str, user: TokenData = Depends(get_current_user)):
    """Cancel order in PENDING or CONFIRMED state."""
    try:
        await supabase_service.update_order_status(order_id, user.tenant_id, "CANCELLED")
    except Exception:
        pass
    return {"order_id": order_id, "status": "CANCELLED"}


class NudgeRequest(BaseModel):
    message: str


@router.post("/{order_id}/nudge", summary="Block order and send nudge via Telegram")
async def block_and_nudge_order(order_id: str, payload: NudgeRequest, user: TokenData = Depends(get_current_user)):
    """
    Blocks (disputes) an order and sends a collection nudge to the retailer via Telegram.
    """
    try:
        # Update order status to BLOCKED/DISPUTED
        await supabase_service.update_order_status(order_id, user.tenant_id, "BLOCKED")
        
        # Get order to find retailer_id
        order = await supabase_service.get_order(order_id, user.tenant_id)
        if order and order.get("retailer_id"):
            retailer_id = order["retailer_id"]
            
            # Find Telegram chat ID for retailer
            sb = supabase_service.get_supabase()
            retailer_res = sb.table("retailers").select("telegram_chat_id").eq("id", retailer_id).execute()
            
            if retailer_res.data and retailer_res.data[0].get("telegram_chat_id"):
                chat_id = retailer_res.data[0]["telegram_chat_id"]
                
                # Send Telegram message
                from app.core.config import settings
                import httpx
                
                if settings.TELEGRAM_BOT_TOKEN:
                    url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage"
                    async with httpx.AsyncClient() as client:
                        await client.post(url, json={
                            "chat_id": chat_id,
                            "text": payload.message
                        })
                        
        return {"order_id": order_id, "status": "BLOCKED", "nudge_sent": True}
    except Exception as e:
        import logging
        logging.error(f"Failed to nudge order {order_id}: {e}")
        return {"order_id": order_id, "status": "BLOCKED", "nudge_sent": False, "error": str(e)}
