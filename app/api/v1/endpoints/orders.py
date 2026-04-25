"""
Orders endpoint — trade capture, confirmation flow (Agent 1 trigger).
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.core.security import get_current_user, TokenData

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
    # TODO: invoke Agent 1 pipeline via LangGraph
    # TODO: persist to PostgreSQL ledger
    # TODO: send Telegram confirmation to retailer
    return OrderResponse(
        order_id="ORD-" + datetime.utcnow().strftime("%Y%m%d%H%M%S"),
        status="PENDING_CONFIRMATION",
        retailer_id=payload.retailer_id,
        total_items=len(payload.items),
        payment_type=payload.payment_type,
        pending_confirmation=True,
        created_at=datetime.utcnow(),
    )


@router.get("/{order_id}", summary="Get order details")
async def get_order(order_id: str, user: TokenData = Depends(get_current_user)):
    """Fetch a single order by ID."""
    # TODO: fetch from PostgreSQL ledger
    return {"order_id": order_id, "status": "CONFIRMED", "message": "Fetch from DB — TODO"}


@router.get("/", summary="List orders for tenant")
async def list_orders(
    retailer_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    user: TokenData = Depends(get_current_user),
):
    """Paginated list of orders for the authenticated distributor's tenant."""
    # TODO: query PostgreSQL with tenant_id filter
    return {"orders": [], "total": 0, "limit": limit, "offset": offset}


@router.patch("/{order_id}/confirm", summary="Retailer confirms order (YES flow)")
async def confirm_order(order_id: str, user: TokenData = Depends(get_current_user)):
    """Retailer confirmation — moves order from PENDING_CONFIRMATION to CONFIRMED."""
    # TODO: update ledger, trigger Agent 2 & 3
    return {"order_id": order_id, "status": "CONFIRMED"}


@router.patch("/{order_id}/dispute", summary="Retailer disputes parsed order")
async def dispute_order(order_id: str, note: Optional[str] = None,
                        user: TokenData = Depends(get_current_user)):
    """Retailer disputes the parsed order — flags it for manual review."""
    # TODO: update ledger, queue for human review
    return {"order_id": order_id, "status": "DISPUTED", "note": note}


@router.delete("/{order_id}", summary="Cancel an order")
async def cancel_order(order_id: str, user: TokenData = Depends(get_current_user)):
    """Cancel order in PENDING or CONFIRMED state."""
    # TODO: cancel in ledger, adjust Trust Score via Agent 2
    return {"order_id": order_id, "status": "CANCELLED"}
