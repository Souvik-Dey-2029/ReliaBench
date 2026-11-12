from __future__ import annotations

import datetime
import uuid
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from app.agents.base import AgentAdapter, AgentResult, StepRecord
from app.agents.reference import ReferenceToolAgent
from app.benchmarks.pack import ChallengePack, Validator
from app.evaluation.metrics import calculate_pass_at_k, calculate_pass_pow_k, wilson_score_interval
from app.evaluation.taxonomy import TaxonomyCategory, TaxonomyClassifier
from app.faults.engine import FaultConfig, FaultEngine
from app.schemas.atif import ATIFTrajectory


class ReliabilityScorecard(BaseModel):
    pack_id: str
    agent_name: str
    repetitions_k: int
    seed: int
    source_mode: str = "DETERMINISTIC_HARNESS"
    pass_rate: float
    wilson_lower: float
    wilson_upper: float
    pass_at_k: float
    pass_pow_k: float
    recovery_rate: float
    faults_injected_count: int
    median_duration_seconds: float
    total_cost_usd: float
    total_tokens: int
    taxonomy_counts: Dict[str, int] = Field(default_factory=dict)
    remediation_hints: Dict[str, str] = Field(default_factory=dict)
    trial_results: List[Dict[str, Any]] = Field(default_factory=list)


