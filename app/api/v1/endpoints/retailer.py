"""
Retailer / Kirana endpoint — fully wired to Supabase via supabase_service.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional

from app.core.security import get_current_user, TokenData
from app.services import supabase_service
from loguru import logger

router = APIRouter()


class RetailerCreateRequest(BaseModel):
    name: str
    mobile: str
    address: str
    pincode: str
    gstin: Optional[str] = None
    telegram_chat_id: Optional[int] = None


class CreditLimitUpdateRequest(BaseModel):
    new_limit: float
    reason: str = ""


@router.post("/", status_code=201, summary="Onboard a new retailer")
async def onboard_retailer(
    payload: RetailerCreateRequest,
    user: TokenData = Depends(get_current_user),
):
    """
    Onboard a new retailer under the current tenant.
    Sets initial Trust Score to 50 (Tier C — neutral starting point).
    TODO: Send Telegram welcome message to retailer after creation.
    """
    try:
        data = payload.model_dump(exclude_none=True)
        retailer = await supabase_service.create_retailer(user.tenant_id, data)
        retailer_id = retailer.get("id")

        # Create initial trust score record
        if retailer_id:
            await supabase_service.create_initial_trust_score(user.tenant_id, retailer_id)

        return {
            "retailer_id": retailer_id,
            "name": retailer.get("name"),
            "initial_trust_score": 50,
            "initial_tier": "C",
            "credit_limit": float(retailer.get("credit_limit", 10000)),
        }
    except Exception as e:
        logger.error(f"Retailer onboarding failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to create retailer: {str(e)}",
        )


@router.get("/{retailer_id}", summary="Get retailer profile")
async def get_retailer(
    retailer_id: str,
    user: TokenData = Depends(get_current_user),
):
    """Full profile including current trust score and outstanding."""
    retailer = await supabase_service.get_retailer(retailer_id)
    if not retailer:
        raise HTTPException(status_code=404, detail="Retailer not found")

    trust = (retailer.get("trust_scores") or [{}])
    trust_data = trust[0] if isinstance(trust, list) and trust else (trust if isinstance(trust, dict) else {})

    return {
        "retailer_id": retailer["id"],
        "name": retailer.get("name", ""),
        "mobile": retailer.get("mobile", ""),
        "gstin": retailer.get("gstin"),
        "address": retailer.get("address", ""),
        "pincode": retailer.get("pincode", ""),
        "credit_limit": float(retailer.get("credit_limit", 10000)),
        "outstanding": float(retailer.get("outstanding", 0)),
        "trust_score": float(trust_data.get("composite_score", 50)),
        "tier": trust_data.get("tier", "C"),
        "telegram_chat_id": retailer.get("telegram_chat_id"),
        "created_at": retailer.get("created_at"),
    }


@router.get("/{retailer_id}/ledger", summary="Get retailer transaction ledger")
async def get_ledger(
    retailer_id: str,
    limit: int = 50,
    offset: int = 0,
    user: TokenData = Depends(get_current_user),
):
    """Paginated transaction history (orders + returns) for a retailer."""
    try:
        ledger = await supabase_service.get_retailer_ledger(retailer_id, limit, offset)
        return ledger
    except Exception as e:
        logger.error(f"Ledger fetch failed for {retailer_id}: {e}")
        return {"retailer_id": retailer_id, "transactions": [], "total": 0}


@router.patch("/{retailer_id}/credit-limit", summary="Update credit limit for a retailer")
async def update_credit_limit(
    retailer_id: str,
    payload: CreditLimitUpdateRequest,
    user: TokenData = Depends(get_current_user),
):
    """
    Manually update credit limit with mandatory reason for audit compliance.
    Every change is logged to the audit trail with SHA-256 hash.
    """
    if not payload.reason.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="A reason is required to update the credit limit",
        )
    try:
        result = await supabase_service.update_retailer_credit_limit(
            retailer_id=retailer_id,
            new_limit=payload.new_limit,
            reason=payload.reason,
            actor_id=user.user_id,
            tenant_id=user.tenant_id,
        )
        return result
    except Exception as e:
        logger.error(f"Credit limit update failed for {retailer_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to update credit limit: {str(e)}",
        )
