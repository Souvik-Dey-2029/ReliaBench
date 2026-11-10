# RELIABENCH ARCHITECTURE & SYSTEM DESIGN

## 1. System Overview
Reliabench is a framework-independent benchmarking and reliability platform for autonomous AI agents. Unlike standard single-run leaderboards, Reliabench rigorously assesses reliability through **repeated trials**, **controlled failure injection**, **statistical recovery analysis**, and **evidence-backed trace inspection**.

```
+---------------------------------------------------------------------------------+
|                                 FRONTEND                                        |
|  React 18 + Vite + TypeScript + Tailwind CSS (Vibrant Neo-Brutalism)            |
|                                                                                 |
|  [Dashboard]  [Agents]  [Benchmarks]  [Experiments]  [Traces]  [Comparisons]     |
+---------------------------------------+-----------------------------------------+
                                        | HTTP / JSON REST APIs (/api/v1/*)
                                        v
+---------------------------------------------------------------------------------+
|                                 BACKEND                                         |
|  Python 3.13 + FastAPI + Pydantic v2 + SQLAlchemy + SQLite (PostgreSQL Ready)   |
|                                                                                 |
|  [API Routes]                                                                   |
|    |-- /dashboard, /agents, /benchmarks, /experiments, /runs, /comparisons       |
|                                                                                 |
|  [Core Services]                                                                |
|    |-- ExperimentExecutionManager (Async Background Task Dispatcher)            |
|    |-- ReliabilityEvaluationEngine (Pass@k, Pass^k, Recovery, Variance)         |
|    |-- FailureInjectionService (Timeout, Tool Errors, Corrupt Payload, etc.)    |
|    |-- TraceAndArtifactManager (ATIF v1.8 parser, log files, JSON/CSV exports)  |
|                                                                                 |
|  [Adapters Layer]                                                               |
|    |-- HarborAdapter (CLI / Docker sandbox integration; version: v0.25.0)       |
|    |-- SimulatorAgentAdapter (Deterministic benchmark runner for offline/demo)  |
|    |-- BifrostAdapter (Optional Model Gateway Telemetry connector)              |
+-------------------+-----------------------------------+-------------------------+
                    |                                   |
                    v                                   v
+-----------------------------+       +-------------------------------------------+
|          DATABASE           |       |              ARTIFACT STORAGE             |
|  SQLite (Local development) |       |  artifacts/                               |
|  Relational Schema          |       |    |-- trajectories/ (ATIF JSON files)    |
|  (Agents, Tasks, Runs...)   |       |    |-- logs/ (Raw stdout/stderr/verifier) |
+-----------------------------+       |    |-- reports/ (Exported JSON/CSV)       |
                                      +-------------------------------------------+
```

---

## 2. Key Modules & Responsibilities

### 2.1 Backend Core
- **`app/api/routes`**: Exposes REST endpoints following `/api/v1` conventions.
- **`app/db`**: Database engine, session maker, and declarative base. Uses SQLite locally with standard connection pooling and foreign key constraints enabled.
- **`app/models`**: SQLAlchemy models (`Agent`, `BenchmarkTask`, `Experiment`, `Run`, `Trial`, `FailureScenario`, `MetricResult`).
- **`app/schemas`**: Pydantic input/output schemas with strict validation.
- **`app/services`**: Orchestration logic for experiment lifecycles, demo data seeding, and artifact indexing.
- **`app/evaluation/metrics.py`**: Explicit, mathematically verified evaluation formulas:
  - **Pass Rate**: $\frac{\sum \text{Successes}}{\text{Total Valid Trials}}$
  - **Pass@k**: $1 - \frac{\binom{n - c}{k}}{\binom{n}{k}}$ (unbiased estimator) or observed empirical sample $\frac{\text{tasks with } \ge 1 \text{ success}}{N}$
  - **Pass^k**: $\frac{\text{tasks with all } k \text{ successes}}{N}$
  - **Recovery Rate**: $\frac{\text{Successful recoveries after failure injection}}{\text{Total injected failures}}$
  - **Failure Rate**: $1 - \text{Pass Rate}$
  - **Consistency Index**: Variance of trial durations and outcomes across identical iterations.
- **`app/failure_injection`**: Controlled test vectors (e.g. `TOOL_TIMEOUT`, `TOOL_HTTP_500`, `MALFORMED_JSON`, `CONTEXT_CORRUPTION`).
- **`app/adapters/harbor`**: Subprocess wrapper for Harbor v0.25.0 CLI (`harbor run`) with strict path sanitation, environment verification, exit code tracking, and automatic fallback to Simulator mode when dependencies (Harbor/Docker) are absent.
- **`app/adapters/gateways`**: Optional Bifrost gateway adapter parsing model gateway telemetry.

### 2.2 Frontend Application Shell
- **Aesthetic**: **Vibrant Neo-Brutalism** featuring high contrast, heavy 2px/3px borders (`border-slate-800`), hard offset drop shadows (`shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`), crisp geometric panels, and vibrant semantic highlights:
  - Ink Background: `#111318`
  - Cobalt Blue: `#427BFF` (Actions, Primary accents)
  - Acid Lime: `#D9FF47` (Success, High reliability badges)
  - Coral: `#FF725E` (Failures, Warnings, Injected alerts)
  - Electric Violet: `#7048D9` (Experiments, Metrics)
  - Cyan: `#35D5E8` (Execution traces, Timelines)
  - White: `#F7F8FA`
  - Muted Slate: `#9BA6B8`
- **Features**:
  1. **Dashboard**: High-level telemetry, KPI cards, reliability distribution, recent runs, failure activity, and demo-mode badge.
  2. **Agent Registry**: Register agents, inspect capabilities, framework types, adapter readiness.
  3. **Benchmark Task Library**: Explore standardized challenge tasks, test instructions, and verifier requirements.
  4. **Experiment Manager**: Configure repeated runs ($k$ iterations), select failure injection scenarios, trigger background executions, view real-time state.
  5. **Trace Explorer**: ATIF-compliant waterfall and step-by-step inspector for agent reasoning, tool invocations, observations, and error payloads.
  6. **Agent Comparisons**: Apples-to-apples side-by-side reliability analysis comparing Pass@k, Pass^k, Recovery Rate, and duration variance.
  7. **Reports & Exports**: Complete structured summaries with raw JSON and CSV downloads.
  8. **Settings & Integration Health**: Real-time diagnostic panel displaying Harbor CLI, Docker daemon, Bifrost gateway, and storage status.

