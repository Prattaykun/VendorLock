"""
LLM Client — Google GenAI SDK (Gemini 2.5 Flash, express mode) primary,
             NVIDIA NIM (DeepSeek v4 Pro) fallback.

Priority:
  1. google-genai  →  client = genai.Client(vertexai=True, api_key=GOOGLE_API_KEY)
  2. NVIDIA NIM / DeepSeek via OpenAI-compatible SDK

All call-sites continue to use `chat_completion` and `chat_completion_json`.
No changes required in agents.
"""
import json
from typing import Optional, List, Dict, Any

from loguru import logger

from app.core.config import settings


# ── Helpers ──────────────────────────────────────────────────────────────────

def _messages_to_prompt(messages: List[Dict[str, str]]) -> str:
    """Flatten OpenAI-style message list into a single prompt string."""
    parts = []
    for m in messages:
        role = m.get("role", "user")
        content = m.get("content", "")
        if role == "system":
            parts.append(f"[System]\n{content}")
        elif role == "assistant":
            parts.append(f"[Assistant]\n{content}")
        else:
            parts.append(f"[User]\n{content}")
    return "\n\n".join(parts)


# ── Google GenAI / Vertex AI (primary) ───────────────────────────────────────

def _gemini_chat_completion(
    messages: List[Dict[str, str]],
    temperature: float = 0.7,
    max_tokens: int = 4096,
    model: Optional[str] = None,
) -> str:
    """
    Call Gemini 2.5 Flash via google-genai SDK (express mode, api_key auth).

      pip install google-genai
    """
    from google import genai
    from google.genai import types

    target_model = model or settings.VERTEX_MODEL
    logger.info(
        f"[LLM] 🟢 Provider: Google GenAI (Vertex express)  |  Model: {target_model}"
    )

    client = genai.Client(vertexai=True, api_key=settings.GOOGLE_API_KEY)

    prompt = _messages_to_prompt(messages)

    response = client.models.generate_content(
        model=target_model,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=temperature,
            max_output_tokens=max_tokens,
        ),
    )
    return response.text


# ── NVIDIA NIM / DeepSeek (fallback) ─────────────────────────────────────────

def _deepseek_chat_completion(
    messages: List[Dict[str, str]],
    temperature: float = 0.7,
    max_tokens: int = 4096,
    stream: bool = False,
    model: Optional[str] = None,
) -> str:
    """Call NVIDIA NIM (DeepSeek v4 Pro) via OpenAI-compatible SDK."""
    from openai import OpenAI

    target_model = model or settings.NVIDIA_MODEL
    logger.warning(
        f"[LLM] 🟡 Provider: NVIDIA NIM (DeepSeek fallback)  |  Model: {target_model}"
    )

    client = OpenAI(
        base_url=settings.NVIDIA_BASE_URL,
        api_key=settings.NVIDIA_API_KEY,
    )

    if stream:
        chunks: List[str] = []
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


# ── Public API ────────────────────────────────────────────────────────────────

def chat_completion(
    messages: List[Dict[str, str]],
    temperature: float = 0.7,
    max_tokens: int = 4096,
    stream: bool = False,
    model: Optional[str] = None,
) -> str:
    """
    Primary entry-point for all agent LLM calls.

    Tries Google GenAI / Gemini 2.5 Flash first; automatically falls back to
    NVIDIA NIM / DeepSeek on any error.

    Args:
        messages:    OpenAI-style list of {"role": ..., "content": ...} dicts.
        temperature: Sampling temperature.
        max_tokens:  Max tokens to generate.
        stream:      Honoured for the DeepSeek fallback path only
                     (Gemini uses non-streaming by default).
        model:       Override the default model name.
    Returns:
        Generated text string.
    """
    provider = settings.DEFAULT_LLM_PROVIDER

    # ── Gemini / Vertex express path ──────────────────────────────────────────
    if provider == "vertex":
        try:
            return _gemini_chat_completion(
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                model=model,
            )
        except Exception as gemini_err:
            logger.error(
                f"[LLM] Gemini failed ({gemini_err!r}) — falling back to DeepSeek"
            )
            try:
                return _deepseek_chat_completion(
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    stream=stream,
                    model=model,
                )
            except Exception as fallback_err:
                logger.error(f"[LLM] DeepSeek fallback also failed: {fallback_err}")
                raise fallback_err

    # ── NVIDIA NIM path (DEFAULT_LLM_PROVIDER = "nvidia") ────────────────────
    else:
        try:
            return _deepseek_chat_completion(
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=stream,
                model=model,
            )
        except Exception as e:
            logger.error(f"[LLM] DeepSeek call failed: {e}")
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
        return json.loads(raw[first_brace : last_brace + 1])

    logger.warning(f"[LLM] Failed to parse JSON from response: {raw[:200]}")
    return {"error": "Failed to parse LLM JSON response", "raw": raw[:500]}
