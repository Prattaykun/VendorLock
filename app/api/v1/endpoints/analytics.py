"""
Analytics & intelligence endpoint — wired to Supabase.
"""
from fastapi import APIRouter, Depends
from typing import Optional, List, Dict, Any
from app.core.security import get_current_user, TokenData
from app.services import supabase_service
from datetime import datetime, timedelta
import random

router = APIRouter()


@router.get("/pass-through-metrics", summary="Aggregate pass-through analytics")
async def pass_through_metrics(user: TokenData = Depends(get_current_user)):
    """Comprehensive pass-through metrics including gauge, regional data, and trends."""
    try:
        # Simulated data - in production this would come from Supabase
        return {
            "aggregate_pass_through": {
                "percentage": 76.2,
                "trend": "+4.1%",
                "trend_period": "vs Last Month",
                "total_disbursed": "$1.24M",
                "verified_reach": "$945K"
            },
            "regional_leakage": [
                {
                    "region_id": "R012",
                    "region_name": "DELHI NCR",
                    "leakage_percentage": 14.2,
                    "status": "HIGH_RISK",
                    "confidence": 98.4,
                    "latency_days": 5.2,
                    "likely_cause": "Distributor Absorption"
                },
                {
                    "region_id": "R088",
                    "region_name": "MUMBAI METRO",
                    "leakage_percentage": 2.1,
                    "status": "OPTIMAL",
                    "confidence": 99.1,
                    "latency_days": 3.8,
                    "likely_cause": "Direct Secondary Dispatch"
                },
                {
                    "region_id": "R045",
                    "region_name": "WEST CLUSTER",
                    "leakage_percentage": 1.8,
                    "status": "OPTIMAL",
                    "confidence": 97.8,
                    "latency_days": 4.0,
                    "likely_cause": "Efficient Logistics"
                },
                {
                    "region_id": "R067",
                    "region_name": "UP CENTRAL",
                    "leakage_percentage": 18.5,
                    "status": "HIGH_RISK",
                    "confidence": 96.2,
                    "latency_days": 6.8,
                    "likely_cause": "Logistics Latency"
                }
            ],
            "monthly_trends": [
                {"month": "MAY", "pass_through": 62, "cost_basis": 40},
                {"month": "JUN", "pass_through": 65, "cost_basis": 42},
                {"month": "JUL", "pass_through": 68, "cost_basis": 45},
                {"month": "AUG", "pass_through": 71, "cost_basis": 38},
                {"month": "SEP", "pass_through": 74, "cost_basis": 35},
                {"month": "OCT", "pass_through": 76, "cost_basis": 32, "is_current": True}
            ],
            "sku_fragility": [
                {
                    "category": "Category A: Beverage Essentials",
                    "leakage_percentage": 12.4,
                    "status": "HIGH_LEAK",
                    "insight": "Distributor margin absorption high in suburban zones"
                },
                {
                    "category": "Category B: Personal Care Pack",
                    "leakage_percentage": 0.8,
                    "status": "OPTIMAL",
                    "insight": "High pass-through due to direct secondary dispatch"
                },
                {
                    "category": "Category C: Pantry Staples 5kg",
                    "leakage_percentage": 6.2,
                    "status": "MODERATE",
                    "insight": "Moderate leakage noted during festival bulk loading"
                },
                {
                    "category": "Category D: Cleaning Agents",
                    "leakage_percentage": 3.5,
                    "status": "ACCEPTABLE",
                    "insight": "Standard operational variance within acceptable limits"
                }
            ],
            "intelligence_advisory": {
                "priority": "HIGH",
                "summary": "Scheme pass-through has increased by 4.1% since implementing direct OTP-based kirana verification.",
                "detail": "Leakage remains concentrated in Tier-3 North Region distributors due to logistics latency.",
                "mitigation_strategy": "Implement real-time GPS tracking for last-mile delivery and automated distributor compliance scoring.",
                "confidence": 98.4
            }
        }
    except Exception as e:
        return {"error": str(e)}


@router.get("/trust-distribution", summary="Trust score distribution across retailers")
async def trust_distribution(user: TokenData = Depends(get_current_user)):
    """Histogram of trust scores and tier distribution — used for analytics dashboard."""
    try:
        return await supabase_service.get_trust_distribution(user.tenant_id)
    except Exception:
        return {"tier_distribution": {"A": 0, "B": 0, "C": 0, "D": 0}, "score_histogram": []}


@router.get("/revenue-heatmap", summary="Revenue heatmap by route/zone")
async def revenue_heatmap(
    period_days: int = 30,
    user: TokenData = Depends(get_current_user)
):
    """Route-level revenue heatmap aggregated from orders by channel/zone."""
    try:
        return await supabase_service.get_revenue_heatmap(user.tenant_id, period_days)
    except Exception as e:
        return {"heatmap": [], "error": str(e)}


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
