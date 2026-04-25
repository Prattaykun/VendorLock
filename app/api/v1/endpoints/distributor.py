"""
Distributor management endpoint.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List

from app.core.security import get_current_user, TokenData

router = APIRouter()


class DistributorProfile(BaseModel):
    distributor_id: str
    name: str
    gstin: str
    territory: str
    plan: str           # starter | growth | enterprise
    active_salesmen: int
    active_retailers: int
    total_outstanding: float
    monthly_revenue: float


@router.get("/profile", response_model=DistributorProfile,
            summary="Get distributor profile / control tower summary")
async def get_profile(user: TokenData = Depends(get_current_user)):
    """Distributor control tower overview."""
    # TODO: fetch from distributors table + aggregate stats
    return DistributorProfile(
        distributor_id=user.tenant_id,
        name="Mock Distributor",
        gstin="22AAAAA0000A1Z5",
        territory="Patna, Bihar",
        plan="growth",
        active_salesmen=5,
        active_retailers=400,
        total_outstanding=840000.0,
        monthly_revenue=3500000.0,
    )


@router.get("/dashboard/summary", summary="Dashboard KPI summary")
async def dashboard_summary(user: TokenData = Depends(get_current_user)):
    """High-level KPIs for the distributor dashboard control tower."""
    # TODO: compute from aggregated ledger data
    return {
        "total_retailers": 400,
        "tier_a_count": 120,
        "tier_b_count": 180,
        "tier_c_count": 70,
        "tier_d_count": 30,
        "open_alerts": 12,
        "critical_alerts": 3,
        "scheme_leakage_mtd": 47000.0,
        "near_expiry_rupee_risk": 82000.0,
        "ghost_visits_this_week": 6,
    }


@router.get("/retailers", summary="List all retailers for distributor")
async def list_retailers(
    tier: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    user: TokenData = Depends(get_current_user),
):
    """Paginated retailer list with Trust Score summary."""
    # TODO: query retailers + trust_scores tables
    return {"retailers": [], "total": 0}


@router.get("/salesmen", summary="List all salesmen")
async def list_salesmen(user: TokenData = Depends(get_current_user)):
    """List all salesmen with reliability scores."""
    # TODO: query salesmen + beat_metrics tables
    return {"salesmen": []}
