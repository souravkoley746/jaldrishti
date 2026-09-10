"""Explainability & Causal Flood Intelligence API Endpoints."""

from typing import Optional
from fastapi import APIRouter, Path, Query, Body, status
from app.core.enums import OperationMode
from app.explainability.schemas import (
    LocationExplanationResponse,
    LocationFeatures,
    RiskThresholdsConfig,
)
from app.explainability.service import explainability_service

router = APIRouter(prefix="/explainability", tags=["Explainable Flood Intelligence"])


@router.get(
    "/location/{location_id}",
    response_model=LocationExplanationResponse,
    status_code=status.HTTP_200_OK,
    summary="Get explainable flood intelligence and causal attribution for a location",
)
async def get_location_explanation(
    location_id: str = Path(..., description="Unique street segment or node identifier (e.g., 'road_102', 'RD-BAR-001')"),
    mode: Optional[OperationMode] = Query(default=None, description="Execution mode: LIVE, SIMULATION, or HISTORICAL"),
) -> LocationExplanationResponse:
    """
    Returns why a specific location is predicted to flood, along with contributing factors,
    impact levels, physical metrics, risk tier, and multivariate confidence.
    """
    return await explainability_service.evaluate_location(
        location_id=location_id,
        custom_features=None,
        data_mode=mode,
    )


@router.post(
    "/evaluate",
    response_model=LocationExplanationResponse,
    status_code=status.HTTP_200_OK,
    summary="Evaluate causal factors for custom hydro-terrain feature vector",
)
async def evaluate_custom_features(
    location_id: str = Query(default="custom_scenario", description="Identifier for the evaluated scenario"),
    features: LocationFeatures = Body(..., description="Complete set of hydrological and physical terrain features"),
    mode: Optional[OperationMode] = Query(default=None, description="Execution mode"),
) -> LocationExplanationResponse:
    """
    Evaluates arbitrary or simulated catchment feature vectors, returning quantitative factor breakdown,
    predicted depth, time to flood, and confidence scores.
    """
    return await explainability_service.evaluate_location(
        location_id=location_id,
        custom_features=features,
        data_mode=mode,
    )


@router.get(
    "/thresholds",
    response_model=RiskThresholdsConfig,
    status_code=status.HTTP_200_OK,
    summary="Get current configurable flood risk thresholds",
)
def get_risk_thresholds() -> RiskThresholdsConfig:
    """Returns the active depth and velocity thresholds for SAFE, CAUTION, HIGH, CRITICAL, and CLOSED tiers."""
    return explainability_service.get_thresholds()


@router.put(
    "/thresholds",
    response_model=RiskThresholdsConfig,
    status_code=status.HTTP_200_OK,
    summary="Update configurable flood risk thresholds",
)
def update_risk_thresholds(
    config: RiskThresholdsConfig = Body(..., description="New depth threshold parameters"),
) -> RiskThresholdsConfig:
    """Updates operational thresholds for flood risk categorization."""
    return explainability_service.set_thresholds(config)
