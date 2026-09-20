"""
Multi-Agent Orchestrator: Coordinates the execution pipeline:
User Query -> Router Agent -> Core Geological Agent -> Validation Agent -> Validated Output
"""

import sys
import os
from pathlib import Path

# Add project root to sys.path for direct script execution
project_root = str(Path(__file__).resolve().parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from typing import Dict, Any
from agents.router.router_agent import RouterAgent
from agents.core.core_agent import CoreGeologicalAgent
from agents.validation.validation_agent import ValidationAgent

class MultiAgentOrchestrator:
    def __init__(self):
        self.router = RouterAgent()
        self.core_agent = CoreGeologicalAgent()
        self.validation_agent = ValidationAgent()

    def handle_query(self, user_query: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        End-to-end multi-agent processing pipeline.
        """
        # Step 1: Route query
        routing = self.router.route(user_query)
        
        # Step 2: Core processing
        core_output = self.core_agent.process(
            task_type=routing.intent,
            query=user_query,
            context=context
        )

        # Step 3: Validate output
        val_report = self.validation_agent.validate_geological_output(core_output)

        return {
            "query": user_query,
            "routing_decision": routing.model_dump(),
            "core_output": core_output,
            "validation": val_report.model_dump(),
            "final_answer": core_output.get("narrative", ""),
            "is_verified": val_report.is_valid
        }

if __name__ == "__main__":
    orchestrator = MultiAgentOrchestrator()
    sample_query = "Calculate geological coal reserve for Block A with area 500,000 sq m and seam thickness 4.5 m."
    result = orchestrator.handle_query(sample_query, {"area_sq_m": 500000.0, "thickness_m": 4.5})
    print("Multi-Agent Pipeline Test:")
    print(f"Intent: {result['routing_decision']['intent']}")
    print(f"Answer: {result['final_answer']}")
    print(f"Validated: {result['is_verified']} (Confidence: {result['validation']['confidence_score']})")
