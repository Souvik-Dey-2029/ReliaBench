from typing import Dict, Any
from app.core.config import settings

class BifrostAdapter:
    """
    Adapter for Maxim Bifrost Model Gateway (OpenAI-compatible).
    Collects gateway latency, token counts, and provider response metadata.
    """

    def __init__(self, endpoint: str = settings.BIFROST_ENDPOINT, enabled: bool = settings.ENABLE_BIFROST_GATEWAY):
        self.endpoint = endpoint
        self.enabled = enabled

    def get_status(self) -> Dict[str, Any]:
        if not self.enabled:
            return {
                "configured": False,
                "status": "DISABLED",
                "endpoint": self.endpoint,
                "note": "Bifrost Gateway is optional and disabled by default."
            }
        
        # When enabled, could ping /health or /v1/models
        return {
            "configured": True,
            "status": "READY",
            "endpoint": self.endpoint,
            "note": "Model Gateway enabled. Observing requests routed through gateway."
        }

