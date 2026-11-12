from __future__ import annotations

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.agents.reference import ReferenceToolAgent
from app.benchmarks.pack import ChallengePack, list_packs, load_pack_from_file
from app.evaluation.taxonomy import TAXONOMY_HINTS, TaxonomyCategory
from app.faults.engine import FaultConfig, FaultKind
from app.services.regression import RegressionCase, regression_store
from app.services.runner import ReliabilityRunner, ReliabilityScorecard

router = APIRouter()


class RunPackRequest(BaseModel):
    profile: str = "resilient"  # fragile, retrying, resilient
    k: int = Field(default=3, ge=1, le=10)
    seed: int = 42
    fault_kind: Optional[str] = None  # TOOL_ERROR, TOOL_TIMEOUT, MODEL_UNAVAILABLE, MISLEADING_INSTRUCTION
    at_step: Optional[int] = None
    tool: Optional[str] = None
    probability: float = 1.0


@router.get("/packs", response_model=List[ChallengePack])
def get_packs():
    return list_packs()


@router.get("/packs/{pack_id}", response_model=ChallengePack)
def get_pack(pack_id: str):
    pack_path = f"benchmark_tasks/packs/{pack_id}.yaml"
    try:
        return load_pack_from_file(pack_path)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Challenge pack '{pack_id}' not found")


@router.post("/packs/{pack_id}/run", response_model=ReliabilityScorecard)
def run_pack_endpoint(pack_id: str, req: RunPackRequest):
    pack_path = f"benchmark_tasks/packs/{pack_id}.yaml"
    try:
        pack = load_pack_from_file(pack_path)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Challenge pack '{pack_id}' not found")

    agent = ReferenceToolAgent(profile=req.profile)
    runner = ReliabilityRunner(seed=req.seed)

    fault = None
    if req.fault_kind:
        try:
            fk = FaultKind(req.fault_kind)
            fault = FaultConfig(
                kind=fk,
                at_step=req.at_step,
                tool=req.tool,
                probability=req.probability,
            )
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid fault_kind '{req.fault_kind}'. Valid kinds: {[k.value for k in FaultKind]}",
            )

    scorecard = runner.run_pack(
        pack=pack,
        agent=agent,
        k=req.k,
        fault=fault,
        agent_name=req.profile,
        source_mode="DETERMINISTIC_HARNESS",
    )
    return scorecard


@router.get("/taxonomy")
def get_taxonomy():
    return {
        "categories": [c.value for c in TaxonomyCategory],
        "remediation_hints": {c.value: hint for c, hint in TAXONOMY_HINTS.items()},
        "priority_order": [
            "TIMEOUT",
            "PLANNING_DEVIATION",
            "VERIFIER_MISMATCH",
            "RECOVERY_EXHAUSTED",
            "TOOL_CONTRACT / MODEL_OUTAGE / INSTRUCTION_CONFLICT",
            "UNKNOWN",
        ],
    }


@router.get("/regressions", response_model=List[RegressionCase])
def list_regressions():
    return regression_store.list_cases()


@router.post("/regressions", response_model=RegressionCase)
def create_regression(case: RegressionCase):
    return regression_store.add_case(case)


@router.post("/regressions/{case_id}/replay")
def replay_regression(case_id: str, runner_agent: Optional[str] = Query(None)):
    try:
        return regression_store.replay_case(case_id, runner_agent_name=runner_agent)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Regression case '{case_id}' not found")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Underlying challenge pack not found")


@router.post("/regressions/run-all")
def replay_all_regressions(target_agent: Optional[str] = Query(None)):
    return regression_store.replay_all(target_agent=target_agent)
