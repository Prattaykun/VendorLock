"""
PDF Parser endpoint — invoice OCR, scheme PDF extraction.
"""
from fastapi import APIRouter, Depends, UploadFile, File
from typing import Optional
from app.core.security import get_current_user, TokenData

router = APIRouter()


@router.post("/parse-invoice", summary="Parse invoice PDF to extract batch/expiry/SKU data")
async def parse_invoice(
    file: UploadFile = File(...),
    distributor_id: Optional[str] = None,
    user: TokenData = Depends(get_current_user),
):
    """
    Upload invoice PDF or image. OCR extracts:
    - SKU names, quantities, unit prices
    - Batch numbers
    - Expiry dates (validated — must be future)
    - Invoice date, supplier GSTIN

    Extracted data is confirmed with the user before committing to ledger.
    """
    # TODO: save to S3 → call pytesseract / pdfplumber → Agent 1 entity extraction
    return {
        "filename": file.filename,
        "status": "QUEUED_FOR_OCR",
        "extracted": {
            "skus": [],
            "batches": [],
            "supplier_gstin": None,
            "invoice_date": None,
        },
        "confidence": 0.0,
    }


@router.post("/parse-scheme", summary="Parse scheme PDF for rules extraction (Agent 3 RAG)")
async def parse_scheme_pdf(
    file: UploadFile = File(...),
    brand_id: str = "",
    user: TokenData = Depends(get_current_user),
):
    """
    Upload a brand scheme PDF. Uses RAG (pdfplumber + embeddings) to extract scheme rules.
    Extracted rules are fed to Agent 3 leakage detection.
    """
    # TODO: pdfplumber extraction → chunking → FAISS embed → Agent 3
    return {
        "filename": file.filename,
        "brand_id": brand_id,
        "status": "QUEUED_FOR_RAG_EXTRACTION",
        "extracted_rules": [],
    }


@router.get("/extraction-status/{job_id}", summary="Check PDF extraction job status")
async def extraction_status(job_id: str, user: TokenData = Depends(get_current_user)):
    """Poll the status of an async PDF extraction job."""
    # TODO: query extraction_jobs table
    return {"job_id": job_id, "status": "PENDING", "result": None}
