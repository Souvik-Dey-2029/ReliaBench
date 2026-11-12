## Summary of Changes

This pull request introduces the complete **Deterministic Reliability Core** for ReliaBench, addressing problem statement PS02 ("Build a Benchmarking Platform for AI Agents, Not Just Models").

### 1. Challenge Packs with Precondition Chains (`benchmark_tasks/packs/`)
- Implemented 6 multi-step challenge packs (`flaky_test_triage`, `rate_limit_backoff`, `config_migration`, `django_csrf_patch`, `pandas_aggregation`, `sql_model_refactor`).
- Introduced step-level `requires` preconditions: if prior intermediate steps are unmet or skipped, runs deterministically fail under `PLANNING_DEVIATION`.

### 2. Zero-Randomness Seeded Fault Engine (`backend/app/faults/`)
- Deterministic fault selection keyed on `(seed, step_index, tool, fault_kind)`.
- Injects `TOOL_ERROR`, `TOOL_TIMEOUT`, `MODEL_UNAVAILABLE`, and `MISLEADING_INSTRUCTION`.
- The exact same seed reproduces identical failing steps on demand.

### 3. Mathematical Evaluation & Metrics (`backend/app/evaluation/`)
- **Pass Rate** with **Wilson 95% Score Confidence Intervals** ($[lower, upper]$).
- **Pass@k** (probability $\ge 1$ attempt succeeds) and **Pass^k** (probability all $k$ consecutive runs succeed), strictly maintaining $Pass^k \le Pass@k$.
- **Recovery Rate** measuring self-healing under fault.

### 4. Hierarchical Failure Taxonomy & Remediation Hints
- Deterministic priority ordering: `TIMEOUT` > `PLANNING_DEVIATION` > `VERIFIER_MISMATCH` > `RECOVERY_EXHAUSTED` > fault-specific > `UNKNOWN`.
- Automated remediation hints attached to every failed trial.

### 5. Harbor & Bifrost Integrations (`backend/app/adapters/`)
- Subprocess argument array runner for Harbor v0.25.0 (`harbor run`) preventing shell injection.
- BifrostClient with per-call token, cost ($USD), latency, and fallback attribution.
- Honest provenance badges: `REAL_EXECUTION`, `DETERMINISTIC_HARNESS`, and `SIMULATOR (SYNTHETIC)`.

### 6. Regression Gates Store & CI Replay (`backend/app/services/regression.py`)
- Promotes failing trials into permanent regression gates.
- Individual and bulk replay reporting `FIXED` vs `STILL_FAILING`.

### 7. Full Frontend Suite & Provenance Badging (`frontend/`)
- Challenge Pack library and interactive runner.
- Scorecard with Wilson interval, recovery rate, cost, and tokens.
- ATIF v1.8 Trace Explorer scrubber.
- Regression Gate management page.
- Side-by-side agent comparison matrix with incompatibility warnings.

---

## Verification & Testing

### Backend Tests
```bash
PYTHONPATH=backend python -m pytest backend/tests -v
```
**Result**: 40 passed in 0.8s.

### Frontend Production Build
```bash
cd frontend && npm run build
```
**Result**: Zero TypeScript errors, production bundle compiled cleanly.

### CLI Headline Contrast Verification
```bash
PYTHONPATH=backend python -c "
from app.benchmarks.pack import load_pack_from_file
from app.agents.reference import ReferenceToolAgent
from app.faults.engine import FaultConfig, FaultKind
from app.services.runner import ReliabilityRunner

pack = load_pack_from_file('benchmark_tasks/packs/flaky_test_triage.yaml')
fault = FaultConfig(kind=FaultKind.TOOL_ERROR, at_step=3, tool='update_quarantine_config')

f_sc = ReliabilityRunner(seed=42).run_pack(pack, ReferenceToolAgent('fragile'), k=3, fault=fault)
r_sc = ReliabilityRunner(seed=42).run_pack(pack, ReferenceToolAgent('resilient'), k=3, fault=fault)
print('FRAGILE:', f_sc.pass_rate, f_sc.taxonomy_counts)
print('RESILIENT:', r_sc.pass_rate, r_sc.recovery_rate)
"
```
**Result**:
```text
FRAGILE: 0.0 {'TOOL_CONTRACT': 3}
RESILIENT: 1.0 1.0
```

---

## How to Review in 5 Minutes

1. **Check the contrast test**: Run `pytest backend/tests/test_runner_metrics.py` to see the fragile vs resilient mathematical proof.
2. **Review the fault engine**: Inspect `backend/app/faults/engine.py` to verify deterministic PRNG string seeding.
3. **Verify the taxonomy order**: Inspect `backend/app/evaluation/taxonomy.py` for priority classification logic.
4. **Inspect the UI**: Run `npm run build` inside `frontend/` to confirm strict TypeScript types and check `frontend/src/pages/BenchmarksPage.tsx`.
5. **Walk through the demo**: Read `docs/DEMO_SCRIPT.md` for the exact 90-second workflow.
