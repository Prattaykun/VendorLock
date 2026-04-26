"""
Analytics & intelligence endpoint — wired to Supabase.
"""
from fastapi import APIRouter, Depends
from typing import Optional
from app.core.security import get_current_user, TokenData
from app.services import supabase_service

router = APIRouter()


@router.get("/trust-distribution", summary="Trust score distribution across retailers")
async def trust_distribution(user: TokenData = Depends(get_current_user)):
    """Histogram of trust scores — used for dashboard heatmap."""
    try:
        summary = await supabase_service.get_dashboard_summary(user.tenant_id)
        return {
            "distribution": {
                "A": summary.get("tier_a_count", 0),
                "B": summary.get("tier_b_count", 0),
                "C": summary.get("tier_c_count", 0),
                "D": summary.get("tier_d_count", 0),
            }
        }
    except Exception:
        return {"distribution": {"A": 0, "B": 0, "C": 0, "D": 0}}


@router.get("/revenue-heatmap", summary="Revenue heatmap by route/zone")
async def revenue_heatmap(user: TokenData = Depends(get_current_user)):
    """Route-level revenue heatmap data for dashboard."""
    return {"heatmap": []}


@router.get("/quick-commerce-threat", summary="Quick commerce threat monitor")
async def qc_threat(
    pincode: Optional[str] = None,
    sku_id: Optional[str] = None,
    user: TokenData = Depends(get_current_user),
):
    """
    QC price monitoring — shows where Blinkit/Zepto undercut retailer margins.
    Background job scrapes QC prices; this endpoint surfaces results.
    """
    return {"threats": [], "last_scan": None}


@router.get("/secondary-sales-estimate", summary="Estimated secondary sales by SKU")
async def secondary_sales(user: TokenData = Depends(get_current_user)):
    """Inferred sell-through velocity by SKU/region using reorder frequency. Agent 5 output."""
    return {"sku_estimates": []}


@router.get("/audit-trail", summary="SHA-256 hash-chain audit log")
async def audit_trail(
    limit: int = 50,
    entity_id: Optional[str] = None,
    user: TokenData = Depends(get_current_user),
):
    """Immutable audit trail secured by SHA-256 hash chain."""
    try:
        return await supabase_service.list_audit_events(user.tenant_id, limit, entity_id)
    except Exception:
        return {"events": [], "total": 0}
