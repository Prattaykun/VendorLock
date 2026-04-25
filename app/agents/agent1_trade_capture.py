"""
Agent 1 — Trade Capture & Normalisation
Converts informal multilingual chat messages into structured trade events.
"""
from typing import TypedDict, List, Optional, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, SystemMessage
from loguru import logger


class TradeEvent(TypedDict):
    intent: str                 # ORDER | PAYMENT | RETURN | DISPUTE | SCHEME_QUERY
    retailer_id: str
    items: List[Dict[str, Any]]
    payment_type: str
    total_amount: Optional[float]
    confidence: float
    raw_message: str
    channel: str
    status: str                 # PARSED | CONFIRMED | DISPUTED | FAILED


class Agent1State(TypedDict):
    raw_message: str
    sender_id: str
    channel: str
    language_hint: str
    parsed_event: Optional[TradeEvent]
    confirmation_text: Optional[str]
    error: Optional[str]


SYSTEM_PROMPT = """
You are VendorLock's Trade Capture Agent. Your job is to parse informal Indian trade messages
(Hindi, Hinglish, Bhojpuri, English, Tamil, Bengali, Marathi) and extract:

1. INTENT: ORDER | PAYMENT | RETURN | DISPUTE | SCHEME_QUERY
2. LINE ITEMS: product name, quantity, unit (packet/kg/piece), price if mentioned
3. PAYMENT TYPE: credit (udhaar) | cash | UPI
4. DATES: if any delivery or payment dates are mentioned

Common Hindi/Hinglish keywords:
- "bhej do" / "chahiye" → ORDER
- "udhaar" / "credit pe" → credit payment
- "naqad" / "cash" → cash payment
- "wapas" / "return" → RETURN
- "shikayat" / "problem" → DISPUTE

Return a valid JSON object only. No explanation.
"""


def parse_intent_node(state: Agent1State) -> Agent1State:
    """LLM call to parse intent and extract entities."""
    logger.info(f"[Agent1] Parsing: {state['raw_message'][:80]}")
    # TODO: call LLM (Claude/Gemini) with SYSTEM_PROMPT
    # TODO: validate JSON output
    # stub
    state["parsed_event"] = TradeEvent(
        intent="ORDER",
        retailer_id=state["sender_id"],
        items=[],
        payment_type="credit",
        total_amount=None,
        confidence=0.0,
        raw_message=state["raw_message"],
        channel=state["channel"],
        status="PARSED",
    )
    return state


def validate_against_product_master_node(state: Agent1State) -> Agent1State:
    """Cross-check parsed SKUs against the product master table."""
    # TODO: query products table to match SKU names (fuzzy)
    return state


def generate_confirmation_text_node(state: Agent1State) -> Agent1State:
    """Generate a human-readable confirmation in the same language as input."""
    # TODO: use LLM to generate confirmation in Hindi/English as appropriate
    state["confirmation_text"] = (
        "Order confirmed. Awaiting your YES to finalise. Reply DISPUTE if incorrect."
    )
    return state


def build_agent1_graph() -> StateGraph:
    graph = StateGraph(Agent1State)
    graph.add_node("parse_intent", parse_intent_node)
    graph.add_node("validate_products", validate_against_product_master_node)
    graph.add_node("generate_confirmation", generate_confirmation_text_node)

    graph.set_entry_point("parse_intent")
    graph.add_edge("parse_intent", "validate_products")
    graph.add_edge("validate_products", "generate_confirmation")
    graph.add_edge("generate_confirmation", END)

    return graph.compile()


agent1_graph = build_agent1_graph()
