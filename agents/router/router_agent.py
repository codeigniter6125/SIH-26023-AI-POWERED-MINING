"""
Router Agent: Analyzes user prompts and classifies query intent to determine
the optimal multi-agent execution path.
"""

from typing import Dict, Any, Literal
from pydantic import BaseModel, Field

IntentType = Literal[
    "FACTUAL_RETRIEVAL",
    "RESERVE_CALCULATION",
    "STRATIGRAPHIC_CORRELATION",
    "REPORT_GENERATION",
    "GENERAL_QUERY"
]

class RoutingDecision(BaseModel):
    intent: IntentType
    confidence: float
    target_agents: list[str]
    parameters: Dict[str, Any] = Field(default_factory=dict)
    reasoning: str

class RouterAgent:
    """
    Classifies queries and routes to Core Geological Agent,
    Calculation Tools, or Report Studio.
    """

    def __init__(self, model_name: str = "gemini-1.5-flash"):
        self.model_name = model_name

    def route(self, user_query: str) -> RoutingDecision:
        """
        Analyzes query keywords, entities, and context to determine intent.
        """
        query_lower = user_query.lower()

        if any(term in query_lower for term in ["reserve", "tonnage", "gcv", "grade", "stripping ratio", "calculate"]):
            return RoutingDecision(
                intent="RESERVE_CALCULATION",
                confidence=0.92,
                target_agents=["CoreGeologicalAgent", "ValidationAgent"],
                parameters={"query": user_query},
                reasoning="Query requires quantitative mining formulas or coal grade classifications."
            )
        elif any(term in query_lower for term in ["report", "generate brief", "cmpdi format", "parliamentary"]):
            return RoutingDecision(
                intent="REPORT_GENERATION",
                confidence=0.95,
                target_agents=["CoreGeologicalAgent", "ValidationAgent", "ReportGenerator"],
                parameters={"query": user_query},
                reasoning="Query requests structured statutory report or official inquiry synthesis."
            )
        elif any(term in query_lower for term in ["borehole", "seam", "correlation", "depth", "lithology", "strata"]):
            return RoutingDecision(
                intent="STRATIGRAPHIC_CORRELATION",
                confidence=0.88,
                target_agents=["CoreGeologicalAgent", "ValidationAgent"],
                parameters={"query": user_query},
                reasoning="Query targets borehole logs, stratigraphic correlation, or seam thickness continuity."
            )
        else:
            return RoutingDecision(
                intent="FACTUAL_RETRIEVAL",
                confidence=0.85,
                target_agents=["CoreGeologicalAgent"],
                parameters={"query": user_query},
                reasoning="Default retrieval path using hybrid vector and document search."
            )
