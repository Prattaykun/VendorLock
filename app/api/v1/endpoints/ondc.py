"""
ONDC-compatible endpoint — mock in MVP, production-ready stub.
"""
from fastapi import APIRouter, Depends
from app.core.security import get_current_user, TokenData

router = APIRouter()


@router.post("/on_search", summary="ONDC on_search callback")
async def on_search(payload: dict):
    """ONDC on_search — returns catalog items. Mock in MVP."""
    return {"context": payload.get("context", {}), "message": {"catalog": {}}}


@router.post("/on_select", summary="ONDC on_select callback")
async def on_select(payload: dict):
    """ONDC on_select — confirms item selection."""
    return {"context": payload.get("context", {}), "message": {}}


@router.post("/on_init", summary="ONDC on_init callback")
async def on_init(payload: dict):
    """ONDC on_init — order initialization."""
    return {"context": payload.get("context", {}), "message": {}}


@router.post("/on_confirm", summary="ONDC on_confirm callback")
async def on_confirm(payload: dict):
    """ONDC on_confirm — order confirmed."""
    return {"context": payload.get("context", {}), "message": {}}


@router.get("/status", summary="ONDC integration status")
async def ondc_status(user: TokenData = Depends(get_current_user)):
    return {"ondc_enabled": False, "mode": "mock_mvp"}
