# RELIABENCH INTEGRATION STATUS MATRIX

This document continuously tracks the operational readiness and verification state of external dependencies and integration adapters.

| Adapter / Component | Status | Required Version | Verified Interface | Fallback Mode |
|---|---|---|---|---|
| **Harbor Execution Adapter** | `DEMO/SIMULATOR READY` | `v0.25.0` | CLI Subprocess (`harbor run -p <task> -a <agent>`) | Simulator Adapter with deterministic ATIF trajectories |
| **Docker Sandbox** | `UNAVAILABLE (HOST)` | Any standard daemon | Local named pipe / socket | In-memory simulated execution container |
| **ATIF Trajectory Normalizer** | `ACTIVE` | `ATIF-v1.8` | JSON Specification Parser & Renderer | Fully compatible |
| **Bifrost Gateway** | `PENDING / OPTIONAL` | Latest | OpenAI API endpoint proxy | Pass-through / Direct provider mock |
| **SQLite Storage** | `ACTIVE` | Built-in | SQLAlchemy ORM | Default local relational storage |
| **Local Artifact Storage** | `ACTIVE` | OS Filesystem | `artifacts/{trajectories,logs,reports}` | File-based persistence |

---

### Harbor Adapter Diagnostic Notes
- When `harbor` CLI is found in `$PATH` and Docker daemon is running, Reliabench issues sandboxed `harbor run` executions.
- When `harbor` is not installed or Docker is not active, Reliabench activates the **Simulator Runner**, which creates realistic, mathematically consistent execution trials, failure injections, recoveries, and ATIF v1.8 trajectory artifacts. The UI prominently displays the badge **`SIMULATOR MODE`** so users and evaluators never mistake synthetic runs for hardware-isolated container runs.

