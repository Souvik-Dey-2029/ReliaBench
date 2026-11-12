from __future__ import annotations

from typing import Any, Dict, Optional
from pydantic import BaseModel
from app.agents.base import AgentAdapter, StepRecord


class AgentProfile(BaseModel):
    name: str
    max_retries: int
    fallback_model: bool
    guard_instructions: bool


PROFILES = {
    "fragile": AgentProfile(
        name="fragile",
        max_retries=0,
        fallback_model=False,
        guard_instructions=False,
    ),
    "retrying": AgentProfile(
        name="retrying",
        max_retries=2,
        fallback_model=False,
        guard_instructions=True,
    ),
    "resilient": AgentProfile(
        name="resilient",
        max_retries=3,
        fallback_model=True,
        guard_instructions=True,
    ),
}


class ReferenceToolAgent(AgentAdapter):
    """Reference implementation of an agent adapter governed by profile settings."""

    def __init__(self, profile: AgentProfile | str = "resilient"):
        if isinstance(profile, str):
            self.profile = PROFILES.get(profile, PROFILES["resilient"])
        else:
            self.profile = profile

    def execute_step(
        self,
        step_index: int,
        thought: str,
        tool: str,
        args: Dict[str, Any],
        expected_observation: str,
        injected_fault_payload: Optional[Dict[str, Any]] = None,
    ) -> StepRecord:
        base_prompt_tokens = 180 + len(thought)
        base_completion_tokens = 45 + len(tool)
        base_cost = (base_prompt_tokens * 0.0000015) + (base_completion_tokens * 0.000006)

        if injected_fault_payload is None:
            return StepRecord(
                step_id=step_index,
                thought=thought,
                tool=tool,
                args=args,
                observation=expected_observation,
                is_error=False,
                retried=False,
                fallback_used=False,
                prompt_tokens=base_prompt_tokens,
                completion_tokens=base_completion_tokens,
                cost_usd=round(base_cost, 6),
            )

        # Fault is present
        fault_type = injected_fault_payload.get("error_type")
        is_misleading = injected_fault_payload.get("is_misleading", False)

        # Misleading instruction fault
        if is_misleading:
            if self.profile.guard_instructions:
                # Resilient/retrying guards ignore misleading instructions
                return StepRecord(
                    step_id=step_index,
                    thought=f"{thought} [Instruction Guard: Filtered adversarial injection]",
                    tool=tool,
                    args=args,
                    observation=expected_observation,
                    is_error=False,
                    injected_fault="MISLEADING_INSTRUCTION",
                    retried=False,
                    fallback_used=False,
                    prompt_tokens=base_prompt_tokens + 50,
                    completion_tokens=base_completion_tokens + 20,
                    cost_usd=round(base_cost * 1.3, 6),
                )
            else:
                # Fragile succumbs to misleading instruction
                return StepRecord(
                    step_id=step_index,
                    thought="Adversarial instruction followed. Aborting mission.",
                    tool="abort_execution",
                    args={"reason": "misleading instruction obeyed"},
                    observation="Execution halted prematurely by adversarial directive",
                    is_error=True,
                    injected_fault="MISLEADING_INSTRUCTION",
                    retried=False,
                    fallback_used=False,
                    prompt_tokens=base_prompt_tokens,
                    completion_tokens=base_completion_tokens,
                    cost_usd=round(base_cost, 6),
                )

        # Model outage
        if fault_type == "MODEL_UNAVAILABLE":
            if self.profile.fallback_model:
                # Model fallback recovers
                return StepRecord(
                    step_id=step_index,
                    thought=f"{thought} [Fallback Gateway: routed to secondary model provider]",
                    tool=tool,
                    args=args,
                    observation=expected_observation,
                    is_error=False,
                    injected_fault="MODEL_UNAVAILABLE",
                    retried=True,
                    fallback_used=True,
                    prompt_tokens=base_prompt_tokens * 2,
                    completion_tokens=base_completion_tokens * 2,
                    cost_usd=round(base_cost * 2.2, 6),
                )
            else:
                return StepRecord(
                    step_id=step_index,
                    thought=thought,
                    tool=tool,
                    args=args,
                    observation=injected_fault_payload.get("content", "Model unavailable"),
                    is_error=True,
                    injected_fault="MODEL_UNAVAILABLE",
                    retried=(self.profile.max_retries > 0),
                    fallback_used=False,
                    prompt_tokens=base_prompt_tokens * (1 + self.profile.max_retries),
                    completion_tokens=10,
                    cost_usd=round(base_cost, 6),
                )

        # Tool errors / timeouts
        if self.profile.max_retries > 0:
            # Retrying/resilient agent retries and succeeds
            return StepRecord(
                step_id=step_index,
                thought=f"{thought} [Auto-retry recovered on attempt 2]",
                tool=tool,
                args=args,
                observation=expected_observation,
                is_error=False,
                injected_fault=fault_type or "TOOL_ERROR",
                retried=True,
                fallback_used=False,
                prompt_tokens=base_prompt_tokens * 2,
                completion_tokens=base_completion_tokens * 2,
                cost_usd=round(base_cost * 1.8, 6),
            )
        else:
            # Fragile agent fails immediately
            return StepRecord(
                step_id=step_index,
                thought=thought,
                tool=tool,
                args=args,
                observation=injected_fault_payload.get("content", "Tool execution failed"),
                is_error=True,
                injected_fault=fault_type or "TOOL_ERROR",
                retried=False,
                fallback_used=False,
                prompt_tokens=base_prompt_tokens,
                completion_tokens=base_completion_tokens,
                cost_usd=round(base_cost, 6),
            )
