from app.services.regression import RegressionCase, RegressionStore


def test_regression_store_replay_fragile_fails():
    store = RegressionStore()
    cases = store.list_cases()
    assert len(cases) >= 1

    case_id = cases[0].id
    res = store.replay_case(case_id, runner_agent_name="fragile")
    assert res["status"] == "STILL_FAILING"
    assert res["pass_rate"] == 0.0


def test_regression_store_replay_resilient_fixes():
    store = RegressionStore()
    cases = store.list_cases()
    case_id = cases[0].id

    # Running resilient agent against the previously failing regression case
    res = store.replay_case(case_id, runner_agent_name="resilient")
    assert res["status"] == "FIXED"
    assert res["pass_rate"] == 1.0


def test_regression_replay_all_summary():
    store = RegressionStore()
    summary_fragile = store.replay_all(target_agent="fragile")
    assert summary_fragile["total"] >= 1
    assert summary_fragile["still_failing"] >= 1
    assert summary_fragile["fixed"] == 0

    summary_resilient = store.replay_all(target_agent="resilient")
    assert summary_resilient["fixed"] >= 1
    assert summary_resilient["still_failing"] == 0
