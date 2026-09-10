"""Health and Diagnostics API Endpoints."""

from fastapi import APIRouter, status
from app.schemas.health import (
    DataHealthResponse,
    HealthResponse,
    ModelHealthResponse,
)
from app.services.health_service import HealthService

router = APIRouter(tags=["Health & Diagnostics"])


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Check general API, Database, and Cache health status",
)
async def get_system_health() -> HealthResponse:
    """Returns the live status of the API service, PostgreSQL/PostGIS connection, and Redis cache."""
    return await HealthService.get_system_health()


@router.get(
    "/data-health",
    response_model=DataHealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Check status and freshness of ingested telemetry data feeds",
)
async def get_data_health() -> DataHealthResponse:
    """Returns freshness, quality score, and explicit health states (LIVE, STALE, DATA_UNAVAILABLE)
    for IMD Radar, AWS Rain Gauges, Municipal Drains, and DEM data."""
    return await HealthService.get_data_health()


@router.get(
    "/model-health",
    response_model=ModelHealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Check execution status of 0-3h Nowcaster, Hydrology, Hydraulics & ML Surrogates",
)
async def get_model_health() -> ModelHealthResponse:
    """Returns operational diagnostics and execution latencies for the physical and ML flood forecasting components."""
    return await HealthService.get_model_health()
