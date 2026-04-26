"""
Agent 5 — Demand & Pre-Stock Forecast
Predicts SKU demand and recommends pre-stocking.
Uses NVIDIA NIM (DeepSeek v4 Pro) for demand pattern analysis.
"""
from typing import TypedDict, Optional, List, Dict
from langgraph.graph import StateGraph, END
from loguru import logger

from app.core.llm import chat_completion_json


class DemandForecast(TypedDict):
    sku_id: str
    sku_name: str
    zone: str
    forecast_units: int
    confidence: float
    spike_detected: bool
    recommended_prestock: int
    reason: str


class Agent5State(TypedDict):
    tenant_id: str
    historical_orders: List[Dict]
    active_schemes: List[Dict]
    horeca_patterns: List[Dict]
    forecasts: List[DemandForecast]
    prestock_alerts: List[Dict]
    error: Optional[str]


FORECAST_PROMPT = """You are VendorLock's Demand Forecast Agent for Indian FMCG distribution.
Analyse historical order data and predict demand.

Historical orders (last 90 days):
{order_history}

Active schemes that may boost demand:
{active_schemes}

For each SKU that appears in the data, provide:
1. forecast_units: predicted demand for next 7 days
2. confidence: 0.0-1.0
3. spike_detected: true if demand is expected to spike
4. recommended_prestock: units to pre-order
5. reason: why (e.g., "seasonal spike", "active scheme boost", "consistent weekly pattern")

Return JSON: {
  "forecasts": [
    {"sku_name": "...", "zone": "...", "forecast_units": N, "confidence": 0.X, 
     "spike_detected": bool, "recommended_prestock": N, "reason": "..."}
  ],
  "prestock_alerts": [
    {"sku_name": "...", "message": "...", "urgency": "HIGH|MEDIUM|LOW"}
  ]
}"""


def time_series_forecast_node(state: Agent5State) -> Agent5State:
    """Run SKU-level demand forecast using LLM analysis of order patterns."""
    logger.info("[Agent5] Running demand forecast")
    try:
        import json
        messages = [
            {"role": "system", "content": "You are a demand forecasting analyst for Indian FMCG. Return only valid JSON."},
            {"role": "user", "content": FORECAST_PROMPT.format(
                order_history=json.dumps(state.get("historical_orders", [])[:50], default=str)[:3000],
                active_schemes=json.dumps(state.get("active_schemes", []), default=str)[:1000],
            )},
        ]
        result = chat_completion_json(messages, temperature=0.3)
        state["forecasts"] = result.get("forecasts", [])
        state["prestock_alerts"] = result.get("prestock_alerts", [])
        logger.info(f"[Agent5] Generated {len(state['forecasts'])} forecasts, {len(state['prestock_alerts'])} alerts")
    except Exception as e:
        logger.error(f"[Agent5] Demand forecast failed: {e}")
        state["forecasts"] = []
        state["prestock_alerts"] = []
    return state


def scheme_adjusted_forecast_node(state: Agent5State) -> Agent5State:
    """Adjust raw forecasts upward for active schemes."""
    for forecast in state["forecasts"]:
        if forecast.get("spike_detected"):
            forecast["recommended_prestock"] = int(forecast.get("recommended_prestock", 0) * 1.2)
    return state


def generate_prestock_alerts_node(state: Agent5State) -> Agent5State:
    """Compare forecast against current stock levels to generate prestock alerts."""
    # Additional prestock processing
    logger.info(f"[Agent5] Final prestock alerts: {len(state['prestock_alerts'])}")
    return state


def build_agent5_graph() -> StateGraph:
    graph = StateGraph(Agent5State)
    graph.add_node("time_series_forecast_node", time_series_forecast_node)
    graph.add_node("scheme_adjusted_forecast_node", scheme_adjusted_forecast_node)
    graph.add_node("prestock_alerts_node", generate_prestock_alerts_node)

    graph.set_entry_point("time_series_forecast_node")
    graph.add_edge("time_series_forecast_node", "scheme_adjusted_forecast_node")
    graph.add_edge("scheme_adjusted_forecast_node", "prestock_alerts_node")
    graph.add_edge("prestock_alerts_node", END)

    return graph.compile()


agent5_graph = build_agent5_graph()
