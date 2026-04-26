"""
AI Agent pipeline control endpoint — trigger agents manually, inspect state.
Wired to actual LangGraph agent pipelines.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
from enum import Enum

from app.core.security import get_current_user, require_admin, TokenData
from app.agents.agent1_trade_capture import agent1_graph
from app.agents.agent2_trust_scoring import agent2_graph
from app.agents.agent3_risk_intelligence import agent3_graph
from app.agents.agent4_action_recommendation import agent4_graph
from app.agents.agent5_demand_forecast import agent5_graph
from app.agents.agent6_beat_intelligence import agent6_graph
from app.services import supabase_service
from loguru import logger

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
    tenant_id = payload.tenant_id or user.tenant_id
    input_data = payload.input_payload or {}

    try:
        if payload.agent == AgentName.AGENT_1_TRADE_CAPTURE:
            state = {
                "raw_message": input_data.get("message", ""),
                "sender_id": input_data.get("sender_id", "test"),
                "tenant_id": tenant_id,
                "channel": input_data.get("channel", "dashboard"),
                "language_hint": input_data.get("language_hint", "auto"),
                "parsed_event": None,
                "confirmation_text": None,
                "error": None,
            }
            result = agent1_graph.invoke(state)

        elif payload.agent == AgentName.AGENT_2_TRUST_SCORING:
            retailer_id = input_data.get("retailer_id", "")
            orders = await supabase_service.list_orders(tenant_id, retailer_id=retailer_id)
            state = {
                "retailer_id": retailer_id,
                "tenant_id": tenant_id,
                "ledger_data": {"orders": orders.get("orders", [])},
                "sub_scores": {},
                "composite_score": 0.0,
                "tier": "C",
                "trend": "STABLE",
                "consistency_index": 0.5,
                "flags": [],
                "error": None,
            }
            result = agent2_graph.invoke(state)

        elif payload.agent == AgentName.AGENT_3_RISK_INTELLIGENCE:
            state = {
                "tenant_id": tenant_id,
                "trust_scores": input_data.get("trust_scores", {}),
                "ledger_data": input_data.get("ledger_data", {}),
                "scheme_rules": input_data.get("scheme_rules", []),
                "batch_expiry_data": input_data.get("batch_expiry_data", []),
                "return_requests": input_data.get("return_requests", []),
                "alerts": [],
                "error": None,
            }
            result = agent3_graph.invoke(state)

        elif payload.agent == AgentName.AGENT_4_ACTION_RECOMMENDATION:
            state = {
                "tenant_id": tenant_id,
                "alerts": input_data.get("alerts", []),
                "credit_policy": input_data.get("credit_policy", {}),
                "action_cards": [],
                "error": None,
            }
            result = agent4_graph.invoke(state)

        elif payload.agent == AgentName.AGENT_5_DEMAND_FORECAST:
            orders = await supabase_service.list_orders(tenant_id)
            schemes = await supabase_service.list_schemes(tenant_id)
            state = {
                "tenant_id": tenant_id,
                "historical_orders": orders.get("orders", []),
                "active_schemes": schemes,
                "horeca_patterns": [],
                "forecasts": [],
                "prestock_alerts": [],
                "error": None,
            }
            result = agent5_graph.invoke(state)

        elif payload.agent == AgentName.AGENT_6_BEAT_INTELLIGENCE:
            salesman_id = input_data.get("salesman_id", "")
            outlets = await supabase_service.list_outlets(tenant_id)
            checkins = await supabase_service.get_checkin_logs(tenant_id, salesman_id)
            orders = await supabase_service.list_orders(tenant_id)
            state = {
                "tenant_id": tenant_id,
                "salesman_id": salesman_id,
                "outlet_master": outlets,
                "checkin_logs": checkins,
                "order_history": orders.get("orders", []),
                "coverage_gaps": [],
                "ghost_visit_ids": [],
                "beat_plan": [],
                "missed_revenue_estimate": 0.0,
                "error": None,
            }
            result = agent6_graph.invoke(state)
        else:
            return {"error": "Unknown agent"}

        return {
            "agent": payload.agent,
            "status": "COMPLETED",
            "tenant_id": tenant_id,
            "result": {k: v for k, v in result.items() if k != "error"},
            "error": result.get("error"),
        }

    except Exception as e:
        logger.error(f"Agent run failed: {e}")
        return {
            "agent": payload.agent,
            "status": "FAILED",
            "tenant_id": tenant_id,
            "error": str(e),
        }


@router.get("/status/{run_id}", summary="Get the status of an agent run")
async def get_agent_status(run_id: str, user: TokenData = Depends(get_current_user)):
    """Poll the status of an async agent graph run."""
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
    state = {
        "raw_message": message,
        "sender_id": sender_id,
        "tenant_id": user.tenant_id,
        "channel": "api_test",
        "language_hint": language_hint,
        "parsed_event": None,
        "confirmation_text": None,
        "error": None,
    }

    try:
        result = agent1_graph.invoke(state)
        return {
            "raw_message": message,
            "parsed": result.get("parsed_event"),
            "confirmation_text": result.get("confirmation_text"),
            "error": result.get("error"),
        }
    except Exception as e:
        return {
            "raw_message": message,
            "parsed": None,
            "confirmation_text": None,
            "error": str(e),
        }
