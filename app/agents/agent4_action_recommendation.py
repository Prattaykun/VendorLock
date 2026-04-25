"""
Agent 4 — Action & Recommendation
Converts Agent 3 alerts into concrete, human-reviewable action cards + draft messages.
"""
from typing import TypedDict, Optional, List, Dict
from langgraph.graph import StateGraph, END
from loguru import logger


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


def generate_action_cards_node(state: Agent4State) -> Agent4State:
    """
    Convert each alert into an action card with a recommended action.
    Uses LLM to draft the Telegram message in the appropriate language.
    """
    logger.info(f"[Agent4] Generating action cards for {len(state['alerts'])} alerts")
    cards = []
    for alert in state["alerts"]:
        # TODO: LLM to generate context-aware draft_message in Hindi/English
        card = ActionCard(
            action_id=f"ACT-{alert.get('alert_type')}-001",
            action_type="SEND_COLLECTION_NUDGE",
            title=alert.get("title", "Action Required"),
            description=alert.get("description", ""),
            draft_message=None,     # TODO: LLM-generated
            requires_approval=True,
            rupee_impact=alert.get("rupee_impact"),
        )
        cards.append(card)
    state["action_cards"] = cards
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
