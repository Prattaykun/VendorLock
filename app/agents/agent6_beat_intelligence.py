"""
Agent 6 — Beat Intelligence & Coverage
Optimises salesman routes, detects ghost visits, generates daily beat plans.
Uses NVIDIA NIM (DeepSeek v4 Pro) for route intelligence.
"""
from typing import TypedDict, Optional, List, Dict
from langgraph.graph import StateGraph, END
from loguru import logger
from datetime import datetime, timedelta, timezone

from app.core.llm import chat_completion_json


class BeatStop(TypedDict):
    outlet_id: str
    outlet_name: str
    priority: int
    last_visited_days_ago: int
    outstanding_amount: float
    priority_skus: List[str]


class Agent6State(TypedDict):
    tenant_id: str
    salesman_id: str
    outlet_master: List[Dict]
    checkin_logs: List[Dict]
    order_history: List[Dict]
    coverage_gaps: List[str]        # outlet IDs not visited in N days
    ghost_visit_ids: List[str]      # salesman IDs with suspected ghost visits
    beat_plan: List[BeatStop]
    missed_revenue_estimate: float
    error: Optional[str]


BEAT_PROMPT = """You are VendorLock's Beat Intelligence Agent for Indian FMCG distribution.
Analyse salesman coverage data and generate an optimised beat plan.

Outlet master (assigned outlets):
{outlet_master}

Recent check-in logs (last 7 days):
{checkin_logs}

Recent order history:
{order_history}

Tasks:
1. Identify coverage gaps: outlets not visited in 7+ days
2. Detect ghost visits: check-ins with zero orders AND zero messages (suspicious)
3. Generate an optimised beat plan sorted by priority
4. Estimate missed revenue from coverage gaps

Priority scoring:
- Outlets with high outstanding → visit first (collection)
- Outlets not visited in 7+ days → urgent
- Outlets with active schemes → push scheme SKUs
- High trust score outlets → maintain relationship

Return JSON: {
  "coverage_gaps": [{"outlet_id": "...", "outlet_name": "...", "days_since_visit": N, "avg_order_value": N}],
  "ghost_visits": [{"salesman_id": "...", "outlet_id": "...", "checkins_no_orders": N}],
  "beat_plan": [
    {"outlet_id": "...", "outlet_name": "...", "priority": 1-10, "last_visited_days_ago": N, 
     "outstanding_amount": N, "priority_skus": ["..."], "reason": "..."}
  ],
  "missed_revenue_estimate": float,
  "salesman_reliability_score": float
}"""


def coverage_gap_detection_node(state: Agent6State) -> Agent6State:
    """Identify outlets not visited or contacted in the last 7 days."""
    logger.info(f"[Agent6] Detecting coverage gaps for salesman {state['salesman_id']}")

    now = datetime.now(timezone.utc)
    visited_outlets = set()

    for log in state.get("checkin_logs", []):
        outlet_id = log.get("outlet_id")
        checked_in = log.get("checked_in_at", "")
        try:
            if isinstance(checked_in, str):
                check_time = datetime.fromisoformat(checked_in.replace("Z", "+00:00"))
            else:
                check_time = checked_in
            if (now - check_time).days <= 7:
                visited_outlets.add(outlet_id)
        except Exception:
            continue

    all_outlets = {o.get("id") for o in state.get("outlet_master", [])}
    state["coverage_gaps"] = list(all_outlets - visited_outlets)
    logger.info(f"[Agent6] Found {len(state['coverage_gaps'])} coverage gaps")
    return state


def ghost_visit_detection_node(state: Agent6State) -> Agent6State:
    """Detect ghost visits: check-ins with zero orders and zero messages."""
    logger.info("[Agent6] Running ghost visit detection")

    # Group checkins by outlet
    outlet_checkins = {}
    for log in state.get("checkin_logs", []):
        outlet_id = log.get("outlet_id")
        if outlet_id not in outlet_checkins:
            outlet_checkins[outlet_id] = 0
        outlet_checkins[outlet_id] += 1

    # Check which checked-in outlets have orders
    outlets_with_orders = set()
    for order in state.get("order_history", []):
        # Map retailer_id to outlet if possible
        outlets_with_orders.add(order.get("retailer_id"))

    ghost_outlets = []
    for outlet_id, checkin_count in outlet_checkins.items():
        if outlet_id not in outlets_with_orders and checkin_count >= 2:
            ghost_outlets.append(outlet_id)

    state["ghost_visit_ids"] = ghost_outlets
    logger.info(f"[Agent6] Detected {len(ghost_outlets)} suspected ghost visit outlets")
    return state


def route_optimization_node(state: Agent6State) -> Agent6State:
    """Generate optimised beat plan using LLM analysis."""
    logger.info("[Agent6] Optimising beat route")
    try:
        import json
        messages = [
            {"role": "system", "content": "You are a beat route optimisation expert for Indian FMCG. Return only valid JSON."},
            {"role": "user", "content": BEAT_PROMPT.format(
                outlet_master=json.dumps(state.get("outlet_master", [])[:30], default=str)[:2000],
                checkin_logs=json.dumps(state.get("checkin_logs", [])[:30], default=str)[:1500],
                order_history=json.dumps(state.get("order_history", [])[:30], default=str)[:1500],
            )},
        ]
        result = chat_completion_json(messages, temperature=0.3)

        beat_plan = result.get("beat_plan", [])
        state["beat_plan"] = [
            BeatStop(
                outlet_id=stop.get("outlet_id", ""),
                outlet_name=stop.get("outlet_name", "Unknown"),
                priority=stop.get("priority", 5),
                last_visited_days_ago=stop.get("last_visited_days_ago", 0),
                outstanding_amount=stop.get("outstanding_amount", 0),
                priority_skus=stop.get("priority_skus", []),
            )
            for stop in beat_plan
        ]
        state["missed_revenue_estimate"] = result.get("missed_revenue_estimate", 0.0)
        logger.info(f"[Agent6] Beat plan: {len(state['beat_plan'])} stops, missed revenue: ₹{state['missed_revenue_estimate']:,.0f}")
    except Exception as e:
        logger.error(f"[Agent6] Route optimisation failed: {e}")
        state["beat_plan"] = []
        state["missed_revenue_estimate"] = 0.0
    return state


def missed_revenue_estimation_node(state: Agent6State) -> Agent6State:
    """Estimate revenue missed from coverage gaps based on historical averages."""
    if state["missed_revenue_estimate"] == 0 and state["coverage_gaps"]:
        # Rough estimate: avg order per outlet × gaps
        avg_orders = state.get("order_history", [])
        if avg_orders:
            avg_value = sum(o.get("total_amount", 0) or 0 for o in avg_orders) / max(len(avg_orders), 1)
            state["missed_revenue_estimate"] = avg_value * len(state["coverage_gaps"])
    return state


def build_agent6_graph() -> StateGraph:
    graph = StateGraph(Agent6State)
    graph.add_node("coverage_gaps_node", coverage_gap_detection_node)
    graph.add_node("ghost_visits_node", ghost_visit_detection_node)
    graph.add_node("route_optimization_node", route_optimization_node)
    graph.add_node("missed_revenue_node", missed_revenue_estimation_node)

    graph.set_entry_point("coverage_gaps_node")
    graph.add_edge("coverage_gaps_node", "ghost_visits_node")
    graph.add_edge("ghost_visits_node", "route_optimization_node")
    graph.add_edge("route_optimization_node", "missed_revenue_node")
    graph.add_edge("missed_revenue_node", END)

    return graph.compile()


agent6_graph = build_agent6_graph()
