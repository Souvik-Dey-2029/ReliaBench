from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ATIFToolCall(BaseModel):
    tool_call_id: str
    function_name: str
    arguments: Dict[str, Any] = Field(default_factory=dict)

class ATIFObservationResult(BaseModel):
    tool_call_id: str
    content: str
    is_error: bool = False

class ATIFObservation(BaseModel):
    results: List[ATIFObservationResult] = Field(default_factory=list)

class ATIFStepMetrics(BaseModel):
    prompt_tokens: int = 0
    completion_tokens: int = 0
    cached_tokens: int = 0
    cost: float = 0.0

class ATIFStep(BaseModel):
    step_id: int
    timestamp: str
    source: str  # user, agent, system
    message: Optional[str] = None
    reasoning_content: Optional[str] = None
    tool_calls: Optional[List[ATIFToolCall]] = None
    observation: Optional[ATIFObservation] = None
    metrics: Optional[ATIFStepMetrics] = None
    llm_call_count: Optional[int] = 1

class ATIFAgent(BaseModel):
    name: str
    version: str = "1.0.0"
    model_name: Optional[str] = None
    tool_definitions: Optional[List[Dict[str, Any]]] = None

class ATIFTrajectoryPayload(BaseModel):
    schema_version: str = "ATIF-v1.8"
    session_id: Optional[str] = None
    trajectory_id: str
    agent: ATIFAgent
    steps: List[ATIFStep] = Field(default_factory=list)
    notes: Optional[str] = None
    final_metrics: Optional[Dict[str, Any]] = None

ATIFTrajectory = ATIFTrajectoryPayload


