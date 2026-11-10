import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "adapters" in data
    assert "harbor" in data["adapters"]

def test_dashboard_summary():
    res = client.get("/api/v1/dashboard/summary")
    assert res.status_code == 200
    data = res.json()
    assert data["total_agents"] >= 1
    assert data["total_benchmarks"] >= 1
    assert "overall_pass_rate" in data

def test_agents_crud():
    # 1. Create agent
    payload = {
        "name": "Integration-Test-Agent",
        "description": "Agent created during automated verification",
        "framework": "custom",
        "version": "1.0.0",
        "adapter_type": "simulator",
        "model_provider": "anthropic",
        "model_name": "claude-3-7-sonnet"
    }
    create_res = client.post("/api/v1/agents", json=payload)
    assert create_res.status_code == 201
    created = create_res.json()
    agent_id = created["id"]
    assert created["name"] == "Integration-Test-Agent"

    # 2. Get agent
    get_res = client.get(f"/api/v1/agents/{agent_id}")
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Integration-Test-Agent"

    # 3. Delete agent
    del_res = client.delete(f"/api/v1/agents/{agent_id}")
    assert del_res.status_code == 200

def test_benchmarks_list():
    res = client.get("/api/v1/benchmarks")
    assert res.status_code == 200
    assert len(res.json()) >= 1

def test_failures_list():
    res = client.get("/api/v1/failures")
    assert res.status_code == 200
    assert len(res.json()) >= 1

