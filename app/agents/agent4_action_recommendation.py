"""
Agent 4 — Action & Recommendation
Converts Agent 3 alerts into concrete, human-reviewable action cards + draft messages.
Uses NVIDIA NIM (DeepSeek v4 Pro) for contextual message drafting.
"""
from typing import TypedDict, Optional, List, Dict
from langgraph.graph import StateGraph, END
from loguru import logger

from app.core.llm import chat_completion_json


class ActionCard(TypedDict):
    action_id: str
    action_type: str    # SEND_COLLECTION_NUDGE | FREEZE_CREDIT | FLAG_RETURN | FILE_CLAIM
    title: str
    description: str
    draft_message: Optional[str]    # Chat-ready message for Telegram
    requires_approval: bool
    rupee_impact: Optional[float]


class Agent4State(TypedDict):
    tenant_id: str
    alerts: List[Dict]               # From Agent 3
    credit_policy: Dict              # Distributor's risk appetite configuration
    action_cards: List[ActionCard]
    error: Optional[str]


ACTION_PROMPT = """You are VendorLock's Action & Recommendation Agent. Convert risk alerts into
concrete action cards with draft Telegram messages.

Alerts to process:
{alerts}

Distributor credit policy:
{credit_policy}

For each alert, generate an action card with:
1. action_type: SEND_COLLECTION_NUDGE | FREEZE_CREDIT | REDUCE_LIMIT | FLAG_RETURN | FILE_CLAIM | PUSH_TO_SELL | SCHEME_CORRECTION
2. title: short actionable title
3. description: detailed explanation
4. draft_message: A Telegram message in Hindi/Hinglish (natural, respectful tone used in Indian trade).
   - Use emojis sparingly (🙏 ✅ ⚠️)
   - Be direct but polite
   - Include ₹ amounts
   - If payment related, mention the outstanding amount
   - End with a call-to-action
5. requires_approval: true (always — human-in-the-loop)
6. rupee_impact: estimated ₹ impact

Return JSON: {"action_cards": [...]}"""


def generate_action_cards_node(state: Agent4State) -> Agent4State:
    """Convert each alert into an action card with LLM-drafted Telegram message."""
    logger.info(f"[Agent4] Generating action cards for {len(state['alerts'])} alerts")

    if not state["alerts"]:
        state["action_cards"] = []
        return state

    try:
        import json
        messages = [
            {"role": "system", "content": "You are a trade action advisor for Indian FMCG distributors. Generate action cards with Hindi/Hinglish draft messages. Return only valid JSON."},
            {"role": "user", "content": ACTION_PROMPT.format(
                alerts=json.dumps(state["alerts"][:10], default=str)[:4000],
                credit_policy=json.dumps(state.get("credit_policy", {"max_credit_ratio": 0.85}), default=str),
            )},
        ]
        result = chat_completion_json(messages, temperature=0.5)
        cards = result.get("action_cards", [])

        state["action_cards"] = []
        for i, card in enumerate(cards):
            state["action_cards"].append(ActionCard(
                action_id=f"ACT-{i+1:03d}",
                action_type=card.get("action_type", "SEND_COLLECTION_NUDGE"),
                title=card.get("title", "Action Required"),
                description=card.get("description", ""),
                draft_message=card.get("draft_message"),
                requires_approval=True,
                rupee_impact=card.get("rupee_impact"),
            ))
        logger.info(f"[Agent4] Generated {len(state['action_cards'])} action cards")
    except Exception as e:
        logger.error(f"[Agent4] Action card generation failed: {e}")
        # Fallback: generate basic cards without LLM
        state["action_cards"] = []
        for i, alert in enumerate(state["alerts"]):
            state["action_cards"].append(ActionCard(
                action_id=f"ACT-{i+1:03d}",
                action_type="SEND_COLLECTION_NUDGE",
                title=alert.get("title", "Action Required"),
                description=alert.get("description", ""),
                draft_message=None,
                requires_approval=True,
                rupee_impact=alert.get("rupee_impact"),
            ))
    return state


def prioritize_actions_node(state: Agent4State) -> Agent4State:
    """Sort action cards by rupee_impact descending — highest impact first."""
    state["action_cards"] = sorted(
        state["action_cards"],
        key=lambda x: x.get("rupee_impact") or 0,
        reverse=True,
    )
    return state


def build_agent4_graph() -> StateGraph:
    graph = StateGraph(Agent4State)
    graph.add_node("generate_cards", generate_action_cards_node)
    graph.add_node("prioritize", prioritize_actions_node)

    graph.set_entry_point("generate_cards")
    graph.add_edge("generate_cards", "prioritize")
    graph.add_edge("prioritize", END)

    return graph.compile()


agent4_graph = build_agent4_graph()
