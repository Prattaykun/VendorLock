"""
Trust Score endpoint — CIBIL-style scoring (Agent 2).
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from app.core.security import get_current_user, TokenData

router = APIRouter()


class TrustScoreResponse(BaseModel):
    retailer_id: str
    score: float
    tier: str           # A | B | C | D
    trend: str          # UP | DOWN | STABLE
    consistency_index: float
    flags: List[str]
    last_updated: datetime


class TrustScoreBreakdown(BaseModel):
    payment_discipline: float
    order_consistency: float
    cancellation_rate: float
    return_frequency: float
    communication_reliability: float
    trade_stability: float
    composite: float


@router.get("/{retailer_id}", response_model=TrustScoreResponse, summary="Get Trust Score for a retailer")
async def get_trust_score(retailer_id: str, user: TokenData = Depends(get_current_user)):
    """
    Returns the current Trust Score + tier + trend for a retailer.
    Powered by Agent 2 — Trust & Behaviour Scoring.
    """
    # TODO: fetch from Agent 2 cache / PostgreSQL trust_scores table
    return TrustScoreResponse(
        retailer_id=retailer_id,
        score=75.5,
        tier="B",
        trend="UP",
        consistency_index=0.82,
        flags=["1 late payment last 30 days"],
        last_updated=datetime.utcnow(),
    )


@router.get("/{retailer_id}/breakdown", response_model=TrustScoreBreakdown,
            summary="Get sub-score breakdown")
async def get_trust_breakdown(retailer_id: str, user: TokenData = Depends(get_current_user)):
    """Detailed sub-score breakdown for audit / retailer self-service."""
    # TODO: compute from Agent 2 ledger data
    return TrustScoreBreakdown(
        payment_discipline=80.0,
        order_consistency=70.0,
        cancellation_rate=75.0,
        return_frequency=85.0,
        communication_reliability=60.0,
        trade_stability=90.0,
        composite=75.5,
    )


@router.get("/{retailer_id}/history", summary="Get Trust Score history (trend)")
async def get_trust_history(
    retailer_id: str,
    days: int = 90,
    user: TokenData = Depends(get_current_user),
):
    """Rolling score history — used to render the trend graph on the dashboard."""
    # TODO: query trust_score_history table
    return {"retailer_id": retailer_id, "history": [], "days": days}


@router.get("/query/myscore", summary="Retailer self-service: MYSCORE query")
async def myscore(user: TokenData = Depends(get_current_user)):
    """
    Endpoint triggered when a retailer sends 'MYSCORE' via Telegram/WhatsApp.
    Returns a chat-friendly summary of their score + tier.
    """
    # TODO: look up retailer by user.user_id, return formatted score
    return {
        "message": "Your Trust Score is 75 — Tier B (Reliable). Keep it up!",
        "score": 75,
        "tier": "B",
    }


@router.post("/recalculate/{retailer_id}", summary="Trigger score recalculation (admin)")
async def recalculate_score(retailer_id: str, user: TokenData = Depends(get_current_user)):
    """Force-trigger Agent 2 to recompute trust score for a retailer."""
    # TODO: enqueue Agent 2 recalc job
    return {"queued": True, "retailer_id": retailer_id}
