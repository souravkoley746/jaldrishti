"""Agentic AI API Endpoints for JALDRISHTI FastAPI Backend."""

from typing import List, Optional
from fastapi import APIRouter, Query, HTTPException, status
from app.services.agent_decision_engine import (
    HomeSafetyAgent,
    RouteDecisionAgent,
    EmergencyResponseAgent,
    ExplainabilityAgent,
    DataQualityAgent,
    AgentHomeSafetyDecision,
    AgentRouteChoiceDecision,
    AgentEmergencyFacilityDecision,
    AgentDecisionTraceStep,
    DataQualityReport,
)

router = APIRouter()


@router.get("/home-safety", response_model=AgentHomeSafetyDecision)
async def get_home_safety_advisory(
    locality: str = Query(default="Barasat Ward 4"),
    forecast_rainfall: float = Query(default=88.5)
):
    """Evaluates user home area, weather forecast, and commute schedule via HomeSafetyAgent."""
    return HomeSafetyAgent.generate_home_advisory(
        home_locality=locality,
        forecast_rainfall_mm=forecast_rainfall
    )


@router.post("/evaluate-routes", response_model=List[AgentRouteChoiceDecision])
async def evaluate_routes_agentic(
    origin: str = Query(default="Barasat"),
    destination: str = Query(default="Howrah Station"),
    vehicle_type: str = Query(default="CAR")
):
    """Reasons over candidate routes and ranks options considering vehicle clearance constraints."""
    return await RouteDecisionAgent.evaluate_and_rank_routes(
        origin=origin,
        destination=destination,
        vehicle_type=vehicle_type
    )


@router.get("/emergency/medical", response_model=List[AgentEmergencyFacilityDecision])
async def evaluate_medical_emergency():
    """Ranks nearby hospital access corridors using EmergencyResponseAgent."""
    return EmergencyResponseAgent.evaluate_medical_facilities()


@router.get("/trace", response_model=List[AgentDecisionTraceStep])
async def get_agent_decision_trace():
    """Returns step-by-step Agent Decision Trace for Municipal Command Center observability."""
    return ExplainabilityAgent.generate_decision_trace()


@router.get("/data-quality", response_model=DataQualityReport)
async def get_data_quality_report():
    """Evaluates telemetry freshness and sensor quality using DataQualityAgent."""
    return DataQualityAgent.evaluate_telemetry()
