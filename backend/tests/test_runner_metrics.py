from app.agents.reference import ReferenceToolAgent
from app.benchmarks.pack import load_pack_from_file
from app.faults.engine import FaultConfig, FaultKind
from app.services.runner import ReliabilityRunner


def test_contrast_fragile_vs_resilient():
    pack = load_pack_from_file("benchmark_tasks/packs/flaky_test_triage.yaml")
    fault = FaultConfig(
        kind=FaultKind.TOOL_ERROR,
        at_step=3,
        tool="update_quarantine_config",
        probability=1.0,
    )

    # Fragile run with seed 42
    runner_fragile = ReliabilityRunner(seed=42)
    fragile_agent = ReferenceToolAgent(profile="fragile")
    sc_fragile = runner_fragile.run_pack(pack, fragile_agent, k=3, fault=fault, agent_name="fragile")

    assert sc_fragile.pass_rate == 0.0
    assert sc_fragile.pass_at_k == 0.0
    assert sc_fragile.pass_pow_k == 0.0
    assert sc_fragile.taxonomy_counts == {"TOOL_CONTRACT": 3}
    assert sc_fragile.recovery_rate == 0.0

    # Resilient run with seed 42
    runner_resilient = ReliabilityRunner(seed=42)
    resilient_agent = ReferenceToolAgent(profile="resilient")
    sc_resilient = runner_resilient.run_pack(pack, resilient_agent, k=3, fault=fault, agent_name="resilient")

    assert sc_resilient.pass_rate == 1.0
    assert sc_resilient.pass_at_k == 1.0
    assert sc_resilient.pass_pow_k == 1.0
    assert sc_resilient.recovery_rate == 1.0
    assert len(sc_resilient.taxonomy_counts) == 0


def test_pass_pow_k_invariant_and_wilson():
    pack = load_pack_from_file("benchmark_tasks/packs/flaky_test_triage.yaml")
    runner = ReliabilityRunner(seed=42)
    agent = ReferenceToolAgent(profile="resilient")
    sc = runner.run_pack(pack, agent, k=5)

    assert sc.pass_pow_k <= sc.pass_at_k
    assert sc.wilson_lower <= sc.pass_rate <= sc.wilson_upper


def test_atif_trajectory_shape():
    pack = load_pack_from_file("benchmark_tasks/packs/flaky_test_triage.yaml")
    runner = ReliabilityRunner(seed=42)
    agent = ReferenceToolAgent(profile="resilient")
    sc = runner.run_pack(pack, agent, k=1)

    trial = sc.trial_results[0]
    atif = runner.to_atif_trajectory(trial, "resilient", pack)

    assert atif["schema_version"] == "1.8"
    assert "agent" in atif
    assert atif["agent"]["name"] == "resilient"
    assert len(atif["steps"]) >= 4  # step 0 (user) + 3 steps
    assert atif["steps"][0]["source"] == "user"
    assert atif["steps"][1]["source"] == "agent"
    assert "tool_calls" in atif["steps"][1]
    assert "observation" in atif["steps"][1]
