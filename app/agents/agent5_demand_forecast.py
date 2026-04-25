"""
Agent 5 — Demand & Pre-Stock Forecast
Predicts SKU demand and recommends pre-stocking.
"""
from typing import TypedDict, Optional, List, Dict
from langgraph.graph import StateGraph, END
from loguru import logger


class DemandForecast(TypedDict):
    sku_id: str
    zone: str
    forecast_units: int
    confidence: float
    spike_detected: bool
    recommended_prestock: int


class Agent5State(TypedDict):
    tenant_id: str
    historical_orders: List[Dict]
    active_schemes: List[Dict]
    horeca_patterns: List[Dict]
    forecasts: List[DemandForecast]
    prestock_alerts: List[Dict]
    error: Optional[str]


def time_series_forecast_node(state: Agent5State) -> Agent5State:
    """Run SKU-level demand forecast using historical order time series."""
    logger.info("[Agent5] Running demand forecast")
    # TODO: scikit-learn or statsmodels time-series model per SKU/zone
    state["forecasts"] = []
    return state


def scheme_adjusted_forecast_node(state: Agent5State) -> Agent5State:
    """Adjust raw forecasts upward for active schemes."""
    # TODO: overlay active scheme multipliers on base forecast
    return state


def generate_prestock_alerts_node(state: Agent5State) -> Agent5State:
    """
    Compare forecast against current stock levels.
    Alert distributor to pre-order before demand spike.
    """
    # TODO: query current_stock, compute gap, generate alert if gap > threshold
    state["prestock_alerts"] = []
    return state


def build_agent5_graph() -> StateGraph:
    graph = StateGraph(Agent5State)
    graph.add_node("time_series_forecast", time_series_forecast_node)
    graph.add_node("scheme_adjusted_forecast", scheme_adjusted_forecast_node)
    graph.add_node("prestock_alerts", generate_prestock_alerts_node)

    graph.set_entry_point("time_series_forecast")
    graph.add_edge("time_series_forecast", "scheme_adjusted_forecast")
    graph.add_edge("scheme_adjusted_forecast", "prestock_alerts")
    graph.add_edge("prestock_alerts", END)

    return graph.compile()


agent5_graph = build_agent5_graph()
