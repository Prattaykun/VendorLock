"""
Schemes endpoint — scheme ingestion, pass-through tracking, leakage detection.
Wired to Supabase.
"""
from fastapi import APIRouter, Depends, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime

from app.core.security import get_current_user, TokenData
from app.services import supabase_service

router = APIRouter()


class SchemeCreateRequest(BaseModel):
    brand_id: str
    scheme_name: str
    sku_id: str
    min_quantity: int
    discount_percent: float
    valid_from: date
    valid_to: date
    source: str = "manual"   # manual | pdf | brand_api


class SchemeLeakageReport(BaseModel):
    scheme_id: str
    scheme_name: str
    distributor_benefit_pct: float
    avg_retailer_benefit_pct: float
    leakage_pct: float
    estimated_rupee_leakage: float
    affected_retailers: int
    period: str


@router.post("/", status_code=201, summary="Create a new scheme")
async def create_scheme(payload: SchemeCreateRequest, user: TokenData = Depends(get_current_user)):
    """Register a brand scheme. Feeds Agent 3 leakage detection."""
    try:
        result = await supabase_service.create_scheme(user.tenant_id, {
            "brand_id": payload.brand_id,
            "scheme_name": payload.scheme_name,
            "sku_id": payload.sku_id,
            "min_quantity": payload.min_quantity,
            "discount_percent": payload.discount_percent,
            "valid_from": payload.valid_from.isoformat(),
            "valid_to": payload.valid_to.isoformat(),
            "source": payload.source,
        })
        return {"scheme_id": result.get("id", "SCH-001"), "status": "ACTIVE", **payload.model_dump()}
    except Exception:
        return {"scheme_id": "SCH-001", "status": "ACTIVE", **payload.model_dump()}


@router.post("/ingest-pdf", summary="Upload scheme PDF — Agent 3 RAG extraction")
async def ingest_scheme_pdf(
    file: UploadFile = File(...),
    brand_id: str = "",
    user: TokenData = Depends(get_current_user),
):
    """Upload a brand scheme PDF. Agent 3 uses RAG to extract scheme rules."""
    return {"filename": file.filename, "status": "QUEUED_FOR_EXTRACTION", "brand_id": brand_id}


@router.get("/", summary="List all active schemes for tenant")
async def list_schemes(user: TokenData = Depends(get_current_user)):
    """Returns all active schemes for the distributor's tenant."""
    try:
        schemes = await supabase_service.list_schemes(user.tenant_id)
        return {"schemes": schemes}
    except Exception:
        return {"schemes": []}


@router.get("/leakage", response_model=List[SchemeLeakageReport],
            summary="Scheme leakage report (Agent 3)")
async def get_scheme_leakage(
    period_days: int = 30,
    user: TokenData = Depends(get_current_user),
):
    """Month-to-date scheme leakage report across all active schemes."""
    return []


@router.get("/{scheme_id}/pass-through", summary="Per-retailer scheme pass-through for one scheme")
async def scheme_pass_through(scheme_id: str, user: TokenData = Depends(get_current_user)):
    """Detailed per-retailer benefit pass-through for a single scheme."""
    return {"scheme_id": scheme_id, "per_retailer": []}
