import pytest
from app.evaluation.metrics import ReliabilityMetricsCalculator

def test_pass_rate_calculation():
    # 3 successes out of 4 trials
    assert ReliabilityMetricsCalculator.calculate_pass_rate(3, 4) == 0.75
    # 0 total trials should return None (unavailable, not 0.0)
    assert ReliabilityMetricsCalculator.calculate_pass_rate(0, 0) is None
    # 0 successes out of 5 is a valid 0.0
    assert ReliabilityMetricsCalculator.calculate_pass_rate(0, 5) == 0.0

def test_wilson_confidence_interval():
    # 10 successes out of 10 trials
    ci = ReliabilityMetricsCalculator.calculate_wilson_confidence_interval(10, 10)
    assert ci is not None
    assert ci["lower"] > 0.65
    assert ci["upper"] == 1.0

    # 0 trials returns None
    assert ReliabilityMetricsCalculator.calculate_wilson_confidence_interval(0, 0) is None

    # 5 out of 10
    ci_half = ReliabilityMetricsCalculator.calculate_wilson_confidence_interval(5, 10)
    assert ci_half is not None
    assert ci_half["lower"] < 0.5 < ci_half["upper"]

def test_pass_at_k_unbiased_estimator():
    # If 3 out of 3 trials succeed, pass@1 should be 1.0, pass@3 should be 1.0
    assert ReliabilityMetricsCalculator.calculate_pass_at_k(n=3, c=3, k=1) == 1.0
    assert ReliabilityMetricsCalculator.calculate_pass_at_k(n=3, c=3, k=3) == 1.0

    # If 0 out of 3 trials succeed, pass@k is 0.0
    assert ReliabilityMetricsCalculator.calculate_pass_at_k(n=3, c=0, k=1) == 0.0

    # If insufficient samples (n < k), returns None
    assert ReliabilityMetricsCalculator.calculate_pass_at_k(n=2, c=2, k=3) is None

    # If 1 out of 3 succeed:
    # 1 - comb(3-1, 1) / comb(3, 1) = 1 - 2/3 = 1/3 ~ 0.3333
    val = ReliabilityMetricsCalculator.calculate_pass_at_k(n=3, c=1, k=1)
    assert val is not None
    assert abs(val - 0.3333) < 0.01

def test_pass_to_k():
    # All k must succeed
    assert ReliabilityMetricsCalculator.calculate_pass_to_k(n=3, c=3, k=3) == 1.0
    # If only 2 out of 3 pass, pass^3 is 0.0
    assert ReliabilityMetricsCalculator.calculate_pass_to_k(n=3, c=2, k=3) == 0.0
    # Insufficient samples returns None
    assert ReliabilityMetricsCalculator.calculate_pass_to_k(n=2, c=2, k=3) is None

def test_recovery_rate():
    # 2 recoveries out of 3 injected failures
    assert ReliabilityMetricsCalculator.calculate_recovery_rate(2, 3) == 0.6667
    # No failures injected should return None (not 0.0)
    assert ReliabilityMetricsCalculator.calculate_recovery_rate(0, 0) is None

def test_duration_metrics():
    durations = [10.0, 20.0, 30.0]
    metrics = ReliabilityMetricsCalculator.calculate_duration_metrics(durations)
    assert metrics["avg_duration"] == 20.0
    assert metrics["median_duration"] == 20.0
    assert metrics["min"] == 10.0
    assert metrics["max"] == 30.0
    assert metrics["variance"] == 100.0  # sample variance of [10, 20, 30]
    assert metrics["samples"] == 3
