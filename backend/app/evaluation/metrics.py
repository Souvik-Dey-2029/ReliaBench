import math
from typing import List, Optional, Dict, Any

class ReliabilityMetricsCalculator:
    """
    Standardized mathematical evaluation engine for Reliabench.
    Calculates Pass Rate, Pass@k, Pass^k, Recovery Rate, and Execution Variance.
    """

    @staticmethod
    def calculate_pass_rate(successes: int, total_valid_trials: int) -> float:
        """
        Pass Rate: Successful task executions divided by total valid executions.
        Returns 0.0 if total_valid_trials == 0.
        """
        if total_valid_trials <= 0:
            return 0.0
        return round(float(successes) / float(total_valid_trials), 4)

    @staticmethod
    def calculate_pass_at_k(n: int, c: int, k: int) -> float:
        """
        Pass@k: Probability that at least one of k independent attempts succeeds.
        Uses unbiased estimator: 1 - comb(n - c, k) / comb(n, k)
        where n = total trials, c = successful trials, k = sample size evaluated.
        Falls back to empirical check if k == n: 1.0 if c > 0 else 0.0.
        """
        if n <= 0 or k <= 0 or k > n:
            return 1.0 if c > 0 else 0.0

        if n - c < k:
            return 1.0

        try:
            # comb(n-c, k) / comb(n, k)
            comb_fail = math.comb(n - c, k)
            comb_total = math.comb(n, k)
            prob_all_fail = comb_fail / comb_total
            return round(1.0 - prob_all_fail, 4)
        except Exception:
            return 1.0 if c > 0 else 0.0

    @staticmethod
    def calculate_pass_to_k(n: int, c: int, k: int) -> float:
        """
        Pass^k: The fraction/probability that all k attempts succeed.
        For observed repeated trials: 1.0 if c == n (all trials pass), else 0.0.
        Or statistically: comb(c, k) / comb(n, k)
        """
        if n <= 0 or k <= 0 or k > n:
            return 1.0 if (c == n and n > 0) else 0.0

        if c < k:
            return 0.0

        try:
            comb_succ = math.comb(c, k)
            comb_total = math.comb(n, k)
            return round(comb_succ / comb_total, 4)
        except Exception:
            return 1.0 if c == n else 0.0

    @staticmethod
    def calculate_recovery_rate(recoveries: int, total_injected_failures: int) -> Optional[float]:
        """
        Recovery Rate: Proportion of injected-failure executions that recover and complete successfully.
        Returns None if no failures were injected (distinguishes unavailable from zero).
        """
        if total_injected_failures <= 0:
            return None
        return round(float(recoveries) / float(total_injected_failures), 4)

    @staticmethod
    def calculate_duration_metrics(durations: List[float]) -> Dict[str, float]:
        """
        Calculates mean duration and sample variance across repeated trials.
        """
        if not durations:
            return {"avg_duration": 0.0, "variance": 0.0, "min": 0.0, "max": 0.0}

        count = len(durations)
        mean_val = sum(durations) / count

        if count > 1:
            variance_val = sum((x - mean_val) ** 2 for x in durations) / (count - 1)
        else:
            variance_val = 0.0

        return {
            "avg_duration": round(mean_val, 2),
            "variance": round(variance_val, 4),
            "min": round(min(durations), 2),
            "max": round(max(durations), 2)
        }

