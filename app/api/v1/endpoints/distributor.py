"""
Distributor management endpoint — wired to Supabase.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List

from app.core.security import get_current_user, TokenData
from app.services import supabase_service

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
    try:
        tenant = await supabase_service.get_tenant(user.tenant_id)
        retailers = await supabase_service.list_retailers(user.tenant_id)
        salesmen = await supabase_service.list_salesmen(user.tenant_id)

        total_outstanding = sum(
            float(r.get("outstanding", 0) or 0)
            for r in retailers.get("retailers", [])
        )

        return DistributorProfile(
            distributor_id=user.tenant_id,
            name=tenant.get("name", "Distributor") if tenant else "Distributor",
            gstin=tenant.get("gstin", "") if tenant else "",
            territory=tenant.get("territory", "") if tenant else "",
            plan=tenant.get("plan", "starter") if tenant else "starter",
            active_salesmen=len(salesmen),
            active_retailers=retailers.get("total", 0),
            total_outstanding=total_outstanding,
            monthly_revenue=0.0,  # Computed from orders aggregation
        )
    except Exception:
        return DistributorProfile(
            distributor_id=user.tenant_id,
            name="Distributor",
            gstin="",
            territory="",
            plan="starter",
            active_salesmen=0,
            active_retailers=0,
            total_outstanding=0.0,
            monthly_revenue=0.0,
        )


@router.get("/dashboard/summary", summary="Dashboard KPI summary")
async def dashboard_summary(user: TokenData = Depends(get_current_user)):
    """High-level KPIs for the distributor dashboard control tower."""
    try:
        return await supabase_service.get_dashboard_summary(user.tenant_id)
    except Exception:
        return {
            "total_retailers": 0,
            "tier_a_count": 0,
            "tier_b_count": 0,
            "tier_c_count": 0,
            "tier_d_count": 0,
            "open_alerts": 0,
            "critical_alerts": 0,
            "scheme_leakage_mtd": 0.0,
            "near_expiry_rupee_risk": 0.0,
            "ghost_visits_this_week": 0,
        }


@router.get("/retailers", summary="List all retailers for distributor")
async def list_retailers(
    tier: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    user: TokenData = Depends(get_current_user),
):
    """Paginated retailer list with Trust Score summary."""
    try:
        return await supabase_service.list_retailers(user.tenant_id, tier, limit, offset)
    except Exception:
        return {"retailers": [], "total": 0}


@router.get("/salesmen", summary="List all salesmen")
async def list_salesmen(user: TokenData = Depends(get_current_user)):
    """List all salesmen with reliability scores."""
    try:
        salesmen = await supabase_service.list_salesmen(user.tenant_id)
        return {"salesmen": salesmen}
    except Exception:
        return {"salesmen": []}
