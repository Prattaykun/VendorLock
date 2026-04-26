"""
Agent 3 — Risk, Scheme & Compliance Intelligence
Surfaces hidden risks: credit risk, scheme leakage, fake returns, expiry, GST.
Uses NVIDIA NIM (DeepSeek v4 Pro) for intelligence analysis.
"""
from typing import TypedDict, Optional, List, Dict, Any
from langgraph.graph import StateGraph, END
from loguru import logger
from datetime import date, timedelta

from app.core.llm import chat_completion_json


class RiskAlert(TypedDict):
    alert_type: str
    severity: str       # INFO | WARNING | CRITICAL
    title: str
    description: str
    affected_entity_id: str
    affected_entity_type: str
    rupee_impact: Optional[float]
    recommended_action: Optional[str]


class Agent3State(TypedDict):
    tenant_id: str
    trust_scores: Dict[str, Any]
    ledger_data: Dict[str, Any]
    scheme_rules: List[Dict]         # RAG-extracted from scheme PDFs
    batch_expiry_data: List[Dict]
    return_requests: List[Dict]
    alerts: List[RiskAlert]
    error: Optional[str]


CREDIT_RISK_PROMPT = """You are VendorLock's Credit Risk Analyst. Analyse the following retailer data
and identify credit risk issues.

Trust scores and credit data:
{trust_data}

Recent order and payment history:
{ledger_data}

For each retailer with credit risk, generate an alert with:
- alert_type: "CREDIT_RISK"
- severity: "CRITICAL" if outstanding > credit_limit or score < 40, "WARNING" if score dropping, "INFO" otherwise
- title: short description
- description: detailed explanation with ₹ amounts
- affected_entity_id: retailer ID
- affected_entity_type: "retailer"
- rupee_impact: estimated ₹ at risk
- recommended_action: what the distributor should do

Return JSON: {"alerts": [...]}"""


SCHEME_LEAKAGE_PROMPT = """You are VendorLock's Scheme Leakage Detector. Analyse the following scheme data
and detect benefit leakage.

Active schemes:
{scheme_rules}

Orders with scheme applications:
{order_data}

For each scheme where the distributor received more benefit than was passed to retailers:
- Calculate leakage % and ₹ amount
- Generate alert with type "SCHEME_LEAKAGE"
- severity: "WARNING" if leakage > 3%, "CRITICAL" if > 5%

Return JSON: {"alerts": [...], "total_leakage": float}"""


RETURN_VALIDATION_PROMPT = """You are VendorLock's Return Validation Agent. Analyse return requests
and classify each as GENUINE, WITHIN_WINDOW, EXPIRED_WINDOW, or SUSPICIOUS.

Return requests:
{return_data}

For each return, cross-check:
1. Was the product actually purchased by this retailer?
2. Is the claimed reason consistent with batch data?
3. Is the return within the brand return window?
4. Does the retailer have a high recent return rate?

For SUSPICIOUS returns, generate a CRITICAL alert.

Return JSON: {
  "classifications": [
    {"return_id": "...", "classification": "GENUINE|SUSPICIOUS|...", "reason": "..."}
  ],
  "alerts": [...]
}"""


def credit_risk_detection_node(state: Agent3State) -> Agent3State:
    """Detect retailers with deteriorating credit risk using LLM analysis."""
    logger.info("[Agent3] Running credit risk detection")
    try:
        import json
        messages = [
            {"role": "system", "content": "You are a trade credit risk analyst. Return only valid JSON."},
            {"role": "user", "content": CREDIT_RISK_PROMPT.format(
                trust_data=json.dumps(state.get("trust_scores", {}), default=str)[:2000],
                ledger_data=json.dumps(state.get("ledger_data", {}), default=str)[:2000],
            )},
        ]
        result = chat_completion_json(messages, temperature=0.2)
        new_alerts = result.get("alerts", [])
        for alert in new_alerts:
            alert["affected_entity_type"] = alert.get("affected_entity_type", "retailer")
        state["alerts"].extend(new_alerts)
        logger.info(f"[Agent3] Credit risk: {len(new_alerts)} alerts generated")
    except Exception as e:
        logger.error(f"[Agent3] Credit risk detection failed: {e}")
    return state