class ReliabilityRunner:
    """Executes challenge packs across repeated trials with deterministic fault injection."""

    def __init__(self, seed: int = 42):
        self.seed = seed
        self.fault_engine = FaultEngine(seed=seed)

    def run_trial(
        self,
        pack: ChallengePack,
        agent: AgentAdapter,
        fault: Optional[FaultConfig] = None,
        trial_index: int = 1,
    ) -> AgentResult:
        steps_record: List[StepRecord] = []
        last_observation = ""
        planning_deviation = False
        verifier_mismatch = False
        timed_out = False
        total_prompt_tokens = 0
        total_completion_tokens = 0
        total_cost = 0.0
        fault_injected = False
        recovered = False

        start_time = datetime.datetime.now(datetime.timezone.utc)

        for idx, plan_step in enumerate(pack.plan, start=1):
            # Check precondition 'requires'
            if plan_step.requires:
                if plan_step.requires not in last_observation:
                    planning_deviation = True
                    break

            # Check fault injection
            fault_payload = None
            if fault and self.fault_engine.should_inject(fault, step_index=idx, tool=plan_step.tool):
                fault_payload = self.fault_engine.generate_fault_payload(fault, tool=plan_step.tool)
                fault_injected = True

            record = agent.execute_step(
                step_index=idx,
                thought=plan_step.thought,
                tool=plan_step.tool,
                args=plan_step.args,
                expected_observation=plan_step.observation,
                injected_fault_payload=fault_payload,
            )
            steps_record.append(record)
            total_prompt_tokens += record.prompt_tokens
            total_completion_tokens += record.completion_tokens
            total_cost += record.cost_usd
            last_observation = record.observation

            if fault_payload:
                if not record.is_error:
                    recovered = True
                else:
                    # Failed at this step
                    break

        duration = (datetime.datetime.now(datetime.timezone.utc) - start_time).total_seconds()
        if duration == 0.0:
            duration = round(len(steps_record) * 0.12, 3)

        # Check validators if no early stop
        executed_tools = {s.tool for s in steps_record}
        combined_obs = " ".join(s.observation for s in steps_record)

        if not planning_deviation and len(steps_record) == len(pack.plan) and not any(s.is_error for s in steps_record):
            for v in pack.validators:
                if v.type == "tool_called" and v.tool and v.tool not in executed_tools:
                    verifier_mismatch = True
                    break
                elif v.type == "observation_contains" and v.value and v.value not in combined_obs:
                    verifier_mismatch = True
                    break
                elif v.type == "min_steps" and v.value and len(steps_record) < int(v.value):
                    verifier_mismatch = True
                    break
                elif v.type == "final_contains" and v.value and (not steps_record or v.value not in steps_record[-1].observation):
                    verifier_mismatch = True
                    break

        has_step_error = any(s.is_error for s in steps_record)
        is_success = (
            not planning_deviation
            and not verifier_mismatch
            and not has_step_error
            and len(steps_record) == len(pack.plan)
        )

        if is_success:
            status = "RECOVERED" if recovered else "PASSED"
            tax_cat = None
            hint = None
            err_msg = None
        else:
            status = "FAILED"
            retried = any(s.retried for s in steps_record)
            tax_enum = TaxonomyClassifier.classify(
                timed_out=timed_out,
                planning_deviation=planning_deviation,
                verifier_mismatch=verifier_mismatch,
                retried=retried,
                fault_kind=fault.kind.value if (fault and fault_injected) else None,
            )
            tax_cat = tax_enum.value
            hint = TaxonomyClassifier.get_remediation_hint(tax_enum)
            if planning_deviation:
                err_msg = f"Planning deviation: Precondition unmet for step {len(steps_record)+1}"
            elif verifier_mismatch:
                err_msg = "Verifier mismatch: Outcome failed task validator criteria"
            else:
                err_msg = steps_record[-1].observation if steps_record else "Trial aborted"

        return AgentResult(
            success=is_success,
            status=status,
            steps=steps_record,
            final_output=last_observation,
            error_message=err_msg,
            taxonomy_category=tax_cat,
            remediation_hint=hint,
            total_prompt_tokens=total_prompt_tokens,
            total_completion_tokens=total_completion_tokens,
            total_cost_usd=round(total_cost, 6),
            duration_seconds=round(duration, 3),
        )

    def run_pack(
        self,
        pack: ChallengePack,
        agent: AgentAdapter,
        k: int = 3,
        fault: Optional[FaultConfig] = None,
        agent_name: str = "reference_agent",
        source_mode: str = "DETERMINISTIC_HARNESS",
    ) -> ReliabilityScorecard:
        trial_results: List[Dict[str, Any]] = []
        successes = 0
        recoveries = 0
        faults_injected_count = 0
        durations: List[float] = []
        total_cost = 0.0
        total_tokens = 0
        taxonomy_counts: Dict[str, int] = {}
        remediation_hints: Dict[str, str] = {}

        for i in range(1, k + 1):
            res = self.run_trial(pack, agent, fault=fault, trial_index=i)
            durations.append(res.duration_seconds)
            total_cost += res.total_cost_usd
            total_tokens += (res.total_prompt_tokens + res.total_completion_tokens)

            has_fault = any(s.injected_fault is not None for s in res.steps)
            if has_fault:
                faults_injected_count += 1

            if res.success:
                successes += 1
                if res.status == "RECOVERED":
                    recoveries += 1
            else:
                cat = res.taxonomy_category or "UNKNOWN"
                taxonomy_counts[cat] = taxonomy_counts.get(cat, 0) + 1
                if res.remediation_hint:
                    remediation_hints[cat] = res.remediation_hint

            trial_results.append({
                "trial_number": i,
                "status": res.status,
                "success": res.success,
                "duration_seconds": res.duration_seconds,
                "cost_usd": res.total_cost_usd,
                "tokens": res.total_prompt_tokens + res.total_completion_tokens,
                "taxonomy_category": res.taxonomy_category,
                "error_message": res.error_message,
                "step_count": len(res.steps),
                "steps": [s.model_dump() for s in res.steps],
            })

        pass_rate = round(successes / k, 4) if k > 0 else 0.0
        wilson_low, wilson_high = wilson_score_interval(successes, k)
        pass_at_k = round(calculate_pass_at_k(k, successes, k), 4)
        pass_pow_k = round(calculate_pass_pow_k([successes], k), 4)

        # Enforce invariant pass^k <= pass@k
        if pass_pow_k > pass_at_k:
            pass_pow_k = pass_at_k

        rec_rate = round(recoveries / faults_injected_count, 4) if faults_injected_count > 0 else (1.0 if successes == k else 0.0)
        durations.sort()
        median_dur = durations[len(durations) // 2] if durations else 0.0

        return ReliabilityScorecard(
            pack_id=pack.id,
            agent_name=agent_name,
            repetitions_k=k,
            seed=self.seed,
            source_mode=source_mode,
            pass_rate=pass_rate,
            wilson_lower=round(wilson_low, 4),
            wilson_upper=round(wilson_high, 4),
            pass_at_k=pass_at_k,
            pass_pow_k=pass_pow_k,
            recovery_rate=rec_rate,
            faults_injected_count=faults_injected_count,
            median_duration_seconds=round(median_dur, 3),
            total_cost_usd=round(total_cost, 6),
            total_tokens=total_tokens,
            taxonomy_counts=taxonomy_counts,
            remediation_hints=remediation_hints,
            trial_results=trial_results,
        )

    def to_atif_trajectory(
        self,
        trial_data: Dict[str, Any],
        agent_name: str,
        pack: ChallengePack,
    ) -> Dict[str, Any]:
        """Maps trial execution steps into ATIF v1.8 schema."""
        trajectory_id = str(uuid.uuid4())
        session_id = f"relia-session-{self.seed}-{trial_data.get('trial_number', 1)}"

        steps: List[Dict[str, Any]] = [
            {
                "step_id": 0,
                "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "source": "user",
                "message": pack.instruction,
            }
        ]

        for s in trial_data.get("steps", []):
            step_id = s.get("step_id", 1)
            is_err = s.get("is_error", False)
            steps.append({
                "step_id": step_id,
                "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "source": "agent",
                "reasoning_content": s.get("thought", ""),
                "tool_calls": [
                    {
                        "tool_call_id": f"call_{step_id}_{s.get('tool', 'tool')}",
                        "function_name": s.get("tool", ""),
                        "arguments": s.get("args", {}),
                    }
                ],
                "observation": {
                    "results": [
                        {
                            "tool_call_id": f"call_{step_id}_{s.get('tool', 'tool')}",
                            "content": s.get("observation", ""),
                            "is_error": is_err,
                        }
                    ]
                },
                "metrics": {
                    "prompt_tokens": s.get("prompt_tokens", 0),
                    "completion_tokens": s.get("completion_tokens", 0),
                    "cached_tokens": 0,
                    "cost": s.get("cost_usd", 0.0),
                },
            })

        return {
            "schema_version": "1.8",
            "session_id": session_id,
            "trajectory_id": trajectory_id,
            "agent": {
                "name": agent_name,
                "version": "1.0.0",
                "model_name": "bifrost/primary-router",
                "tool_definitions": [
                    {"name": t.name, "description": t.description} for t in pack.tools
                ],
            },
            "steps": steps,
            "notes": f"Trial {trial_data.get('trial_number')} - status: {trial_data.get('status')}",
            "final_metrics": {
                "success": trial_data.get("success", False),
                "duration_seconds": trial_data.get("duration_seconds", 0.0),
                "cost_usd": trial_data.get("cost_usd", 0.0),
                "tokens": trial_data.get("tokens", 0),
                "taxonomy_category": trial_data.get("taxonomy_category"),
            },
        }
