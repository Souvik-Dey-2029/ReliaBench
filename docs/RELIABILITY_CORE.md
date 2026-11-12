# ReliaBench Reliability Core Architecture & Specifications

## Overview
ReliaBench evaluates AI agents under non-deterministic environmental realities. Rather than reporting optimistic single-run pass rates, ReliaBench benchmarks repeatable task completion across $k$ trials and measures resilience against injected faults.

## Mathematical Formulations

### 1. Pass Rate & Wilson 95% Score Interval
$$\hat{p} = \frac{\sum_{i=1}^k c_i}{k}$$

The Wilson score confidence interval handles small sample sizes ($k \le 10$) without exceeding $[0, 1]$ boundaries:
$$w = \frac{\hat{p} + \frac{z^2}{2k} \pm z \sqrt{\frac{\hat{p}(1-\hat{p})}{k} + \frac{z^2}{4k^2}}}{1 + \frac{z^2}{k}}, \quad z = 1.95996$$

### 2. Pass@k vs Pass^k
- **$Pass@k$**: Probability that at least one of $k$ independent attempts succeeds:
  $$Pass@k = 1 - \frac{\binom{n-c}{k}}{\binom{n}{k}}$$
- **$Pass^k$** (tau-bench formulation): Fraction/probability of runs where all $k$ consecutive trials succeed without fault breakdown:
  $$Pass^k = \frac{\binom{c}{k}}{\binom{n}{k}} \le Pass@k$$

### 3. Recovery Rate
$$\text{Recovery Rate} = \frac{\text{Recovered Trials after Fault Injection}}{\text{Total Injected Faults}}$$

## Deterministic Fault Injection Engine
All fault injection decisions follow:
$$\text{Decision} = \text{PRNG}\left(\text{seed} \parallel \text{step\_index} \parallel \text{tool} \parallel \text{fault\_kind}\right) \le \text{probability}$$

This guarantees exact reproducibility between local CLI runs, CI automation, and frontend replays.
