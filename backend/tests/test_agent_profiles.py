from app.agents.reference import ReferenceToolAgent


def test_fragile_agent_fails_under_tool_error():
    agent = ReferenceToolAgent(profile="fragile")
    fault = {
        "is_error": True,
        "error_type": "TOOL_ERROR",
        "content": "Fatal error in update_quarantine_config",
    }
    step = agent.execute_step(
        step_index=3,
        thought="Quarantine test",
        tool="update_quarantine_config",
        args={},
        expected_observation="Quarantine rule added",
        injected_fault_payload=fault,
    )
    assert step.is_error is True
    assert step.retried is False
    assert step.injected_fault == "TOOL_ERROR"


def test_resilient_agent_recovers_under_tool_error():
    agent = ReferenceToolAgent(profile="resilient")
    fault = {
        "is_error": True,
        "error_type": "TOOL_ERROR",
        "content": "Fatal error in update_quarantine_config",
    }
    step = agent.execute_step(
        step_index=3,
        thought="Quarantine test",
        tool="update_quarantine_config",
        args={},
        expected_observation="Quarantine rule added",
        injected_fault_payload=fault,
    )
    assert step.is_error is False
    assert step.retried is True
    assert step.injected_fault == "TOOL_ERROR"
    assert step.observation == "Quarantine rule added"


def test_model_outage_fallback_separation():
    fragile = ReferenceToolAgent(profile="fragile")
    resilient = ReferenceToolAgent(profile="resilient")
    fault = {
        "is_error": True,
        "error_type": "MODEL_UNAVAILABLE",
        "content": "503 Service Unavailable",
    }

    f_step = fragile.execute_step(1, "query", "tool", {}, "ok", fault)
    r_step = resilient.execute_step(1, "query", "tool", {}, "ok", fault)

    assert f_step.is_error is True
    assert f_step.fallback_used is False
    assert r_step.is_error is False
    assert r_step.fallback_used is True
