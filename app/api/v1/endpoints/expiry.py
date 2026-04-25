"""
Expiry tracking endpoint — near-expiry alerts, batch management.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime

from app.core.security import get_current_user, TokenData

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
    """
    Lists all batches expiring within the threshold window.
    90-day = brand return window, 30-day = push-to-sell.
    """
    # TODO: query batch_inventory table, compute days_to_expiry
    return []


@router.get("/batches", summary="List all batches with expiry data")
async def list_batches(
    sku_id: Optional[str] = None,
    expiring_within_days: Optional[int] = None,
    user: TokenData = Depends(get_current_user),
):
    """Full batch registry with expiry dates — for distributor review."""
    # TODO: query batch_inventory table
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
    """
    Register a batch received from brand / manufacturer.
    Expiry date is cross-validated (must be in future, reasonable range).
    """
    # TODO: persist batch, trigger Agent 3 expiry monitoring
    return {
        "batch_id": f"BAT-{batch_number}",
        "sku_id": sku_id,
        "expiry_date": str(expiry_date),
        "days_to_expiry": (expiry_date - date.today()).days,
    }


@router.post("/claim-brand-return/{batch_id}", summary="Initiate brand return claim for expiring batch")
async def claim_brand_return(batch_id: str, user: TokenData = Depends(get_current_user)):
    """
    Distributor initiates a return claim to brand before the expiry window closes.
    Generates claim document and tracks claim status.
    """
    # TODO: create brand_return_claim record, generate PDF claim
    return {"claim_id": f"CLAIM-{batch_id}", "status": "INITIATED"}
