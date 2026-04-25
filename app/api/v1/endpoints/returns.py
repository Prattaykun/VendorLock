"""
Returns endpoint — fake return detection, reconciliation.
"""
from fastapi import APIRouter, Depends, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

from app.core.security import get_current_user, TokenData

router = APIRouter()


class ReturnClassification(str, Enum):
    GENUINE = "GENUINE"
    WITHIN_WINDOW = "WITHIN_WINDOW"
    EXPIRED_WINDOW = "EXPIRED_WINDOW"
    SUSPICIOUS = "SUSPICIOUS"


class ReturnRequest(BaseModel):
    retailer_id: str
    order_id: str
    batch_number: str
    quantity: int
    reason: str
    claimed_expiry: Optional[str] = None


class ReturnResponse(BaseModel):
    return_id: str
    classification: ReturnClassification
    status: str              # PENDING | APPROVED | REJECTED | ON_HOLD
    credit_note_amount: Optional[float] = None
    hold_reason: Optional[str] = None
    created_at: datetime


@router.post("/", response_model=ReturnResponse, status_code=201,
             summary="Submit a return request")
async def submit_return(
    payload: ReturnRequest,
    user: TokenData = Depends(get_current_user),
):
    """
    New return claim. Agent 3 classifies it as GENUINE / SUSPICIOUS / WITHIN_WINDOW / EXPIRED_WINDOW.
    Credits above threshold go on hold for distributor approval.
    """
    # TODO: trigger Agent 3 return validation pipeline
    return ReturnResponse(
        return_id="RET-" + datetime.utcnow().strftime("%Y%m%d%H%M%S"),
        classification=ReturnClassification.PENDING_CLASSIFICATION if False else ReturnClassification.WITHIN_WINDOW,
        status="PENDING",
        created_at=datetime.utcnow(),
    )


@router.post("/{return_id}/evidence", summary="Upload photo/voice evidence for a return")
async def upload_evidence(
    return_id: str,
    file: UploadFile = File(...),
    user: TokenData = Depends(get_current_user),
):
    """Upload supporting evidence — photo of damaged goods, batch sticker, etc."""
    # TODO: upload to S3, associate with return_id
    return {"return_id": return_id, "evidence_url": f"s3://vendorlock-docs/returns/{return_id}/{file.filename}"}


@router.patch("/{return_id}/approve", summary="Distributor approves a return")
async def approve_return(return_id: str, user: TokenData = Depends(get_current_user)):
    """Approve return — generates credit note in ledger."""
    # TODO: update return, generate credit note
    return {"return_id": return_id, "status": "APPROVED"}


@router.patch("/{return_id}/reject", summary="Distributor rejects a return")
async def reject_return(return_id: str, reason: str = "", user: TokenData = Depends(get_current_user)):
    """Reject return — notifies retailer via Telegram with reason."""
    # TODO: update return, send Telegram notification
    return {"return_id": return_id, "status": "REJECTED", "reason": reason}


@router.get("/", summary="List returns for tenant")
async def list_returns(
    status_filter: Optional[str] = None,
    user: TokenData = Depends(get_current_user),
):
    """Paginated returns list — default shows pending approvals."""
    # TODO: query returns table
    return {"returns": [], "total": 0}
