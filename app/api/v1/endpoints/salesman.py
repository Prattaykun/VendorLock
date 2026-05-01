"""
Salesman endpoint — beat metrics, reliability scores, wired to Supabase.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from datetime import date

from app.core.security import get_current_user, TokenData
from app.services import supabase_service
from loguru import logger

router = APIRouter()


class SalesmanCreateRequest(BaseModel):
    name: str
    mobile: str
    route: str
    telegram_chat_id: Optional[int] = None


@router.get("/", summary="List all salesmen with reliability scores")
async def list_salesmen(user: TokenData = Depends(get_current_user)):
    """List all active salesmen for the current tenant."""
    try:
        salesmen = await supabase_service.list_salesmen(user.tenant_id)
        return {"salesmen": salesmen, "total": len(salesmen)}
    except Exception as e:
        logger.error(f"Failed to list salesmen: {e}")
        return {"salesmen": [], "total": 0}


@router.post("/", status_code=201, summary="Add a new salesman")
async def add_salesman(
    payload: SalesmanCreateRequest,
    user: TokenData = Depends(get_current_user),
):
    """Register a new field salesman under the distributor tenant."""
    try:
        data = payload.model_dump(exclude_none=True)
        salesman = await supabase_service.create_salesman(user.tenant_id, data)
        return {
            "salesman_id": salesman.get("id"),
            "name": salesman.get("name"),
            "route": salesman.get("route"),
            "mobile": salesman.get("mobile"),
        }
    except Exception as e:
        logger.error(f"Failed to create salesman: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to create salesman: {str(e)}",
        )


@router.get("/{salesman_id}/reliability", summary="Get reliability score for a salesman")
async def salesman_reliability(
    salesman_id: str,
    user: TokenData = Depends(get_current_user),
):
    """
    Compute reliability score from actual beat_checkins and order logs.
    Returns ghost visit rate, coverage %, collection confirmation rate,
    and an overall reliability score.
    """
    try:
        score = await supabase_service.compute_salesman_reliability(user.tenant_id, salesman_id)
        return score
    except Exception as e:
        logger.error(f"Reliability computation failed for {salesman_id}: {e}")
        # Return a neutral placeholder so the dashboard doesn't break
        return {
            "salesman_id": salesman_id,
            "ghost_visit_rate": 0.0,
            "collection_confirmation_rate": 0.0,
            "outlets_covered_this_week": 0,
            "outlets_target_this_week": 0,
            "coverage_pct": 0.0,
            "overall_reliability_score": 0.0,
            "error": "Could not compute score — insufficient data",
        }


@router.get("/{salesman_id}/beat-history", summary="Check-in and beat history")
async def beat_history(
    salesman_id: str,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    user: TokenData = Depends(get_current_user),
):
    """Historical check-ins + route coverage for a salesman."""
    try:
        days = 7
        if from_date and to_date:
            days = (to_date - from_date).days or 7
        checkins = await supabase_service.get_checkin_logs(
            user.tenant_id, salesman_id, days=days
        )
        return {
            "salesman_id": salesman_id,
            "checkins": checkins,
            "total": len(checkins),
            "from_date": str(from_date) if from_date else None,
            "to_date": str(to_date) if to_date else None,
        }
    except Exception as e:
        logger.error(f"Beat history fetch failed for {salesman_id}: {e}")
        return {"salesman_id": salesman_id, "checkins": [], "total": 0}
