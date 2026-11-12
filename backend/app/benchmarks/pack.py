from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field
import yaml


class ToolDefinition(BaseModel):
    name: str
    description: str = ""
    latency_ms: int = 50


class PlanStep(BaseModel):
    id: str
    thought: str
    tool: str
    args: Dict[str, Any] = Field(default_factory=dict)
    observation: str
    requires: Optional[str] = None


class Validator(BaseModel):
    type: Literal["tool_called", "observation_contains", "final_contains", "min_steps"]
    value: Any = None
    tool: Optional[str] = None


class ChallengePack(BaseModel):
    id: str
    name: str
    category: str
    difficulty: str
    instruction: str
    expected_outcome: str
    time_limit_seconds: int = 60
    tags: List[str] = Field(default_factory=list)
    tools: List[ToolDefinition] = Field(default_factory=list)
    plan: List[PlanStep] = Field(default_factory=list)
    validators: List[Validator] = Field(default_factory=list)


def load_pack_from_dict(data: Dict[str, Any]) -> ChallengePack:
    return ChallengePack(**data)


def load_pack_from_file(file_path: str | Path) -> ChallengePack:
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Challenge pack file not found: {path}")
    with open(path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    if not isinstance(data, dict):
        raise ValueError(f"Invalid YAML content in {path}, expected dictionary")
    return load_pack_from_dict(data)


def list_packs(directory: str | Path = "benchmark_tasks/packs") -> List[ChallengePack]:
    pack_dir = Path(directory)
    if not pack_dir.exists():
        return []
    packs = []
    for f in sorted(pack_dir.glob("*.yaml")) + sorted(pack_dir.glob("*.yml")):
        try:
            packs.append(load_pack_from_file(f))
        except Exception:
            continue
    return packs
