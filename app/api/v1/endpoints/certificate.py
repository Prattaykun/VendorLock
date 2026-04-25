"""
Trust Certificate endpoint — tamper-proof PDF with QR verification.
"""
from fastapi import APIRouter, Depends, Response
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.core.security import get_current_user, TokenData

router = APIRouter()


class CertificateRequest(BaseModel):
    retailer_id: str
    requested_by: str   # "distributor" | "retailer_self"
    otp_verified: bool = False  # required for retailer-self requests


class CertificateResponse(BaseModel):
    certificate_id: str
    retailer_id: str
    trust_score: float
    tier: str
    months_of_history: int
    payment_discipline_pct: float
    return_rate_vs_peer: float
    consistency_index: float
    qr_verification_url: str
    pdf_url: str
    issued_at: datetime
    valid_until: datetime


@router.post("/generate", response_model=CertificateResponse,
             summary="Generate a Trust Certificate PDF")
async def generate_certificate(
    payload: CertificateRequest,
    user: TokenData = Depends(get_current_user),
):
    """
    Generate a tamper-proof Trust Certificate for a retailer.
    Contains Trust Score, tier, behavioural aggregates, and a QR code
    linking to a read-only public verification page.
    """
    # TODO: fetch trust data, generate PDF via ReportLab, upload to S3, create QR
    return CertificateResponse(
        certificate_id="CERT-001",
        retailer_id=payload.retailer_id,
        trust_score=88.0,
        tier="A",
        months_of_history=14,
        payment_discipline_pct=94.0,
        return_rate_vs_peer=-0.03,   # 3% below peer average (good)
        consistency_index=0.91,
        qr_verification_url="https://vendorlock.in/verify/CERT-001",
        pdf_url="https://s3.ap-south-1.amazonaws.com/vendorlock-docs/certs/CERT-001.pdf",
        issued_at=datetime.utcnow(),
        valid_until=datetime(datetime.utcnow().year + 1, 1, 1),
    )


@router.get("/verify/{certificate_id}", summary="Public verification of a Trust Certificate")
async def verify_certificate(certificate_id: str):
    """
    Public read-only endpoint — linked via QR on the PDF.
    No auth required; returns sanitised summary only.
    """
    # TODO: fetch from certificates table, validate hash chain
    return {
        "certificate_id": certificate_id,
        "valid": True,
        "tier": "A",
        "issued_at": datetime.utcnow().isoformat(),
        "issuer": "VendorLock",
    }


@router.get("/{retailer_id}/history", summary="List all certificates issued for a retailer")
async def certificate_history(retailer_id: str, user: TokenData = Depends(get_current_user)):
    """All certificates issued for a retailer — for audit."""
    # TODO: query certificates table
    return {"retailer_id": retailer_id, "certificates": []}