def scheme_leakage_detection_node(state: Agent3State) -> Agent3State:
    """Detect scheme leakage per order using LLM analysis."""
    logger.info("[Agent3] Running scheme leakage detection")
    try:
        import json
        if not state.get("scheme_rules"):
            logger.info("[Agent3] No scheme rules to analyse")
            return state

        messages = [
            {"role": "system", "content": "You are a scheme compliance analyst. Return only valid JSON."},
            {"role": "user", "content": SCHEME_LEAKAGE_PROMPT.format(
                scheme_rules=json.dumps(state.get("scheme_rules", []), default=str)[:2000],
                order_data=json.dumps(state.get("ledger_data", {}).get("orders", []), default=str)[:2000],
            )},
        ]
        result = chat_completion_json(messages, temperature=0.2)
        new_alerts = result.get("alerts", [])
        state["alerts"].extend(new_alerts)
        logger.info(f"[Agent3] Scheme leakage: {len(new_alerts)} alerts, total leakage: ₹{result.get('total_leakage', 0)}")
    except Exception as e:
        logger.error(f"[Agent3] Scheme leakage detection failed: {e}")
    return state


def return_validation_node(state: Agent3State) -> Agent3State:
    """Validate return requests using LLM cross-checking."""
    logger.info("[Agent3] Validating return requests")
    try:
        import json
        if not state.get("return_requests"):
            logger.info("[Agent3] No return requests to validate")
            return state

        messages = [
            {"role": "system", "content": "You are a return fraud detection analyst. Return only valid JSON."},
            {"role": "user", "content": RETURN_VALIDATION_PROMPT.format(
                return_data=json.dumps(state.get("return_requests", []), default=str)[:3000],
            )},
        ]
        result = chat_completion_json(messages, temperature=0.2)
        new_alerts = result.get("alerts", [])
        state["alerts"].extend(new_alerts)
        logger.info(f"[Agent3] Returns: {len(result.get('classifications', []))} classified, {len(new_alerts)} alerts")
    except Exception as e:
        logger.error(f"[Agent3] Return validation failed: {e}")
    return state


def expiry_intelligence_node(state: Agent3State) -> Agent3State:
    """Near-expiry intelligence — flags batches in 90-day and 30-day windows."""
    logger.info("[Agent3] Running expiry intelligence scan")
    today = date.today()
    for batch in state.get("batch_expiry_data", []):
        try:
            expiry = batch.get("expiry_date")
            if isinstance(expiry, str):
                expiry = date.fromisoformat(expiry)
            days_left = (expiry - today).days

            if days_left <= 0:
                continue  # Already expired

            product_name = batch.get("product_name", batch.get("product_id", "Unknown SKU"))
            quantity = batch.get("quantity", 0)
            value = quantity * batch.get("unit_price", 0)

            if days_left <= 30:
                state["alerts"].append(RiskAlert(
                    alert_type="EXPIRY_WARNING",
                    severity="CRITICAL",
                    title=f"Expiry CRITICAL: {product_name}",
                    description=f"Batch {batch.get('batch_number', '?')} — {quantity} units expire in {days_left} days. Estimated loss: ₹{value:,.0f}. Push to sell or file brand return NOW.",
                    affected_entity_id=batch.get("id", ""),
                    affected_entity_type="batch",
                    rupee_impact=value,
                    recommended_action=f"Immediately push {product_name} to beat plan. File brand return claim if within return window.",
                ))
            elif days_left <= 90:
                state["alerts"].append(RiskAlert(
                    alert_type="EXPIRY_WARNING",
                    severity="WARNING",
                    title=f"Near-expiry: {product_name}",
                    description=f"Batch {batch.get('batch_number', '?')} — {quantity} units expire in {days_left} days. Brand return window may be closing.",
                    affected_entity_id=batch.get("id", ""),
                    affected_entity_type="batch",
                    rupee_impact=value,
                    recommended_action=f"File brand return claim for {product_name} before window closes.",
                ))
        except Exception as e:
            logger.warning(f"[Agent3] Expiry processing error: {e}")
    return state


def gst_compliance_node(state: Agent3State) -> Agent3State:
    """GST compliance flags per vendor — placeholder for GSTN API."""
    logger.info("[Agent3] Checking GST compliance")
    # In production: call GSTN API for each vendor's GSTIN status
    # For MVP, we skip this and log it
    return state


def build_agent3_graph() -> StateGraph:
    graph = StateGraph(Agent3State)
    graph.add_node("credit_risk", credit_risk_detection_node)
    graph.add_node("scheme_leakage", scheme_leakage_detection_node)
    graph.add_node("return_validation", return_validation_node)
    graph.add_node("expiry_intelligence", expiry_intelligence_node)
    graph.add_node("gst_compliance", gst_compliance_node)

    graph.set_entry_point("credit_risk")
    graph.add_edge("credit_risk", "scheme_leakage")
    graph.add_edge("scheme_leakage", "return_validation")
    graph.add_edge("return_validation", "expiry_intelligence")
    graph.add_edge("expiry_intelligence", "gst_compliance")
    graph.add_edge("gst_compliance", END)

    return graph.compile()


agent3_graph = build_agent3_graph()
