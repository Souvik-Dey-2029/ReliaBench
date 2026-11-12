import pytest
from app.adapters.harbor.adapter import HarborAdapter


def test_harbor_build_command_safety():
    adapter = HarborAdapter(bin_path="harbor", required_version="v0.25.0")
    # Verify arguments are passed as a list, preventing shell injection
    malicious_task = "task; rm -rf /"
    cmd = adapter.build_run_command(malicious_task, "agent_1", "gpt-4o")

    assert isinstance(cmd, list)
    assert cmd == ["harbor", "run", "-p", malicious_task, "-a", "agent_1", "-m", "gpt-4o"]
    assert "rm -rf" not in " ".join(cmd[:3])


def test_harbor_unavailable_raises_and_never_fakes_real_execution():
    adapter = HarborAdapter(bin_path="nonexistent_harbor_cli_bin_xyz")
    status = adapter.check_availability()
    assert status["available"] is False
    assert status["mode"] == "SIMULATOR_FALLBACK"

    with pytest.raises(RuntimeError) as exc_info:
        adapter.run_pack("task_1", "agent_1")
    assert "Harbor or Docker unavailable" in str(exc_info.value)
