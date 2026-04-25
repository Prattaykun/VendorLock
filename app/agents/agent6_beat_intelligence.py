"""
Agent 6 — Beat Intelligence & Coverage
Optimises salesman routes, detects ghost visits, generates daily beat plans.
"""
from typing import TypedDict, Optional, List, Dict
from langgraph.graph import StateGraph, END
from loguru import logger


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


def coverage_gap_detection_node(state: Agent6State) -> Agent6State:
    """Identify outlets not visited or contacted in the last 7 days."""
    logger.info(f"[Agent6] Detecting coverage gaps for salesman {state['salesman_id']}")
    # TODO: query outlet_master, beat_checkins, order_events
    # TODO: flag outlets with no activity > 7 days
    state["coverage_gaps"] = []
    return state


def ghost_visit_detection_node(state: Agent6State) -> Agent6State:
    """
    Detect ghost visits: check-ins with zero 2-way messages and zero orders.
    Flag salesman IDs for review.
    """
    logger.info("[Agent6] Running ghost visit detection")
    # TODO: join checkin_logs with order_events and message_events on (salesman_id, outlet_id, date)
    state["ghost_visit_ids"] = []
    return state


def route_optimization_node(state: Agent6State) -> Agent6State:
    """
    Shortest-path route optimisation weighted by outlet priority + risk score.
    Priority = Trust Score (lower → higher priority for credit collection).
    """
    logger.info("[Agent6] Optimising beat route")
    # TODO: nearest-neighbour TSP or OR-Tools for route optimisation
    state["beat_plan"] = []
    return state


def missed_revenue_estimation_node(state: Agent6State) -> Agent6State:
    """
    Estimate revenue missed from coverage gaps.
    Based on last 4-week average order value per uncovered outlet.
    """
    # TODO: compute avg_order_value per outlet × coverage_gap_outlets × weeks_missed
    state["missed_revenue_estimate"] = 0.0
    return state


def build_agent6_graph() -> StateGraph:
    graph = StateGraph(Agent6State)
    graph.add_node("coverage_gaps", coverage_gap_detection_node)
    graph.add_node("ghost_visits", ghost_visit_detection_node)
    graph.add_node("route_optimization", route_optimization_node)
    graph.add_node("missed_revenue", missed_revenue_estimation_node)

    graph.set_entry_point("coverage_gaps")
    graph.add_edge("coverage_gaps", "ghost_visits")
    graph.add_edge("ghost_visits", "route_optimization")
    graph.add_edge("route_optimization", "missed_revenue")
    graph.add_edge("missed_revenue", END)

    return graph.compile()


agent6_graph = build_agent6_graph()
