"""
AI Agent pipeline control endpoint — trigger agents manually, inspect state.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
from enum import Enum

from app.core.security import get_current_user, require_admin, TokenData

router = APIRouter()


class AgentName(str, Enum):
    AGENT_1_TRADE_CAPTURE = "agent_1_trade_capture"
    AGENT_2_TRUST_SCORING = "agent_2_trust_scoring"
    AGENT_3_RISK_INTELLIGENCE = "agent_3_risk_intelligence"
    AGENT_4_ACTION_RECOMMENDATION = "agent_4_action_recommendation"
    AGENT_5_DEMAND_FORECAST = "agent_5_demand_forecast"
    AGENT_6_BEAT_INTELLIGENCE = "agent_6_beat_intelligence"


class AgentRunRequest(BaseModel):
    agent: AgentName
    input_payload: Optional[Dict[str, Any]] = None
    tenant_id: Optional[str] = None


@router.post("/run", summary="Manually trigger an AI agent run")
async def run_agent(
    payload: AgentRunRequest,
    user: TokenData = Depends(get_current_user),
):
    """
    Trigger a specific agent in the LangGraph pipeline.
    In production, agents are triggered automatically by events.
    This endpoint is for debugging and manual runs.
    """
    # TODO: invoke the LangGraph agent graph with the specified agent node
    return {
        "agent": payload.agent,
        "status": "QUEUED",
        "tenant_id": payload.tenant_id or user.tenant_id,
        "run_id": "RUN-001",
    }


@router.get("/status/{run_id}", summary="Get the status of an agent run")
async def get_agent_status(run_id: str, user: TokenData = Depends(get_current_user)):
    """Poll the status of an async agent graph run."""
    # TODO: query LangGraph run state from MongoDB or state store
    return {"run_id": run_id, "status": "COMPLETED", "output": {}}


@router.post("/parse-message", summary="Test Agent 1: parse a raw chat message")
async def parse_message(
    message: str,
    sender_id: str = "test-retailer",
    language_hint: str = "auto",
    user: TokenData = Depends(get_current_user),
):
    """
    Dev/test endpoint: feed a raw text message to Agent 1 and return the
    structured trade event it extracts. Useful for testing Hindi/Hinglish parsing.
    """
    # TODO: call Agent 1 LangGraph node directly
    return {
        "raw_message": message,
        "parsed": {
            "intent": "ORDER",
            "items": [],
            "payment_type": "credit",
            "retailer_id": sender_id,
            "confidence": 0.92,
        },
        "confirmation_text": "Order confirmed. Reply YES or DISPUTE.",
    }
