"""
LLM Client — NVIDIA NIM (DeepSeek v4 Pro) via OpenAI-compatible SDK.

Provides sync and async helpers for all 6 agents.
"""
import json
from typing import Optional, List, Dict, Any

from openai import OpenAI
from loguru import logger

from app.core.config import settings


def get_llm_client() -> OpenAI:
    """Return a configured OpenAI client pointing at NVIDIA NIM."""
    return OpenAI(
        base_url=settings.NVIDIA_BASE_URL,
        api_key=settings.NVIDIA_API_KEY,
    )


def chat_completion(
    messages: List[Dict[str, str]],
    temperature: float = 0.7,
    max_tokens: int = 4096,
    stream: bool = False,
    model: Optional[str] = None,
) -> str:
    """
    Run a chat completion against NVIDIA NIM (DeepSeek v4 Pro).
    Returns the full response text (non-streaming) or streams chunks.
    """
    client = get_llm_client()
    target_model = model or settings.NVIDIA_MODEL

    try:
        if stream:
            chunks = []
            completion = client.chat.completions.create(
                model=target_model,
                messages=messages,
                temperature=temperature,
                top_p=0.95,
                max_tokens=max_tokens,
                extra_body={"chat_template_kwargs": {"thinking": False}},
                stream=True,
            )
            for chunk in completion:
                if not getattr(chunk, "choices", None):
                    continue
                if chunk.choices and chunk.choices[0].delta.content is not None:
                    chunks.append(chunk.choices[0].delta.content)
            return "".join(chunks)
        else:
            completion = client.chat.completions.create(
                model=target_model,
                messages=messages,
                temperature=temperature,
                top_p=0.95,
                max_tokens=max_tokens,
                extra_body={"chat_template_kwargs": {"thinking": False}},
                stream=False,
            )
            return completion.choices[0].message.content or ""

    except Exception as e:
        logger.error(f"LLM call failed: {e}")
        raise


def chat_completion_json(
    messages: List[Dict[str, str]],
    temperature: float = 0.3,
    max_tokens: int = 4096,
    model: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Run a chat completion and parse the response as JSON.
    Falls back to extracting JSON from markdown code blocks.
    """
    raw = chat_completion(
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
        stream=False,
        model=model,
    )

    # Try direct JSON parse
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass

    # Try extracting from ```json ... ``` blocks
    if "```json" in raw:
        start = raw.index("```json") + 7
        end = raw.index("```", start)
        return json.loads(raw[start:end].strip())

    # Try extracting from ``` ... ``` blocks
    if "```" in raw:
        start = raw.index("```") + 3
        end = raw.index("```", start)
        return json.loads(raw[start:end].strip())

    # Try finding first { and last }
    first_brace = raw.find("{")
    last_brace = raw.rfind("}")
    if first_brace != -1 and last_brace != -1:
        return json.loads(raw[first_brace:last_brace + 1])

    logger.warning(f"Failed to parse JSON from LLM response: {raw[:200]}")
    return {"error": "Failed to parse LLM JSON response", "raw": raw[:500]}
