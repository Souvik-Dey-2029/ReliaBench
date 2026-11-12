from app.evaluation.taxonomy import (
    TaxonomyCategory,
    TaxonomyClassifier,
)


def test_taxonomy_priority_order():
    # TIMEOUT wins over planning deviation
    cat = TaxonomyClassifier.classify(
        timed_out=True,
        planning_deviation=True,
        fault_kind="TOOL_ERROR",
    )
    assert cat == TaxonomyCategory.TIMEOUT

    # PLANNING_DEVIATION wins over verifier mismatch and fault
    cat = TaxonomyClassifier.classify(
        timed_out=False,
        planning_deviation=True,
        verifier_mismatch=True,
        fault_kind="TOOL_ERROR",
    )
    assert cat == TaxonomyCategory.PLANNING_DEVIATION

    # VERIFIER_MISMATCH wins over recovery exhausted
    cat = TaxonomyClassifier.classify(
        timed_out=False,
        planning_deviation=False,
        verifier_mismatch=True,
        retried=True,
    )
    assert cat == TaxonomyCategory.VERIFIER_MISMATCH

    # RECOVERY_EXHAUSTED wins over raw fault code
    cat = TaxonomyClassifier.classify(
        retried=True,
        fault_kind="TOOL_ERROR",
    )
    assert cat == TaxonomyCategory.RECOVERY_EXHAUSTED


def test_taxonomy_fault_specific_mapping():
    assert (
        TaxonomyClassifier.classify(fault_kind="TOOL_ERROR")
        == TaxonomyCategory.TOOL_CONTRACT
    )
    assert (
        TaxonomyClassifier.classify(fault_kind="MODEL_UNAVAILABLE")
        == TaxonomyCategory.MODEL_OUTAGE
    )
    assert (
        TaxonomyClassifier.classify(fault_kind="MISLEADING_INSTRUCTION")
        == TaxonomyCategory.INSTRUCTION_CONFLICT
    )


def test_remediation_hints():
    hint = TaxonomyClassifier.get_remediation_hint(TaxonomyCategory.TOOL_CONTRACT)
    assert "schema validation" in hint.lower() or "tool" in hint.lower()

    hint_mo = TaxonomyClassifier.get_remediation_hint(TaxonomyCategory.MODEL_OUTAGE)
    assert "fallback" in hint_mo.lower() or "bifrost" in hint_mo.lower()
