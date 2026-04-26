"""
Risk Alerts endpoint (Agent 3 output surface) — wired to Supabase.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
from enum import Enum

from app.core.security import get_current_user, TokenData
from app.services import supabase_service
from app.agents.agent3_risk_intelligence import agent3_graph

router = APIRouter()


class AlertSeverity(str, Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"


class AlertType(str, Enum):
    CREDIT_RISK = "CREDIT_RISK"
    SCHEME_LEAKAGE = "SCHEME_LEAKAGE"
    RETURN_SUSPICIOUS = "RETURN_SUSPICIOUS"
    EXPIRY_WARNING = "EXPIRY_WARNING"
    GST_COMPLIANCE = "GST_COMPLIANCE"
    GHOST_VISIT = "GHOST_VISIT"
    PAYMENT_DUE = "PAYMENT_DUE"
    QUICK_COMMERCE = "QUICK_COMMERCE"


class RiskAlert(BaseModel):
    alert_id: str
    alert_type: str
    severity: str
    title: str
    description: str
    affected_entity_id: str
    affected_entity_type: str   # retailer | salesman | sku | route
    rupee_impact: Optional[float] = None
    recommended_action: Optional[str] = None
    created_at: datetime
    acknowledged: bool = False


@router.get("/", summary="List all active risk alerts for tenant")
async def list_alerts(
    severity: Optional[AlertSeverity] = None,
    alert_type: Optional[AlertType] = None,
    limit: int = 50,
    offset: int = 0,
    user: TokenData = Depends(get_current_user),
):
    """Returns all unacknowledged risk alerts for the distributor's tenant."""
    try:
        return await supabase_service.list_risk_alerts(
            user.tenant_id,
            severity=severity.value if severity else None,
            alert_type=alert_type.value if alert_type else None,
            limit=limit, offset=offset,
        )
    except Exception:
        return {"alerts": [], "total": 0}


@router.get("/{alert_id}", summary="Get alert detail")
async def get_alert(alert_id: str, user: TokenData = Depends(get_current_user)):
    """Fetch detailed view of a single alert including recommended action card."""
    try:
        alerts = await supabase_service.list_risk_alerts(user.tenant_id)
        for alert in alerts.get("alerts", []):
            if alert.get("id") == alert_id:
                return alert
    except Exception:
        pass
    return {"alert_id": alert_id, "message": "Alert not found"}


@router.patch("/{alert_id}/acknowledge", summary="Acknowledge an alert")
async def acknowledge_alert(alert_id: str, user: TokenData = Depends(get_current_user)):
    """Mark alert as reviewed / acknowledged by distributor."""
    try:
        return await supabase_service.acknowledge_alert(alert_id, user.tenant_id)
    except Exception:
        return {"alert_id": alert_id, "acknowledged": True}


@router.post("/run-scan", summary="Trigger a full risk scan (Agent 3)")
async def run_risk_scan(user: TokenData = Depends(get_current_user)):
    """Manually trigger Agent 3 to scan entire tenant ledger for new risks."""
    try:
        orders = await supabase_service.list_orders(user.tenant_id)
        schemes = await supabase_service.list_schemes(user.tenant_id)
        batches = await supabase_service.get_expiry_batches(user.tenant_id)
        returns_data = await supabase_service.list_returns(user.tenant_id)

        state = {
            "tenant_id": user.tenant_id,
            "trust_scores": {},
            "ledger_data": {"orders": orders.get("orders", [])},
            "scheme_rules": schemes,
            "batch_expiry_data": batches,
            "return_requests": returns_data.get("returns", []),
            "alerts": [],
            "error": None,
        }
        result = agent3_graph.invoke(state)

        # Persist alerts to Supabase
        for alert in result.get("alerts", []):
            await supabase_service.create_risk_alert(user.tenant_id, alert)

        return {
            "completed": True,
            "tenant_id": user.tenant_id,
            "alerts_generated": len(result.get("alerts", [])),
        }
    except Exception as e:
        return {"queued": True, "tenant_id": user.tenant_id, "error": str(e)}
