from __future__ import annotations

from enum import Enum
from typing import Dict, Optional
from pydantic import BaseModel


class TaxonomyCategory(str, Enum):
    TIMEOUT = "TIMEOUT"
    PLANNING_DEVIATION = "PLANNING_DEVIATION"
    VERIFIER_MISMATCH = "VERIFIER_MISMATCH"
    RECOVERY_EXHAUSTED = "RECOVERY_EXHAUSTED"
    TOOL_CONTRACT = "TOOL_CONTRACT"
    MODEL_OUTAGE = "MODEL_OUTAGE"
    INSTRUCTION_CONFLICT = "INSTRUCTION_CONFLICT"
    UNKNOWN = "UNKNOWN"


TAXONOMY_HINTS: Dict[TaxonomyCategory, str] = {
    TaxonomyCategory.TIMEOUT: "Increase step time limit or add asynchronous streaming to long-running tools.",
    TaxonomyCategory.PLANNING_DEVIATION: "Ensure step preconditions ('requires') are verified before advancing execution plans.",
    TaxonomyCategory.VERIFIER_MISMATCH: "Validate final agent output against expected verifiers before declaring completion.",
    TaxonomyCategory.RECOVERY_EXHAUSTED: "Configure retry limits (>0) and exponential backoff to handle transient flakiness.",
    TaxonomyCategory.TOOL_CONTRACT: "Enforce strict schema validation and error-handling wrapping around external tool calls.",
    TaxonomyCategory.MODEL_OUTAGE: "Enable multi-provider fallback routing (e.g. via Bifrost Gateway) for 5xx model errors.",
    TaxonomyCategory.INSTRUCTION_CONFLICT: "Implement system prompt guardrails to isolate and disregard prompt injections.",
    TaxonomyCategory.UNKNOWN: "Inspect trace logs for unhandled exceptions or environment discrepancies.",
}


class TaxonomyClassifier:
    """Classifies trial failures according to strict evaluation priority:

    TIMEOUT > PLANNING_DEVIATION > VERIFIER_MISMATCH > RECOVERY_EXHAUSTED > fault-specific > UNKNOWN
    """

    @classmethod
    def classify(
        cls,
        timed_out: bool = False,
        planning_deviation: bool = False,
        verifier_mismatch: bool = False,
        retried: bool = False,
        fault_kind: Optional[str] = None,
        error_message: Optional[str] = None,
    ) -> TaxonomyCategory:
        if timed_out:
            return TaxonomyCategory.TIMEOUT

        if planning_deviation:
            return TaxonomyCategory.PLANNING_DEVIATION

        if verifier_mismatch:
            return TaxonomyCategory.VERIFIER_MISMATCH

        if retried:
            return TaxonomyCategory.RECOVERY_EXHAUSTED

        if fault_kind:
            fk = fault_kind.upper()
            if "MODEL" in fk or "PROVIDER" in fk or "OUTAGE" in fk:
                return TaxonomyCategory.MODEL_OUTAGE
            if "INSTRUCTION" in fk or "PROMPT" in fk or "MISLEAD" in fk:
                return TaxonomyCategory.INSTRUCTION_CONFLICT
            if "TOOL" in fk or "TIMEOUT" in fk or "CONTRACT" in fk:
                return TaxonomyCategory.TOOL_CONTRACT

        if error_message:
            msg = error_message.upper()
            if "TIMEOUT" in msg:
                return TaxonomyCategory.TIMEOUT
            if "MODEL" in msg or "503" in msg or "502" in msg:
                return TaxonomyCategory.MODEL_OUTAGE
            if "INSTRUCTION" in msg or "ADVERSARIAL" in msg:
                return TaxonomyCategory.INSTRUCTION_CONFLICT
            if "TOOL" in msg or "CONTRACT" in msg:
                return TaxonomyCategory.TOOL_CONTRACT

        return TaxonomyCategory.UNKNOWN

    @classmethod
    def get_remediation_hint(cls, category: TaxonomyCategory | str) -> str:
        if isinstance(category, str):
            try:
                category = TaxonomyCategory(category)
            except ValueError:
                return TAXONOMY_HINTS[TaxonomyCategory.UNKNOWN]
        return TAXONOMY_HINTS.get(category, TAXONOMY_HINTS[TaxonomyCategory.UNKNOWN])
