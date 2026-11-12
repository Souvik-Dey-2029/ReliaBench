from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class StepRecord(BaseModel):
    step_id: int
    thought: str
    tool: str
    args: Dict[str, Any] = Field(default_factory=dict)
    observation: str
    is_error: bool = False
    injected_fault: Optional[str] = None
    retried: bool = False
    fallback_used: bool = False
    prompt_tokens: int = 150
    completion_tokens: int = 60
    cost_usd: float = 0.00045


class AgentResult(BaseModel):
    success: bool
    status: str  # PASSED, RECOVERED, FAILED, TIMEOUT
    steps: List[StepRecord] = Field(default_factory=list)
    final_output: str = ""
    error_message: Optional[str] = None
    taxonomy_category: Optional[str] = None
    remediation_hint: Optional[str] = None
    total_prompt_tokens: int = 0
    total_completion_tokens: int = 0
    total_cost_usd: float = 0.0
    duration_seconds: float = 0.0


class AgentAdapter(ABC):
    @abstractmethod
    def execute_step(
        self,
        step_index: int,
        thought: str,
        tool: str,
        args: Dict[str, Any],
        expected_observation: str,
        injected_fault_payload: Optional[Dict[str, Any]] = None,
    ) -> StepRecord:
        """Executes a single step given optional fault payload."""
        pass
