"""Optional LLM explanation layer.

The model explains already-computed evidence. It never calculates or changes
the risk score, benchmark, or fraud conclusion.
"""

from __future__ import annotations

import json
import os
from urllib.error import URLError
from urllib.request import Request, urlopen


def explain_risk(context: dict) -> str | None:
    api_key = os.environ.get("LLM_API_KEY", "").strip()
    if not api_key:
        return None

    endpoint = os.environ.get("LLM_BASE_URL", "https://api.openai.com/v1").rstrip("/") + "/chat/completions"
    model = os.environ.get("LLM_MODEL", "gpt-4o-mini")
    prompt = (
        "Explain this tourism risk assessment in 2 concise sentences for a traveller. "
        "Use only the supplied facts. Do not call it confirmed fraud, do not invent prices, "
        "and mention that the score is a warning signal. Return plain text only.\n\n"
        + json.dumps(context, ensure_ascii=False)
    )
    payload = json.dumps({
        "model": model,
        "temperature": 0.1,
        "max_tokens": 120,
        "messages": [
            {"role": "system", "content": "You are a careful tourism safety explanation assistant."},
            {"role": "user", "content": prompt},
        ],
    }).encode("utf-8")
    request = Request(
        endpoint,
        data=payload,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urlopen(request, timeout=8) as response:
            result = json.loads(response.read().decode("utf-8"))
        text = result["choices"][0]["message"]["content"].strip()
        return text[:600] or None
    except (KeyError, IndexError, TypeError, ValueError, OSError, URLError):
        return None