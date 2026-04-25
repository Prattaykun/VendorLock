"""
Retailer / Kirana endpoint.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.core.security import get_current_user, TokenData

router = APIRouter()


class RetailerProfile(BaseModel):
    retailer_id: str
    name: str
    gstin: Optional[str] = None
    mobile: str
    address: str
    pincode: str
    credit_limit: float
    outstanding: float
    trust_score: float
    tier: str


@router.post("/", status_code=201, summary="Onboard a new retailer")
async def onboard_retailer(
    name: str,
    mobile: str,
    address: str,
    pincode: str,
    gstin: Optional[str] = None,
    user: TokenData = Depends(get_current_user),
):
    """
    Onboard a new retailer. Requires GSTN or Aadhaar-linked mobile.
    Initial Trust Score set to 50 (neutral starting point).
    """
    # TODO: create retailer in DB, set trust_score=50, send welcome Telegram message
    return {
        "retailer_id": "RET-" + datetime.utcnow().strftime("%Y%m%d%H%M%S"),
        "initial_trust_score": 50,
        "initial_tier": "C",
        "credit_limit": 10000.0,    # "Trust Building" band
    }


@router.get("/{retailer_id}", response_model=RetailerProfile, summary="Get retailer profile")
async def get_retailer(retailer_id: str, user: TokenData = Depends(get_current_user)):
    """Full profile including current trust score and outstanding."""
    # TODO: fetch from retailers + trust_scores
    return RetailerProfile(
        retailer_id=retailer_id,
        name="Kiran Stores",
        mobile="9801234567",
        address="Shop 12, Station Road, Patna",
        pincode="800001",
        credit_limit=40000.0,
        outstanding=32000.0,
        trust_score=88.0,
        tier="A",
    )


@router.get("/{retailer_id}/ledger", summary="Get retailer transaction ledger")
async def get_ledger(
    retailer_id: str,
    limit: int = 50,
    offset: int = 0,
    user: TokenData = Depends(get_current_user),
):
    """Paginated transaction history (orders, payments, returns) for a retailer."""
    # TODO: query ledger table
    return {"retailer_id": retailer_id, "transactions": [], "total": 0}


@router.patch("/{retailer_id}/credit-limit", summary="Update credit limit for a retailer")
async def update_credit_limit(
    retailer_id: str,
    new_limit: float,
    reason: str = "",
    user: TokenData = Depends(get_current_user),
):
    """
    Manually update credit limit. Every change is logged to the audit trail.
    Must be backed by a reason for audit compliance.
    """
    # TODO: update in DB, log to audit_events with SHA-256 hash
    return {"retailer_id": retailer_id, "new_credit_limit": new_limit, "reason": reason}
