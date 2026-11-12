from __future__ import annotations

import time
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.core.config import settings


class GatewayChatResponse(BaseModel):
    id: str
    provider: str
    model: str
    content: str
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    cost_usd: float
    latency_ms: float
    fallback_used: bool = False
    mode: str = "MOCK"  # GATEWAY or MOCK


class BifrostClient:
    """Client for Maxim Bifrost / OpenAI-compatible model gateway.

    Routes model calls, measures latency, calculates token usage, and
    performs cost and fallback attribution. If not configured or unreachable,
    degrades cleanly to a clearly labelled local stub (mode=MOCK, fallback_used=True).
    """

    def __init__(
        self,
        endpoint: str = settings.BIFROST_ENDPOINT,
        api_key: Optional[str] = None,
        enabled: bool = settings.ENABLE_BIFROST_GATEWAY,
    ):
        self.endpoint = endpoint
        self.api_key = api_key or getattr(settings, "BIFROST_API_KEY", "")
        self.enabled = enabled

    def chat(
        self,
        messages: List[Dict[str, str]],
        model: str = "gpt-4o-mini",
        temperature: float = 0.0,
        allow_fallback: bool = True,
    ) -> GatewayChatResponse:
        start = time.perf_counter()

        # If gateway is disabled or not configured, return labeled stub
        if not self.enabled or not self.endpoint:
            elapsed_ms = round((time.perf_counter() - start) * 1000 + 45.0, 2)
            prompt_toks = sum(len(m.get("content", "")) // 4 for m in messages) + 120
            completion_toks = 65
            total_toks = prompt_toks + completion_toks
            # $0.15/1M prompt, $0.60/1M completion
            cost = round((prompt_toks * 0.00000015) + (completion_toks * 0.00000060), 6)

            return GatewayChatResponse(
                id="mock-bifrost-call-1",
                provider="stub-gateway",
                model=model,
                content="Executed successfully via local fallback stub.",
                prompt_tokens=prompt_toks,
                completion_tokens=completion_toks,
                total_tokens=total_toks,
                cost_usd=cost,
                latency_ms=elapsed_ms,
                fallback_used=True,
                mode="MOCK",
            )

        # In production mode when endpoint is active, we attempt gateway call
        try:
            import httpx
            resp = httpx.post(
                f"{self.endpoint.rstrip('/')}/v1/chat/completions",
                json={"model": model, "messages": messages, "temperature": temperature},
                headers={"Authorization": f"Bearer {self.api_key}"} if self.api_key else {},
                timeout=5.0,
            )
            if resp.status_code == 200:
                data = resp.json()
                usage = data.get("usage", {})
                p_tok = usage.get("prompt_tokens", 100)
                c_tok = usage.get("completion_tokens", 50)
                cost = round((p_tok * 0.00000015) + (c_tok * 0.00000060), 6)
                elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
                return GatewayChatResponse(
                    id=data.get("id", "gw-call"),
                    provider="bifrost",
                    model=model,
                    content=data["choices"][0]["message"]["content"],
                    prompt_tokens=p_tok,
                    completion_tokens=c_tok,
                    total_tokens=p_tok + c_tok,
                    cost_usd=cost,
                    latency_ms=elapsed_ms,
                    fallback_used=False,
                    mode="GATEWAY",
                )
        except Exception:
            pass

        # Fallback if call fails
        elapsed_ms = round((time.perf_counter() - start) * 1000 + 50.0, 2)
        prompt_toks = sum(len(m.get("content", "")) // 4 for m in messages) + 120
        completion_toks = 50
        cost = round((prompt_toks * 0.00000015) + (completion_toks * 0.00000060), 6)
        return GatewayChatResponse(
            id="mock-bifrost-call-fallback",
            provider="stub-gateway",
            model=model,
            content="Degraded to local fallback stub due to gateway timeout.",
            prompt_tokens=prompt_toks,
            completion_tokens=completion_toks,
            total_tokens=prompt_toks + completion_toks,
            cost_usd=cost,
            latency_ms=elapsed_ms,
            fallback_used=True,
            mode="MOCK",
        )


class BifrostAdapter:
    """Adapter for Maxim Bifrost Model Gateway (OpenAI-compatible)."""

    def __init__(
        self,
        endpoint: str = settings.BIFROST_ENDPOINT,
        enabled: bool = settings.ENABLE_BIFROST_GATEWAY,
    ):
        self.endpoint = endpoint
        self.enabled = enabled
        self.client = BifrostClient(endpoint=endpoint, enabled=enabled)

    def get_status(self) -> Dict[str, Any]:
        if not self.enabled:
            return {
                "configured": False,
                "status": "DISABLED",
                "endpoint": self.endpoint,
                "mode": "MOCK",
                "note": "Bifrost Gateway disabled. Running in local stub mode (mode=MOCK, fallback_used=True).",
            }

        return {
            "configured": True,
            "status": "READY",
            "endpoint": self.endpoint,
            "mode": "GATEWAY",
            "note": "Model Gateway enabled. Observing requests routed through gateway.",
        }
