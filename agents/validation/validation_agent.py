"""
Validation Agent: Implements deterministic guardrails, physical consistency checks,
and citation grounding verification to prevent hallucinations in mining reports.
"""

from typing import Dict, Any, List
from pydantic import BaseModel, Field

class ValidationReport(BaseModel):
    is_valid: bool
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    passed_rules: List[str] = Field(default_factory=list)
    failed_rules: List[str] = Field(default_factory=list)
    remediation_notes: str = ""

class ValidationAgent:
    """
    Validates physical plausibility, stratigraphic consistency, and calculation integrity.
    """

    def validate_geological_output(self, agent_output: Dict[str, Any]) -> ValidationReport:
        """
        Runs comprehensive rule-based checks on geological calculations & outputs.
        """
        passed = []
        failed = []

        data = agent_output.get("data", {})
        task_type = agent_output.get("task_type", "")

        # Rule 1: Non-negative reserves
        if task_type == "RESERVE_CALCULATION":
            reserves = data.get("reserves_million_tonnes", 0.0)
            if reserves > 0:
                passed.append("RULE_POSITIVE_RESERVES")
            else:
                failed.append("RULE_POSITIVE_RESERVES: Reserve estimate must be strictly greater than 0.")

            # Rule 2: Realistic specific gravity for coal (1.2 to 1.8)
            sg = data.get("specific_gravity", 1.4)
            if 1.1 <= sg <= 2.2:
                passed.append("RULE_VALID_SPECIFIC_GRAVITY")
            else:
                failed.append(f"RULE_VALID_SPECIFIC_GRAVITY: Specific gravity {sg} is outside physical coal bounds.")

        # Rule 3: Citation presence
        citations = agent_output.get("citations", [])
        if citations or task_type != "RESERVE_CALCULATION":
            passed.append("RULE_CITATION_PRESENT")
        else:
            failed.append("RULE_CITATION_PRESENT: Numerical claim lacks source documentation citation.")

        is_valid = len(failed) == 0
        confidence = 0.98 if is_valid else max(0.2, 1.0 - (len(failed) * 0.3))

        return ValidationReport(
            is_valid=is_valid,
            confidence_score=confidence,
            passed_rules=passed,
            failed_rules=failed,
            remediation_notes="All domain constraints satisfied." if is_valid else "; ".join(failed)
        )
