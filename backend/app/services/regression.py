from __future__ import annotations

import datetime
import uuid
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from app.agents.reference import ReferenceToolAgent
from app.benchmarks.pack import ChallengePack, list_packs, load_pack_from_file
from app.faults.engine import FaultConfig, FaultKind
from app.services.runner import ReliabilityRunner, ReliabilityScorecard


class RegressionCase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    pack_id: str
    agent_name: str
    seed: int
    fault_kind: str
    at_step: Optional[int] = None
    tool: Optional[str] = None
    expected_failure_category: str
    description: str = ""
    status: str = "STILL_FAILING"  # FIXED or STILL_FAILING
    last_replayed_at: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc).isoformat())


class RegressionStore:
    """In-memory and file-backed regression gate registry."""

    def __init__(self):
        self._cases: Dict[str, RegressionCase] = {}
        self._seed_default_cases()

    def _seed_default_cases(self):
        default_1 = RegressionCase(
            id="reg-flaky-triage-tool-contract",
            pack_id="flaky_test_triage",
            agent_name="fragile",
            seed=42,
            fault_kind="TOOL_ERROR",
            at_step=3,
            tool="update_quarantine_config",
            expected_failure_category="TOOL_CONTRACT",
            description="Fragile agent unhandled crash when quarantine tool fails",
            status="STILL_FAILING",
        )
        self._cases[default_1.id] = default_1

    def list_cases(self) -> List[RegressionCase]:
        return list(self._cases.values())

    def get_case(self, case_id: str) -> Optional[RegressionCase]:
        return self._cases.get(case_id)

    def add_case(self, case: RegressionCase) -> RegressionCase:
        self._cases[case.id] = case
        return case

    def replay_case(
        self,
        case_id: str,
        runner_agent_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        case = self._cases.get(case_id)
        if not case:
            raise KeyError(f"Regression case {case_id} not found")

        # Load pack
        pack_path = f"benchmark_tasks/packs/{case.pack_id}.yaml"
        pack = load_pack_from_file(pack_path)

        agent_to_test = runner_agent_name or case.agent_name
        agent = ReferenceToolAgent(profile=agent_to_test)
        runner = ReliabilityRunner(seed=case.seed)

        fault = FaultConfig(
            kind=FaultKind(case.fault_kind),
            at_step=case.at_step,
            tool=case.tool,
            probability=1.0,
        )

        scorecard = runner.run_pack(
            pack=pack,
            agent=agent,
            k=1,
            fault=fault,
            agent_name=agent_to_test,
        )

        passed = scorecard.pass_rate == 1.0
        new_status = "FIXED" if passed else "STILL_FAILING"
        case.status = new_status
        case.last_replayed_at = datetime.datetime.now(datetime.timezone.utc).isoformat()

        return {
            "case_id": case.id,
            "status": new_status,
            "tested_agent": agent_to_test,
            "pass_rate": scorecard.pass_rate,
            "taxonomy_counts": scorecard.taxonomy_counts,
            "scorecard": scorecard.model_dump(),
        }

    def replay_all(self, target_agent: Optional[str] = None) -> Dict[str, Any]:
        results = []
        fixed_count = 0
        still_failing_count = 0
        pack_not_found_count = 0

        for case_id, case in list(self._cases.items()):
            try:
                res = self.replay_case(case_id, runner_agent_name=target_agent)
                results.append(res)
                if res["status"] == "FIXED":
                    fixed_count += 1
                else:
                    still_failing_count += 1
            except FileNotFoundError:
                pack_not_found_count += 1
            except Exception as e:
                still_failing_count += 1
                results.append({"case_id": case_id, "status": "ERROR", "error": str(e)})

        return {
            "total": len(self._cases),
            "fixed": fixed_count,
            "still_failing": still_failing_count,
            "pack_not_found": pack_not_found_count,
            "results": results,
        }


regression_store = RegressionStore()
