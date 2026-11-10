# RELIABENCH API CONTRACT SPECIFICATION (v1)

Base URL: `/api/v1`

---

## 1. System & Diagnostics

### `GET /api/v1/health`
Checks backend responsiveness, database status, and adapter availability.
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "database": "connected",
  "adapters": {
    "harbor": {
      "available": false,
      "installed_version": null,
      "required_version": "v0.25.0",
      "docker_available": false,
      "status": "DEPENDENCY_MISSING",
      "mode": "SIMULATOR_FALLBACK"
    },
    "bifrost": {
      "configured": false,
      "status": "DISABLED"
    }
  }
}
```

### `GET /api/v1/dashboard/summary`
Returns high-level platform KPIs, reliability trends, recent experiments, and failure distribution.
```json
{
  "total_agents": 4,
  "total_benchmarks": 6,
  "total_experiments": 12,
  "overall_pass_rate": 0.742,
  "average_duration_seconds": 18.4,
  "average_cost_usd": 0.0034,
  "recent_experiments": [],
  "recent_failures": [],
  "reliability_distribution": [
    { "category": "Code Gen", "avg_pass_rate": 0.82, "recovery_rate": 0.65 },
    { "category": "Tool Use", "avg_pass_rate": 0.71, "recovery_rate": 0.40 }
  ]
}
```

---

## 2. Agent Registry

- `GET /api/v1/agents`: List all registered agents (supports `?framework=...` filter).
- `POST /api/v1/agents`: Register a new agent.
- `GET /api/v1/agents/{agent_id}`: Retrieve agent details and aggregate reliability score.
- `PUT /api/v1/agents/{agent_id}`: Update agent metadata.
- `DELETE /api/v1/agents/{agent_id}`: Remove agent.

---

## 3. Benchmark Task Library

- `GET /api/v1/benchmarks`: List benchmark tasks.
- `POST /api/v1/benchmarks`: Create a new benchmark task.
- `GET /api/v1/benchmarks/{benchmark_id}`: Get full task specification, instructions, and verification details.

---

## 4. Failure Scenarios

- `GET /api/v1/failures`: List available controlled failure scenarios (`TOOL_TIMEOUT`, `TOOL_HTTP_500`, etc.).

---

## 5. Experiments & Execution Lifecycle

- `GET /api/v1/experiments`: List experiments with pagination.
- `POST /api/v1/experiments`: Create an experiment configuration.
- `GET /api/v1/experiments/{experiment_id}`: Retrieve experiment, runs, and trials.
- `POST /api/v1/experiments/{experiment_id}/start`: Launch background execution (spawns async job).
- `POST /api/v1/experiments/{experiment_id}/cancel`: Cancel active experiment.

---

## 6. Runs & Execution Traces (ATIF)

- `GET /api/v1/runs/{run_id}`: Retrieve detailed trial breakdowns, Pass@k, and recovery rates.
- `GET /api/v1/runs/{run_id}/trajectory`: Retrieve normalized ATIF v1.8 trajectory JSON.
- `GET /api/v1/runs/{run_id}/artifacts`: List artifact paths (stdout, stderr, verifier reward).

---

## 7. Comparisons & Reports

- `GET /api/v1/comparisons?experiment_ids=id1,id2`: Compare two or more runs head-to-head under identical conditions.
- `GET /api/v1/reports/{experiment_id}`: Generate structured export report.
- `GET /api/v1/reports/{experiment_id}/export?format=json|csv`: Download report artifact.

