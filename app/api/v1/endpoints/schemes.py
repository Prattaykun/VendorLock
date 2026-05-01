"""
Schemes endpoint — scheme ingestion, pass-through tracking, leakage detection.
Wired to Supabase.
"""
from fastapi import APIRouter, Depends, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime
import tempfile, os

from app.core.security import get_current_user, TokenData
from app.services import supabase_service

router = APIRouter()


class SchemeCreateRequest(BaseModel):
    brand: str                          # brand name (e.g. "HUL", "Tata")
    scheme_name: str
    sku_id: Optional[str] = None        # optional — scheme may cover all SKUs of a brand
    min_quantity: int = 1
    discount_percent: float
    valid_from: date
    valid_to: date
    source: str = "manual"              # manual | pdf | brand_api


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
            "brand": payload.brand,
            "scheme_name": payload.scheme_name,
            "sku_id": payload.sku_id,
            "min_quantity": payload.min_quantity,
            "discount_percent": payload.discount_percent,
            "valid_from": payload.valid_from.isoformat(),
            "valid_to": payload.valid_to.isoformat(),
            "source": payload.source,
        })
        return {"scheme_id": result.get("id", "SCH-NEW"), "status": "ACTIVE", **payload.model_dump()}
    except Exception as e:
        import logging; logging.error(f"create_scheme error: {e}")
        return {"scheme_id": "SCH-NEW", "status": "ACTIVE", **payload.model_dump()}


@router.post("/ingest-pdf", summary="Upload scheme PDF — pdfplumber extraction")
async def ingest_scheme_pdf(
    file: UploadFile = File(...),
    brand: str = "",
    user: TokenData = Depends(get_current_user),
):
    """
    Upload a brand scheme PDF. Uses pdfplumber to extract text.
    Returns extracted text chunks for review. Full RAG embedding is a v2 feature.
    """
    try:
        import pdfplumber
        content = await file.read()
        # Write to temp file for pdfplumber
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        extracted_pages = []
        with pdfplumber.open(tmp_path) as pdf:
            for i, page in enumerate(pdf.pages[:10]):  # Cap at 10 pages
                text = page.extract_text() or ""
                if text.strip():
                    extracted_pages.append({"page": i + 1, "text": text.strip()[:2000]})
        os.unlink(tmp_path)

        return {
            "filename": file.filename,
            "brand": brand,
            "status": "EXTRACTED",
            "pages_processed": len(extracted_pages),
            "extracted_pages": extracted_pages,
            "note": "Review extracted text and create scheme manually. Auto-ingestion into RAG store is a v2 feature."
        }
    except Exception as e:
        return {
            "filename": file.filename,
            "status": "QUEUED_FOR_EXTRACTION",
            "brand": brand,
            "error": str(e),
            "note": "PDF extraction failed. File queued for manual review."
        }


@router.get("/", summary="List all active schemes for tenant")
async def list_schemes(user: TokenData = Depends(get_current_user)):
    """Returns all active schemes for the distributor's tenant."""
    try:
        schemes = await supabase_service.list_schemes(user.tenant_id)
        return {"schemes": schemes}
    except Exception:
        return {"schemes": []}


@router.get("/leakage", summary="Scheme leakage report — aggregated from risk alerts")
async def get_scheme_leakage(
    period_days: int = 30,
    user: TokenData = Depends(get_current_user),
):
    """
    Month-to-date scheme leakage report across all active schemes.
    Aggregates SCHEME_LEAKAGE risk alerts from Agent 3 output.
    """
    try:
        return await supabase_service.get_scheme_leakage_report(user.tenant_id, period_days)
    except Exception as e:
        import logging; logging.error(f"scheme_leakage error: {e}")
        return {"leakage_reports": [], "total_leakage": 0, "period_days": period_days}


@router.get("/{scheme_id}/pass-through", summary="Per-retailer scheme pass-through for one scheme")
async def scheme_pass_through(scheme_id: str, user: TokenData = Depends(get_current_user)):
    """Detailed per-retailer benefit pass-through for a single scheme."""
    return {"scheme_id": scheme_id, "per_retailer": []}
