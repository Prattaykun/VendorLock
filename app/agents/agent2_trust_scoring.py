"""
Agent 2 — Trust & Behaviour Scoring
Maintains CIBIL-style Trust Scores for every retailer.
"""
from typing import TypedDict, Optional, List, Dict
from langgraph.graph import StateGraph, END
from loguru import logger


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


def compute_sub_scores_node(state: Agent2State) -> Agent2State:
    """
    Compute individual dimension scores from ledger data.
    Each sub-score is 0-100.
    """
    logger.info(f"[Agent2] Computing sub-scores for retailer {state['retailer_id']}")
    # TODO: query payment_events, order_events, return_events from ledger
    # TODO: compute each dimension per the spec weights
    state["sub_scores"] = {k: 75.0 for k in WEIGHTS}  # stub
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
    # TODO: fetch score history from trust_score_history table
    state["trend"] = "STABLE"      # stub
    state["consistency_index"] = 0.80  # stub
    return state


def generate_flags_node(state: Agent2State) -> Agent2State:
    """Generate human-readable flag strings for the dashboard."""
    flags = []
    # TODO: compare each sub-score to peer average, flag outliers
    if state["composite_score"] < 50:
        flags.append("Low composite trust score — monitor closely")
    state["flags"] = flags
    return state


def persist_score_node(state: Agent2State) -> Agent2State:
    """Persist trust score to trust_scores table and append to history."""
    # TODO: upsert trust_scores, insert trust_score_history
    logger.info(
        f"[Agent2] Score for {state['retailer_id']}: "
        f"{state['composite_score']} Tier {state['tier']}"
    )
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
