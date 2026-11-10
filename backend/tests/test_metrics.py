import pytest
from app.evaluation.metrics import ReliabilityMetricsCalculator

def test_pass_rate_calculation():
    # 3 successes out of 4 trials
    assert ReliabilityMetricsCalculator.calculate_pass_rate(3, 4) == 0.75
    # 0 total trials
    assert ReliabilityMetricsCalculator.calculate_pass_rate(0, 0) == 0.0
    # 0 successes out of 5
    assert ReliabilityMetricsCalculator.calculate_pass_rate(0, 5) == 0.0

def test_pass_at_k_unbiased_estimator():
    # If 3 out of 3 trials succeed, pass@1 should be 1.0, pass@3 should be 1.0
    assert ReliabilityMetricsCalculator.calculate_pass_at_k(n=3, c=3, k=1) == 1.0
    assert ReliabilityMetricsCalculator.calculate_pass_at_k(n=3, c=3, k=3) == 1.0

    # If 0 out of 3 trials succeed, pass@k is 0.0
    assert ReliabilityMetricsCalculator.calculate_pass_at_k(n=3, c=0, k=1) == 0.0

    # If 1 out of 3 succeed:
    # 1 - comb(3-1, 1) / comb(3, 1) = 1 - 2/3 = 1/3 ~ 0.3333
    val = ReliabilityMetricsCalculator.calculate_pass_at_k(n=3, c=1, k=1)
    assert abs(val - 0.3333) < 0.01

def test_pass_to_k():
    # All k must succeed
    assert ReliabilityMetricsCalculator.calculate_pass_to_k(n=3, c=3, k=3) == 1.0
    # If only 2 out of 3 pass, pass^3 is 0.0
    assert ReliabilityMetricsCalculator.calculate_pass_to_k(n=3, c=2, k=3) == 0.0

def test_recovery_rate():
    # 2 recoveries out of 3 injected failures
    assert ReliabilityMetricsCalculator.calculate_recovery_rate(2, 3) == 0.6667
    # No failures injected should return None (not 0.0)
    assert ReliabilityMetricsCalculator.calculate_recovery_rate(0, 0) is None

def test_duration_metrics():
    durations = [10.0, 20.0, 30.0]
    metrics = ReliabilityMetricsCalculator.calculate_duration_metrics(durations)
    assert metrics["avg_duration"] == 20.0
    assert metrics["min"] == 10.0
    assert metrics["max"] == 30.0
    assert metrics["variance"] == 100.0  # sample variance of [10, 20, 30]

