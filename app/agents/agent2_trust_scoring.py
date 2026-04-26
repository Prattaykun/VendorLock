"""
Agent 2 — Trust & Behaviour Scoring
Maintains CIBIL-style Trust Scores for every retailer.
Uses NVIDIA NIM (DeepSeek v4 Pro) for behavioural analysis.
"""
from typing import TypedDict, Optional, List, Dict
from langgraph.graph import StateGraph, END
from loguru import logger

from app.core.llm import chat_completion_json
from app.services import supabase_service


WEIGHTS = {
    "payment_discipline": 0.30,
    "order_consistency": 0.20,
    "cancellation_rate": 0.15,
    "return_frequency": 0.15,
    "communication_reliability": 0.10,
    "trade_stability": 0.10,
}


class Agent2State(TypedDict):
    retailer_id: str
    tenant_id: str
    ledger_data: Dict           # raw ledger rows for this retailer
    sub_scores: Dict[str, float]
    composite_score: float
    tier: str
    trend: str
    consistency_index: float
    flags: List[str]
    error: Optional[str]


SCORING_PROMPT = """You are VendorLock's Trust Scoring Agent. Analyse the following retailer trade data
and compute sub-scores (0-100) for each dimension.

Retailer trade history:
{ledger_summary}

Compute these sub-scores based on the data:
1. payment_discipline (0-100): On-time payments vs delayed/defaulted. Higher = better.
2. order_consistency (0-100): Regular, predictable ordering behaviour. Higher = better.
3. cancellation_rate (0-100): Inverse of cancellation rate. 100 = no cancellations.
4. return_frequency (0-100): Inverse of return rate vs peer average. 100 = no returns.
5. communication_reliability (0-100): Response time, confirmation behaviour.
6. trade_stability (0-100): Length and continuity of relationship.

Also provide:
- flags: list of human-readable warning strings (e.g., "2 late payments in last 30 days")
- consistency_index: 0.0-1.0 (how consistent vs erratic is the behaviour)

Return JSON:
{
  "sub_scores": {"payment_discipline": X, "order_consistency": X, ...},
  "flags": ["string", ...],
  "consistency_index": 0.XX
}"""


def compute_sub_scores_node(state: Agent2State) -> Agent2State:
    """Compute individual dimension scores using LLM analysis of ledger data."""
    logger.info(f"[Agent2] Computing sub-scores for retailer {state['retailer_id']}")
    try:
        import json
        ledger_summary = json.dumps(state.get("ledger_data", {}), default=str)[:3000]

        messages = [
            {"role": "system", "content": "You are a trade credit analyst. Return only valid JSON."},
            {"role": "user", "content": SCORING_PROMPT.format(ledger_summary=ledger_summary)},
        ]
        result = chat_completion_json(messages, temperature=0.2)
        state["sub_scores"] = result.get("sub_scores", {k: 50.0 for k in WEIGHTS})
        state["flags"] = result.get("flags", [])
        state["consistency_index"] = result.get("consistency_index", 0.5)
    except Exception as e:
        logger.warning(f"[Agent2] LLM scoring failed, using defaults: {e}")
        state["sub_scores"] = {k: 50.0 for k in WEIGHTS}
        state["flags"] = ["Score computed with defaults — LLM unavailable"]
        state["consistency_index"] = 0.5
    return state


def compute_composite_score_node(state: Agent2State) -> Agent2State:
    """Weighted composite = Σ(sub_score_i × weight_i)."""
    composite = sum(
        state["sub_scores"].get(k, 0) * w for k, w in WEIGHTS.items()
    )
    state["composite_score"] = round(composite, 2)

    if composite >= 80:
        state["tier"] = "A"
    elif composite >= 60:
        state["tier"] = "B"
    elif composite >= 40:
        state["tier"] = "C"
    else:
        state["tier"] = "D"

    return state


def compute_trend_node(state: Agent2State) -> Agent2State:
    """Compare current score to 30/90-day moving average to get trend."""
    # Use ledger data to determine trend
    history = state.get("ledger_data", {}).get("score_history", [])
    if len(history) >= 2:
        recent_avg = sum(h.get("score", 50) for h in history[-3:]) / min(len(history), 3)
        older_avg = sum(h.get("score", 50) for h in history[:-3]) / max(len(history) - 3, 1)
        if state["composite_score"] > recent_avg + 3:
            state["trend"] = "UP"
        elif state["composite_score"] < recent_avg - 3:
            state["trend"] = "DOWN"
        else:
            state["trend"] = "STABLE"
    else:
        state["trend"] = "STABLE"
    return state


def generate_flags_node(state: Agent2State) -> Agent2State:
    """Generate human-readable flag strings for the dashboard."""
    if state["composite_score"] < 40:
        state["flags"].append("⚠️ Trust Score in Tier D — cash-only or credit freeze recommended")
    elif state["composite_score"] < 60:
        state["flags"].append("🟡 Trust Score in Tier C — reduced limits and close monitoring")
    if state["trend"] == "DOWN":
        state["flags"].append("📉 Score trending downward over last 30 days")
    if state["consistency_index"] < 0.4:
        state["flags"].append("⚡ Erratic behaviour detected — low consistency index")
    return state


def persist_score_node(state: Agent2State) -> Agent2State:
    """Persist trust score to trust_scores table and append to history."""
    logger.info(
        f"[Agent2] Score for {state['retailer_id']}: "
        f"{state['composite_score']} Tier {state['tier']}"
    )
    # Note: Actual persistence happens via the API endpoint calling supabase_service
    return state


def build_agent2_graph() -> StateGraph:
    graph = StateGraph(Agent2State)
    graph.add_node("compute_sub_scores", compute_sub_scores_node)
    graph.add_node("compute_composite", compute_composite_score_node)
    graph.add_node("compute_trend", compute_trend_node)
    graph.add_node("generate_flags", generate_flags_node)
    graph.add_node("persist_score", persist_score_node)

    graph.set_entry_point("compute_sub_scores")
    graph.add_edge("compute_sub_scores", "compute_composite")
    graph.add_edge("compute_composite", "compute_trend")
    graph.add_edge("compute_trend", "generate_flags")
    graph.add_edge("generate_flags", "persist_score")
    graph.add_edge("persist_score", END)

    return graph.compile()


agent2_graph = build_agent2_graph()
