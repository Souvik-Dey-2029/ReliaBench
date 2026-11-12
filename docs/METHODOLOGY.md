# ReliaBench Evaluation Methodology

## 1. Principles of Agent Reliability
A single successful execution on an undisturbed system is not an indicator of production reliability. ReliaBench formalizes reliability as performance consistency across identical trials under controlled stochastic disruptions.

## 2. Precondition Chains
Each step in a challenge pack defines a strict `requires` precondition linked to the observation of prior steps. If an agent hallucinates tool inputs, skips intermediate steps, or accepts corrupted state, the precondition evaluates false, halting the trial under `PLANNING_DEVIATION`.

## 3. Failure Taxonomy Priority
When an execution fails, failure root causes are classified using deterministic priority:
1. `TIMEOUT`: Execution exceeded allotted wall-clock limit.
2. `PLANNING_DEVIATION`: Agent broke plan precondition chain.
3. `VERIFIER_MISMATCH`: Final outcome failed task validators.
4. `RECOVERY_EXHAUSTED`: Agent attempted retries but ran out of budget.
5. `TOOL_CONTRACT` / `MODEL_OUTAGE` / `INSTRUCTION_CONFLICT`: Specific fault payload caused unhandled termination.
6. `UNKNOWN`: Unclassified exception.
