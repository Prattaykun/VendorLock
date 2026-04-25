"""
Salesman endpoint — beat metrics, reliability scores.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List
from datetime import date

from app.core.security import get_current_user, TokenData

router = APIRouter()


class SalesmanReliabilityScore(BaseModel):
    salesman_id: str
    name: str
    ghost_visit_rate: float      # % of check-ins without orders or messages
    collection_confirmation_rate: float
    outlets_covered_this_week: int
    outlets_target_this_week: int
    coverage_pct: float
    overall_reliability_score: float


@router.get("/", summary="List all salesmen with reliability scores")
async def list_salesmen(user: TokenData = Depends(get_current_user)):
    """Salesmen list with Agent 6 reliability metrics."""
    # TODO: query salesmen + beat_metrics tables
    return {"salesmen": []}


@router.get("/{salesman_id}/reliability", response_model=SalesmanReliabilityScore,
            summary="Get reliability score for a salesman")
async def salesman_reliability(salesman_id: str, user: TokenData = Depends(get_current_user)):
    """Agent 6 computed reliability score with ghost visit metrics."""
    # TODO: compute from beat_checkins and order logs
    return SalesmanReliabilityScore(
        salesman_id=salesman_id,
        name="Rahul Kumar",
        ghost_visit_rate=0.24,
        collection_confirmation_rate=0.87,
        outlets_covered_this_week=19,
        outlets_target_this_week=25,
        coverage_pct=0.76,
        overall_reliability_score=72.0,
    )


@router.get("/{salesman_id}/beat-history", summary="Check-in and beat history")
async def beat_history(
    salesman_id: str,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    user: TokenData = Depends(get_current_user),
):
    """Historical check-ins + route coverage for a salesman."""
    # TODO: query beat_checkins table
    return {"salesman_id": salesman_id, "checkins": []}


@router.post("/", status_code=201, summary="Add a new salesman")
async def add_salesman(
    name: str,
    mobile: str,
    route: str,
    user: TokenData = Depends(get_current_user),
):
    """Register a new field salesman under the distributor tenant."""
    # TODO: create salesman in DB, send onboarding message via Telegram
    return {"salesman_id": "SAL-001", "name": name, "route": route}
