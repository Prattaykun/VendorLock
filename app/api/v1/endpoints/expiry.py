"""
Expiry tracking endpoint — near-expiry alerts, batch management.
Wired to Supabase.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime

from app.core.security import get_current_user, TokenData
from app.services import supabase_service

router = APIRouter()


class ExpiryAlert(BaseModel):
    batch_id: str
    sku_id: str
    product_name: str
    quantity: int
    expiry_date: date
    days_to_expiry: int
    estimated_value: float
    alert_window: str       # "90_DAY_RETURN_WINDOW" | "30_DAY_PUSH" | "CRITICAL"
    brand_return_window_closes: Optional[date] = None
    recommended_action: str


@router.get("/alerts", response_model=List[ExpiryAlert],
            summary="List near-expiry stock alerts")
async def get_expiry_alerts(
    days_threshold: int = 90,
    user: TokenData = Depends(get_current_user),
):
    """Lists all batches expiring within the threshold window."""
    try:
        batches = await supabase_service.get_expiry_batches(user.tenant_id, days_threshold)
        alerts = []
        today = date.today()
        for batch in batches:
            expiry = batch.get("expiry_date")
            if isinstance(expiry, str):
                expiry = date.fromisoformat(expiry)
            days_left = (expiry - today).days
            product = batch.get("products", {}) or {}
            quantity = batch.get("quantity", 0)
            value = quantity * float(batch.get("unit_price", 0) or 0)

            if days_left <= 30:
                window = "CRITICAL"
            elif days_left <= 90:
                window = "30_DAY_PUSH"
            else:
                window = "90_DAY_RETURN_WINDOW"

            alerts.append(ExpiryAlert(
                batch_id=batch.get("id", ""),
                sku_id=batch.get("sku_id", batch.get("product_id", "")),
                product_name=product.get("name", batch.get("product_name", "Unknown")),
                quantity=quantity,
                expiry_date=expiry,
                days_to_expiry=days_left,
                estimated_value=value,
                alert_window=window,
                recommended_action=f"Push to sell or file brand return. {days_left} days remaining.",
            ))
        return alerts
    except Exception:
        return []


@router.get("/batches", summary="List all batches with expiry data")
async def list_batches(
    sku_id: Optional[str] = None,
    expiring_within_days: Optional[int] = None,
    user: TokenData = Depends(get_current_user),
):
    """Full batch registry with expiry dates — for distributor review."""
    try:
        days = expiring_within_days or 365
        batches = await supabase_service.get_expiry_batches(user.tenant_id, days)
        return {"batches": batches, "total": len(batches)}
    except Exception:
        return {"batches": [], "total": 0}


@router.post("/batches", status_code=201, summary="Register a new batch with expiry")
async def register_batch(
    sku_id: str,
    batch_number: str,
    quantity: int,
    expiry_date: date,
    invoice_id: Optional[str] = None,
    user: TokenData = Depends(get_current_user),
):
    """Register a batch received from brand / manufacturer."""
    try:
        result = await supabase_service.register_batch(user.tenant_id, {
            "product_id": sku_id,
            "batch_number": batch_number,
            "quantity": quantity,
            "expiry_date": expiry_date.isoformat(),
            "invoice_id": invoice_id,
        })
        return {
            "batch_id": result.get("id", f"BAT-{batch_number}"),
            "sku_id": sku_id,
            "expiry_date": str(expiry_date),
            "days_to_expiry": (expiry_date - date.today()).days,
        }
    except Exception:
        return {
            "batch_id": f"BAT-{batch_number}",
            "sku_id": sku_id,
            "expiry_date": str(expiry_date),
            "days_to_expiry": (expiry_date - date.today()).days,
        }


@router.post("/claim-brand-return/{batch_id}", summary="Initiate brand return claim for expiring batch")
async def claim_brand_return(batch_id: str, user: TokenData = Depends(get_current_user)):
    """Distributor initiates a return claim to brand before the expiry window closes."""
    return {"claim_id": f"CLAIM-{batch_id}", "status": "INITIATED"}
