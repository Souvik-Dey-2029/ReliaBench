from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# Base Agent
class AgentBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    framework: str = Field("custom", max_length=50)
    version: str = Field("1.0.0", max_length=30)
    adapter_type: str = Field("simulator", max_length=50)
    model_provider: Optional[str] = None
    model_name: Optional[str] = None
    status: str = "READY"
    is_demo: bool = False

class AgentCreate(AgentBase):
    pass

class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    framework: Optional[str] = None
    version: Optional[str] = None
    adapter_type: Optional[str] = None
    model_provider: Optional[str] = None
    model_name: Optional[str] = None
    status: Optional[str] = None

class AgentResponse(AgentBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Benchmark Task
class BenchmarkTaskBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    category: str = "general"
    difficulty: str = "MEDIUM"
    description: str
    instruction: str
    expected_outcome: str
    verification_method: str = "ASSERTION_SCRIPT"
    time_limit_seconds: int = 120
    environment_type: str = "DOCKER_SANDBOX"
    is_demo: bool = False

class BenchmarkTaskCreate(BenchmarkTaskBase):
    pass

class BenchmarkTaskResponse(BenchmarkTaskBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Failure Scenario
class FailureScenarioResponse(BaseModel):
    id: str
    name: str
    code: str
    description: str
    trigger_point: str
    severity: str
    parameters: Dict[str, Any]

    class Config:
        from_attributes = True

# Experiment
class ExperimentCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=150)
    description: Optional[str] = None
    agent_id: str
    benchmark_task_id: str
    failure_scenario_id: Optional[str] = None
    repetitions_k: int = Field(3, ge=1, le=10)
    timeout_seconds: int = Field(180, ge=10, le=600)

class TrialResponse(BaseModel):
    id: str
    trial_number: int
    status: str
    reward_score: float
    duration_seconds: float
    failure_injected: bool
    failure_recovered: bool
    error_message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class RunResponse(BaseModel):
    id: str
    total_trials: int
    successful_trials: int
    failed_trials: int
    pass_rate: float
    pass_at_k: float
    pass_to_k: float
    recovery_rate: Optional[float] = None
    avg_duration_seconds: float
    duration_variance: float
    avg_cost_usd: Optional[float] = None
    total_tokens: Optional[int] = None
    status: str
    trials: List[TrialResponse] = Field(default_factory=list)
    created_at: datetime

    class Config:
        from_attributes = True

class ExperimentResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    agent_id: str
    benchmark_task_id: str
    failure_scenario_id: Optional[str] = None
    repetitions_k: int
    timeout_seconds: int
    status: str
    is_demo: bool
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    agent: Optional[AgentResponse] = None
    benchmark_task: Optional[BenchmarkTaskResponse] = None
    failure_scenario: Optional[FailureScenarioResponse] = None
    runs: List[RunResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True

# Dashboard
class DashboardSummary(BaseModel):
    total_agents: int
    total_benchmarks: int
    total_experiments: int
    overall_pass_rate: float
    average_duration_seconds: float
    average_cost_usd: Optional[float] = None
    active_environment_mode: str
    harbor_status: Dict[str, Any]
    recent_experiments: List[ExperimentResponse]
    recent_failures: List[Dict[str, Any]]
    reliability_distribution: List[Dict[str, Any]]

