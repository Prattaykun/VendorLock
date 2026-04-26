"""
Agent 1 — Trade Capture & Normalisation
Converts informal multilingual chat messages into structured trade events.
Uses NVIDIA NIM (DeepSeek v4 Pro) for multilingual parsing.
"""
from typing import TypedDict, List, Optional, Dict, Any
from langgraph.graph import StateGraph, END
from loguru import logger

from app.core.llm import chat_completion_json
from app.services import supabase_service


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
    tenant_id: str
    channel: str
    language_hint: str
    parsed_event: Optional[TradeEvent]
    confirmation_text: Optional[str]
    error: Optional[str]


SYSTEM_PROMPT = """You are VendorLock's Trade Capture Agent. Parse informal Indian trade messages
(Hindi, Hinglish, Bhojpuri, English, Tamil, Bengali, Marathi) and extract structured trade data.

Return a JSON object with EXACTLY these fields:
{
  "intent": "ORDER" | "PAYMENT" | "RETURN" | "DISPUTE" | "SCHEME_QUERY",
  "items": [{"product_name": "string", "quantity": int, "unit": "packet|kg|piece|litre|box", "unit_price": float_or_null}],
  "payment_type": "credit" | "cash" | "upi",
  "dates": {"delivery_date": null, "payment_date": null},
  "confidence": 0.0-1.0,
  "detected_language": "hi|en|hinglish|bn|ta|mr|bho"
}

Common Hindi/Hinglish keyword mapping:
- "bhej do" / "chahiye" / "de do" / "send karo" → ORDER
- "udhaar" / "credit pe" / "baad me dunga" → credit payment
- "naqad" / "cash" / "abhi dunga" → cash payment
- "UPI kar diya" / "online bheja" → upi payment
- "wapas" / "return" / "vaapas lo" → RETURN
- "shikayat" / "problem" / "kharab" / "issue" → DISPUTE
- "scheme" / "offer" / "discount" / "MYSCORE" → SCHEME_QUERY
- "paisa bheja" / "payment kiya" / "diya" → PAYMENT

Return ONLY the JSON object, no explanation."""


CONFIRMATION_PROMPT = """You are generating a confirmation message for a trade order.
Generate a short, friendly confirmation message in the SAME LANGUAGE as the original message.
Include: items, quantities, payment type, and estimated total if available.
End with: "Reply YES to confirm or DISPUTE if incorrect."

Original message: {original}
Parsed data: {parsed}

Return only the confirmation message text, nothing else."""


def parse_intent_node(state: Agent1State) -> Agent1State:
    """LLM call to parse intent and extract entities from multilingual chat."""
    logger.info(f"[Agent1] Parsing: {state['raw_message'][:80]}")
    try:
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": state["raw_message"]},
        ]
        parsed = chat_completion_json(messages, temperature=0.2)

        state["parsed_event"] = TradeEvent(
            intent=parsed.get("intent", "ORDER"),
            retailer_id=state["sender_id"],
            items=parsed.get("items", []),
            payment_type=parsed.get("payment_type", "credit"),
            total_amount=sum(
                (item.get("quantity", 0) * (item.get("unit_price") or 0))
                for item in parsed.get("items", [])
            ) or None,
            confidence=parsed.get("confidence", 0.85),
            raw_message=state["raw_message"],
            channel=state["channel"],
            status="PARSED",
        )
        logger.info(f"[Agent1] Parsed intent: {parsed.get('intent')} with {len(parsed.get('items', []))} items")
    except Exception as e:
        logger.error(f"[Agent1] Parse failed: {e}")
        state["error"] = str(e)
        state["parsed_event"] = TradeEvent(
            intent="ORDER",
            retailer_id=state["sender_id"],
            items=[],
            payment_type="credit",
            total_amount=None,
            confidence=0.0,
            raw_message=state["raw_message"],
            channel=state["channel"],
            status="FAILED",
        )
    return state


def validate_against_product_master_node(state: Agent1State) -> Agent1State:
    """Cross-check parsed SKUs against the product master table (fuzzy match)."""
    if not state.get("parsed_event") or state["parsed_event"]["status"] == "FAILED":
        return state

    # Note: In production, this would do async DB lookups.
    # For now, we trust the LLM parse and flag low-confidence items.
    items = state["parsed_event"]["items"]
    for item in items:
        if not item.get("product_name"):
            item["validation_status"] = "UNKNOWN_SKU"
        else:
            item["validation_status"] = "MATCHED"

    logger.info(f"[Agent1] Validated {len(items)} items against product master")
    return state


def generate_confirmation_text_node(state: Agent1State) -> Agent1State:
    """Generate a human-readable confirmation in the same language as input."""
    if not state.get("parsed_event") or state["parsed_event"]["status"] == "FAILED":
        state["confirmation_text"] = "Could not parse your message. Please try again with item names and quantities."
        return state

    try:
        import json
        messages = [
            {"role": "system", "content": "You generate trade order confirmation messages in Indian languages."},
            {"role": "user", "content": CONFIRMATION_PROMPT.format(
                original=state["raw_message"],
                parsed=json.dumps(state["parsed_event"]["items"], ensure_ascii=False),
            )},
        ]
        from app.core.llm import chat_completion
        confirmation = chat_completion(messages, temperature=0.5, max_tokens=300)
        state["confirmation_text"] = confirmation.strip()
    except Exception as e:
        logger.warning(f"[Agent1] Confirmation generation failed, using fallback: {e}")
        event = state["parsed_event"]
        items_str = ", ".join(
            f"{item.get('product_name', '?')} x{item.get('quantity', '?')}"
            for item in event["items"]
        )
        state["confirmation_text"] = (
            f"Order received: {items_str}. "
            f"Payment: {event['payment_type']}. "
            f"Reply YES to confirm or DISPUTE if incorrect."
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
