# RELIABENCH EVALUATION METHODOLOGY SPECIFICATION

## 1. Primary Objectives
Standard evaluation benchmarks judge AI agents on whether they successfully finish a task on a single lucky attempt. Reliabench rejects this framing:
**A system is not autonomous if it only succeeds under immaculate conditions.**

Reliabench measures:
1. **Repeatability**: Does the agent succeed across repeated trials under invariant instructions and seeds?
2. **Resilience**: How does the agent react when an environment or tool fault is actively injected?
3. **Statistical Uncertainty**: Explicitly reporting confidence intervals and trial counts ($n$) rather than inflated precision.

---

## 2. Core Mathematical Formulations

### 2.1 Pass Rate
$$\text{PassRate} = \frac{\sum_{i=1}^{n} s_i}{n}$$
Where:
- $n$: Total completed valid trials.
- $s_i \in \{0, 1\}$: Verifier assertion reward for trial $i$.
- Returns `None`/`null` when $n = 0$ to prevent confusing unavailable data with failure ($0.0$).

### 2.2 Wilson Score Confidence Interval (95%)
To prevent misleading precision on small sample sizes (e.g. $k=3$ or $k=5$), Reliabench calculates the asymmetric Wilson score interval:
$$w = \frac{\hat{p} + \frac{z^2}{2n} \pm z \sqrt{\frac{\hat{p}(1-\hat{p})}{n} + \frac{z^2}{4n^2}}}{1 + \frac{z^2}{n}}$$
Where $z = 1.95996$ (for $\alpha = 0.05$). Lower and upper bounds are strictly clamped to $[0, 1]$.

### 2.3 Pass@k (Unbiased Hypergeometric Estimator)
$$\text{Pass@k} = 1 - \frac{\binom{n - c}{k}}{\binom{n}{k}}$$
Where:
- $n$: Total completed trials ($n \ge k$).
- $c$: Observed successful trials.
- $k$: Evaluated budget attempt count.
Estimates the probability that at least one of $k$ sampled runs succeeds without optimistic replacement bias.

### 2.4 Pass^k (Strict Joint Reliability)
$$\text{Pass}^k = \left(\frac{c}{n}\right)^k$$
Estimates the joint probability that **all $k$ attempts succeed consecutively**. Essential for automated CI/CD gating and production deployment gates.

### 2.5 Fault Recovery Rate
$$\text{RecoveryRate} = \frac{\text{Trials recovering after injected fault}}{\text{Total trials with active fault injection}}$$
A trial is categorized as recovered **only if**:
1. The fault vector was successfully injected at its target trigger point.
2. The agent detected the failure and adapted its action loop.
3. The final task verifier passed with reward $1.0$.

---

## 3. Provenance & Execution Integrity
- **Real Execution**: Executed via Harbor CLI inside hardware-isolated Docker containers with real LLM providers.
- **Simulator Mode**: Deterministic simulation for local development and offline environments without Docker.
- **Data Partitioning**: The platform strictly marks each trial with `source_mode` (`REAL_EXECUTION` vs `SIMULATOR`). Synthetic data cannot contaminate verified execution metrics.

