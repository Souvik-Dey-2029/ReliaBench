import math
from typing import List, Optional, Dict, Any, Tuple

class ReliabilityMetricsCalculator:
    """
    Standardized mathematical evaluation engine for Reliabench.
    Calculates Pass Rate, Wilson Score Confidence Intervals, Pass@k, Pass^k,
    Recovery Rate, Mean/Median Duration, and Execution Variance.
    """

    @staticmethod
    def calculate_pass_rate(successes: int, total_valid_trials: int) -> Optional[float]:
        """
        Pass Rate: Successful task executions divided by total valid executions.
        Returns None if total_valid_trials == 0 (distinguishes unavailable from zero).
        """
        if total_valid_trials <= 0:
            return None
        return round(float(successes) / float(total_valid_trials), 4)

    @staticmethod
    def calculate_wilson_confidence_interval(
        successes: int, total_valid_trials: int, confidence: float = 0.95
    ) -> Optional[Dict[str, float]]:
        """
        Wilson score interval for a binomial proportion.
        Handles small sample sizes without exceeding [0, 1] bounds.
        Default 95% confidence level (z ~ 1.95996).
        """
        if total_valid_trials <= 0:
            return None

        z = 1.95996  # 95% two-sided normal quantile
        n = float(total_valid_trials)
        p_hat = float(successes) / n

        denominator = 1.0 + (z**2) / n
        center_adj = p_hat + (z**2) / (2.0 * n)
        margin = z * math.sqrt((p_hat * (1.0 - p_hat) + (z**2) / (4.0 * n)) / n)

        lower = max(0.0, (center_adj - margin) / denominator)
        upper = min(1.0, (center_adj + margin) / denominator)

        return {
            "lower": round(lower, 4),
            "upper": round(upper, 4),
            "confidence": confidence
        }

    @staticmethod
    def calculate_pass_at_k(n: int, c: int, k: int) -> Optional[float]:
        """
        Pass@k: Probability that at least one of k independent attempts succeeds.
        Uses unbiased estimator: 1 - comb(n - c, k) / comb(n, k)
        where n = total trials, c = successful trials, k = sample size evaluated.
        Returns None if insufficient sample size (n < k).
        """
        if n <= 0 or k <= 0 or k > n:
            return None

        if n - c < k:
            return 1.0

        try:
            comb_fail = math.comb(n - c, k)
            comb_total = math.comb(n, k)
            prob_all_fail = comb_fail / comb_total
            return round(1.0 - prob_all_fail, 4)
        except Exception:
            return 1.0 if c > 0 else 0.0

    @staticmethod
    def calculate_pass_to_k(n: int, c: int, k: int) -> Optional[float]:
        """
        Pass^k: The probability/fraction that all k attempts succeed.
        Under independent identically distributed trials: p^k.
        Also calculates exact hypergeometric sample fraction: comb(c, k) / comb(n, k).
        Returns None if n < k.
        """
        if n <= 0 or k <= 0 or k > n:
            return None

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
    def calculate_duration_metrics(durations: List[float]) -> Dict[str, Any]:
        """
        Calculates mean, median, min, max, and sample variance across repeated trials.
        """
        if not durations:
            return {
                "avg_duration": 0.0,
                "median_duration": 0.0,
                "variance": 0.0,
                "min": 0.0,
                "max": 0.0,
                "samples": 0
            }

        count = len(durations)
        mean_val = sum(durations) / count

        # Median calculation
        sorted_d = sorted(durations)
        if count % 2 == 1:
            median_val = sorted_d[count // 2]
        else:
            median_val = (sorted_d[(count // 2) - 1] + sorted_d[count // 2]) / 2.0

        # Sample variance
        if count > 1:
            variance_val = sum((x - mean_val) ** 2 for x in durations) / (count - 1)
        else:
            variance_val = 0.0

        return {
            "avg_duration": round(mean_val, 2),
            "median_duration": round(median_val, 2),
            "variance": round(variance_val, 4),
            "min": round(min(durations), 2),
            "max": round(max(durations), 2),
            "samples": count
        }
