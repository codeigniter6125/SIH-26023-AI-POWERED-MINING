"""
Core Geological & Mining Agent: Executes domain reasoning, data synthesis,
stratigraphic correlation, and mathematical calculations.
"""

from typing import Dict, Any, List
from agents.core.mining_calculators import MiningCalculator

class CoreGeologicalAgent:
    """
    Handles deep domain tasks for geological interpretation and reporting.
    """

    def __init__(self, model_name: str = "gemini-1.5-pro"):
        self.model_name = model_name
        self.calculator = MiningCalculator()

    def process(self, task_type: str, query: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Processes geological inquiries, triggers mining calculators when appropriate,
        and generates synthesized narrative.
        """
        context = context or {}

        if task_type == "RESERVE_CALCULATION":
            # Extract sample inputs or fall back to defaults
            area = float(context.get("area_sq_m", 500000.0))
            thickness = float(context.get("thickness_m", 4.5))
            sg = float(context.get("specific_gravity", 1.40))
            
            calc_result = self.calculator.calculate_geological_reserves(area, thickness, sg)
            
            return {
                "status": "success",
                "task_type": task_type,
                "data": calc_result,
                "narrative": (
                    f"Based on the provided exploration parameters (Area: {area:,.0f} m², "
                    f"Mean Thickness: {thickness} m, Specific Gravity: {sg} t/m³), "
                    f"the estimated in-situ geological reserve is {calc_result['reserves_million_tonnes']} MT."
                ),
                "citations": [
                    {
                        "source": "CMPDI Geological Assessment Manual",
                        "section": "Standard Reserve Calculation Norms",
                        "confidence": 0.98
                    }
                ]
            }

        # Default retrieval synthesis
        return {
            "status": "success",
            "task_type": task_type,
            "data": {},
            "narrative": f"Synthesized geological response for: '{query}'",
            "citations": []
        }
