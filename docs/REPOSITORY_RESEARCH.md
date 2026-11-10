# REPOSITORY RESEARCH AND ARCHITECTURAL ANALYSIS
**Platform**: Reliabench (Global AI Hackathon | PS02: AI Agent Benchmarking Platform)
**Tagline**: "Same tasks. Same conditions. Measurable agent reliability."

---

## 1. Primary Execution Foundation: Harbor (v0.25.0)
- **Repository**: `https://github.com/harbor-framework/harbor`
- **Pinned Version**: `v0.25.0` (Release commit `fdba28f`)
- **License**: MIT License
- **Purpose**: Agent execution engine, isolated task environments, containerized trial execution, verifier test runners, and standardized trajectory formats.
- **Key Concepts Analyzed**:
  - **Task Specification**: Encapsulated scenario defining `instruction.md`, `task.toml`, sandbox specifications (e.g., Dockerfile), and verification scripts (`tests/test.sh` returning reward scores to `/logs/verifier/reward.txt` or `reward.json`).
  - **Trials**: A trial is an atomic, isolated execution of a specific agent on a specific task.
  - **CLI Architecture**: Executed primarily via `harbor run -p <task_path> -a <agent> -m <model>`. Results and step metrics are viewable via `harbor view jobs`.
  - **ATIF (Agent Trajectory Interchange Format)**: Standardized trajectory JSON format (`ATIF-v1.8`). Captures ordered interaction steps (`user`, `agent`, `system`), reasoning tokens, tool calls, environment observations, token usage, and latency.
- **Reliabench Integration Strategy**:
  - Build a clean `HarborAdapter` interface with subprocess execution under strictly controlled argument arrays (no shell-string interpolation).
  - Implement environment and dependency validation: Check CLI existence, version compatibility (`v0.25.0`), and Docker daemon health.
  - When Harbor or Docker is unavailable (e.g., in developer workstations without Docker Desktop or when uninstalled), seamlessly switch to **DEMO MODE / Simulator Adapter** with transparent UI badges indicating execution mode.
  - Parse Harbor's native ATIF format (`trajectory.json`) and reward outputs into normalized Reliabench trial records.

---

## 2. Agent Evaluation and Product Reference: AgentClash
- **Repository**: `https://github.com/agentclash/agentclash`
- **License**: Apache 2.0 / MIT
- **Key Concepts Analyzed**:
  - **Challenge Pack**: Standardized YAML/JSON workload specifications defining prompts, edge cases, sandboxed tool primitives, and evaluation rubrics.
  - **Apples-to-Apples Evaluation**: Running identical tasks and constraints against multiple agents.
  - **Failure Taxonomy**: Classifying failures into categories (Tool Error, Timeout, Malformed Payload, Constraint Violation, Hallucination, Provider Failure).
  - **Regression Gates & Replay**: Step-by-step trace replay and comparison against established baseline runs.
- **Reliabench Integration Strategy**:
  - Adopt the Challenge Pack concept for Reliabench's Task Library.
  - Reimplement failure taxonomy and regression evaluation natively in Python without dragging in external Node-based runtime dependencies.

---

## 3. Model Gateway: Bifrost
- **Repository**: `https://github.com/maximhq/bifrost`
- **License**: Apache 2.0
- **Key Concepts Analyzed**:
  - High-performance Go-based OpenAI-compatible LLM gateway with microsecond overhead (<200µs).
  - Telemetry capture: Exact token counts (prompt, completion, cached), latency breakdowns, cost attribution, and provider status.
- **Reliabench Integration Strategy**:
  - Build an optional `BifrostAdapter`.
  - Bifrost is **optional** in the first working milestone.
  - Maintain clear telemetry distinction: Model Gateway latency measures API transit/generation time, while Task Wall-Clock Duration measures overall agent execution time.

---

## 4. Evaluation Reference: Opik
- **Repository**: `https://github.com/comet-ml/opik`
- **License**: Apache 2.0
- **Key Concepts Analyzed**:
  - Experiment hierarchies (Datasets -> Experiments -> Trials -> Traces).
  - Evaluation metric math: Strict mathematical handling of repetitions, pass probabilities, confidence intervals, and categorical breakdown.
- **Reliabench Integration Strategy**:
  - Reimplement core evaluation math in our backend `evaluation/metrics.py` (Pass Rate, Pass@k, Pass^k, Recovery Rate, Consistency index).

---

## 5. Trace and Observability Reference: Langfuse
- **Repository**: `https://github.com/langfuse/langfuse`
- **License**: MIT / FSL
- **Key Concepts Analyzed**:
  - Hierarchical trace inspector: Root Trace -> Steps/Spans -> Tool Calls -> Observation Payloads.
  - Timeline/waterfall presentation with event filtering (user, agent, tool, error, duration).
- **Reliabench Integration Strategy**:
  - Build an ATIF-compatible Trace Inspector in the Neo-Brutalist frontend using waterfall/timeline step navigation, payload JSON inspection, and duration/token metrics.

---

## 6. What Is Reused vs. Independently Implemented

| Component | Source / Reference | Implementation Strategy |
|---|---|---|
| Execution Engine & Sandboxing | Harbor v0.25.0 | Subprocess-based Adapter wrapping Harbor CLI when present; Simulator fallback |
| Trajectory Format | Harbor ATIF v1.8 specification | Native Python Pydantic parser & schema normalizer |
| Task Library Design | AgentClash Challenge Packs | YAML/JSON Task models with verification definitions |
| Failure Taxonomy | AgentClash / Empirical Agent Reliability | Native failure injector and classification engine |
| Metrics Engine | Opik & HumanEval Pass@k definitions | Native statistical Python module |
| UI Design System | Custom Vibrant Neo-Brutalism | Tailwind CSS + Lucide + Recharts custom theme |
| Monorepo Architecture | Clean FastAPI + Vite/React | Completely custom, modular, zero unnecessary bloat |

