from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_export_run_json():
    # Fetch an existing run from demo seed
    resp_exp = client.get("/api/v1/experiments")
    assert resp_exp.status_code == 200
    exps = resp_exp.json()
    assert len(exps) > 0
    exp_id = exps[0]["id"]

    resp_single = client.get(f"/api/v1/experiments/{exp_id}")
    run = resp_single.json()["runs"][0]
    run_id = run["id"]

    # Export JSON
    exp_json = client.get(f"/api/v1/runs/{run_id}/export?format=json")
    assert exp_json.status_code == 200
    data = exp_json.json()
    assert data["run_id"] == run_id
    assert "trials" in data
    assert "source_mode" in data


def test_export_run_csv():
    resp_exp = client.get("/api/v1/experiments")
    run_id = resp_exp.json()[0]["runs"][0]["id"]

    exp_csv = client.get(f"/api/v1/runs/{run_id}/export?format=csv")
    assert exp_csv.status_code == 200
    assert exp_csv.headers["content-type"].startswith("text/csv")
    csv_text = exp_csv.text
    assert "run_id,trial_number,status" in csv_text


def test_regression_run_all_summary_endpoint():
    resp = client.post("/api/v1/regressions/run-all?target_agent=fragile")
    assert resp.status_code == 200
    data = resp.json()
    assert "total" in data
    assert "still_failing" in data
    assert "fixed" in data
    assert data["still_failing"] >= 1
