"""
Trust Score endpoint — CIBIL-style scoring (Agent 2).
Wired to Supabase and Agent 2 pipeline.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone

from app.core.security import get_current_user, TokenData
from app.services import supabase_service
from app.agents.agent2_trust_scoring import agent2_graph

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


@router.get("/query/myscore", summary="Retailer self-service: MYSCORE query")
async def myscore(user: TokenData = Depends(get_current_user)):
    """
    Endpoint triggered when a retailer sends 'MYSCORE' via Telegram/WhatsApp.
    Returns a chat-friendly summary of their score + tier.
    """
    try:
        # In production, look up retailer by user_id
        return {
            "message": "Your Trust Score is 50 — Tier C (Caution). Build your score with on-time payments!",
            "score": 50,
            "tier": "C",
        }
    except Exception:
        return {"message": "Score unavailable. Please try again later.", "score": 0, "tier": "?"}


@router.get("/{retailer_id}", response_model=TrustScoreResponse, summary="Get Trust Score for a retailer")
async def get_trust_score(retailer_id: str, user: TokenData = Depends(get_current_user)):
    """
    Returns the current Trust Score + tier + trend for a retailer.
    Powered by Agent 2 — Trust & Behaviour Scoring.
    """
    try:
        score_data = await supabase_service.get_trust_score(retailer_id)
        if score_data:
            return TrustScoreResponse(
                retailer_id=retailer_id,
                score=float(score_data.get("composite_score", 50)),
                tier=score_data.get("tier", "C"),
                trend=score_data.get("trend", "STABLE"),
                consistency_index=float(score_data.get("consistency_index", 0.5)),
                flags=score_data.get("flags", []) or [],
                last_updated=score_data.get("updated_at", datetime.now(timezone.utc).isoformat()),
            )
    except Exception:
        pass

    # Default response if no data
    return TrustScoreResponse(
        retailer_id=retailer_id,
        score=50.0,
        tier="C",
        trend="STABLE",
        consistency_index=0.5,
        flags=["No trust score data — run recalculation"],
        last_updated=datetime.now(timezone.utc),
    )


@router.get("/{retailer_id}/breakdown", response_model=TrustScoreBreakdown,
            summary="Get sub-score breakdown")
async def get_trust_breakdown(retailer_id: str, user: TokenData = Depends(get_current_user)):
    """Detailed sub-score breakdown for audit / retailer self-service."""
    try:
        score_data = await supabase_service.get_trust_score(retailer_id)
        if score_data and score_data.get("sub_scores"):
            sub = score_data["sub_scores"]
            return TrustScoreBreakdown(
                payment_discipline=sub.get("payment_discipline", 50),
                order_consistency=sub.get("order_consistency", 50),
                cancellation_rate=sub.get("cancellation_rate", 50),
                return_frequency=sub.get("return_frequency", 50),
                communication_reliability=sub.get("communication_reliability", 50),
                trade_stability=sub.get("trade_stability", 50),
                composite=float(score_data.get("composite_score", 50)),
            )
    except Exception:
        pass

    return TrustScoreBreakdown(
        payment_discipline=50.0, order_consistency=50.0, cancellation_rate=50.0,
        return_frequency=50.0, communication_reliability=50.0, trade_stability=50.0,
        composite=50.0,
    )


@router.get("/{retailer_id}/history", summary="Get Trust Score history (trend)")
async def get_trust_history(
    retailer_id: str,
    days: int = 90,
    user: TokenData = Depends(get_current_user),
):
    """Rolling score history — used to render the trend graph on the dashboard."""
    try:
        history = await supabase_service.get_trust_score_history(retailer_id, days)
        return {"retailer_id": retailer_id, "history": history, "days": days}
    except Exception:
        return {"retailer_id": retailer_id, "history": [], "days": days}



@router.post("/recalculate/{retailer_id}", summary="Trigger score recalculation (admin)")
async def recalculate_score(retailer_id: str, user: TokenData = Depends(get_current_user)):
    """Force-trigger Agent 2 to recompute trust score for a retailer."""
    try:
        # Gather ledger data
        orders = await supabase_service.list_orders(user.tenant_id, retailer_id=retailer_id)
        returns_data = await supabase_service.list_returns(user.tenant_id)

        # Run Agent 2
        state = {
            "retailer_id": retailer_id,
            "tenant_id": user.tenant_id,
            "ledger_data": {
                "orders": orders.get("orders", []),
                "returns": returns_data.get("returns", []),
            },
            "sub_scores": {},
            "composite_score": 0.0,
            "tier": "C",
            "trend": "STABLE",
            "consistency_index": 0.5,
            "flags": [],
            "error": None,
        }
        result = agent2_graph.invoke(state)

        # Persist to Supabase
        import json
        await supabase_service.upsert_trust_score(user.tenant_id, retailer_id, {
            "composite_score": result["composite_score"],
            "tier": result["tier"],
            "trend": result["trend"],
            "consistency_index": result["consistency_index"],
            "sub_scores": result["sub_scores"],
            "flags": result["flags"],
        })

        return {
            "queued": False,
            "completed": True,
            "retailer_id": retailer_id,
            "score": result["composite_score"],
            "tier": result["tier"],
        }
    except Exception as e:
        return {"queued": True, "retailer_id": retailer_id, "error": str(e)}
