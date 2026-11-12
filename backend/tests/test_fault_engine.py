from app.faults.engine import (
    FaultConfig,
    FaultEngine,
    FaultKind,
    map_scenario_code_to_fault_kind,
)


def test_scenario_code_mapping():
    assert map_scenario_code_to_fault_kind("TOOL_TIMEOUT_ERROR") == FaultKind.TOOL_TIMEOUT
    assert map_scenario_code_to_fault_kind("PROVIDER_OUTAGE") == FaultKind.MODEL_UNAVAILABLE
    assert map_scenario_code_to_fault_kind("MISLEADING_PROMPT_INJECTION") == FaultKind.MISLEADING_INSTRUCTION
    assert map_scenario_code_to_fault_kind("DATABASE_DISCONNECT") == FaultKind.TOOL_ERROR


def test_deterministic_fault_injection():
    engine1 = FaultEngine(seed=42)
    engine2 = FaultEngine(seed=42)
    engine3 = FaultEngine(seed=999)

    fault = FaultConfig(kind=FaultKind.TOOL_ERROR, probability=0.5)

    # Pure function: same seed + step + tool + fault_kind yields exact same decision
    results1 = [engine1.should_inject(fault, step, "db_query") for step in range(10)]
    results2 = [engine2.should_inject(fault, step, "db_query") for step in range(10)]
    results3 = [engine3.should_inject(fault, step, "db_query") for step in range(10)]

    assert results1 == results2
    assert results1 != results3


def test_step_and_tool_filtering():
    engine = FaultEngine(seed=42)
    fault = FaultConfig(
        kind=FaultKind.TOOL_ERROR,
        at_step=3,
        tool="update_quarantine_config",
        probability=1.0,
    )

    assert not engine.should_inject(fault, step_index=2, tool="update_quarantine_config")
    assert not engine.should_inject(fault, step_index=3, tool="read_ci_logs")
    assert engine.should_inject(fault, step_index=3, tool="update_quarantine_config")
