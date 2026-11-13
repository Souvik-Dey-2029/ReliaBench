# Reliabench — End-to-End Acceptance Validation Report

**Date:** 2026-11-13  
**Status:** Validated & Verified  
**Test Suite:** Automated + API Integration Acceptance  

---

## 1. Acceptance Test A — Normal Execution Pipeline

**Objective:** Register an agent, select a benchmark task, execute trials, capture model/tool telemetry, verify outcome, and persist ATIF trajectories.

- **Agent:** Reference Tool Agent (`profile=resilient`) / Custom Registered Agent
- **Benchmark Task:** `tool_recovery_challenges` / `web_research_tavily`
- **Execution Mode:** `DETERMINISTIC_HARNESS` / `SIMULATOR` (Harbor fallback)
- **Model Telemetry:** `ModelRequestEvent` captured with prompt/completion tokens, latency (ms), and correlation ID (`corr_{exp}_{trial}`).
- **Tool Telemetry:** `ToolEvent` captured with tool name, arguments, observation, duration, and status.
- **Trajectory:** Emitted valid `ATIF-v1.8` trajectory JSON to `artifacts/trajectories/`.
- **Verifier:** Deterministic script assertion verified exit code 0.
- **Outcome:** **PASSED** (100% verified against database records).

---

## 2. Acceptance Test B — Controlled Failure Injection & Scientific Recovery

**Objective:** Inject systemic fault (`TOOL_ERROR` / `HTTP_429_RATE_LIMIT`), observe agent response, verify recovery criterion, and calculate Recovery Rate.

- **Injected Fault:** `TOOL_ERROR` at Step 2 (`run_shell_command`).
- **Observed Behavior:**
  - Fragile agent profile crashed on fault observation -> Classified as `TOOL_CONTRACT` failure -> Recovery Rate: 0.0%
  - Resilient agent profile intercepted fault, engaged fallback tool (`write_file`), and continued to verifier -> Classified as `RECOVERED` -> Recovery Rate: 100.0%
- **Scientific Recovery Verification:**
  - Fault executed: YES
  - Execution continued: YES
  - Final verifier passed: YES
- **Outcome:** **PASSED** (`test_fragile_agent_fails_under_tool_error`, `test_resilient_agent_recovers_under_tool_error`).

---

## 3. Acceptance Test C — Multi-Trial Statistical Reliability

**Objective:** Execute repeated independent trials ($k = 3, 5$), compute Wilson score 95% confidence intervals, finite-sample $Pass@k$, $Pass^k$, and latency percentiles.

- **Repetitions ($k$):** 3 and 5 independent trials.
- **Metrics Calculated:**
  - Pass Rate ($\hat{p} = s/n$)
  - Wilson 95% Confidence Interval: Asymmetric bounds strictly in $[0.0, 1.0]$.
  - Pass@k ($1 - \binom{n-s}{k} / \binom{n}{k}$): Evaluated with $n \ge k$.
  - Pass^k ($\binom{s}{k} / \binom{n}{k}$): Exact finite-sample estimator.
  - Duration Metrics: Mean, Median (P50), P90, P95, and Sample Variance.
  - Cost per Success: Measured USD / successful tasks.
- **Outcome:** **PASSED** (`test_metrics.py`, `test_metrics_extended.py`).

---

## 4. Acceptance Test D — Agent Comparison Engine

**Objective:** Compare two agents across identical benchmark tasks and fault conditions, validating equivalence guards.

- **Compared Profiles:** Fragile Baseline vs. Resilient Fallback.
- **Equivalence Guardrails:**
  - Same Task Version: Validated.
  - Same Repetition Count ($k$): Validated.
  - Same Fault Severity: Validated.
- **Side-by-Side Results:**
  - Pass Rate: Fragile (0.0%) vs Resilient (100.0%)
  - Recovery Rate: Fragile (0.0%) vs Resilient (100.0%)
  - Remediation Hint: Suggested automated retry with exponential backoff.
- **Outcome:** **PASSED** (`test_runner_metrics.py`, `test_taxonomy.py`).
