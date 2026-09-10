"""Rainfall and Nowcasting API Endpoints."""

from typing import Optional
from fastapi import APIRouter, Query, status
from app.core.enums import OperationMode
from app.rainfall.schemas import (
    CurrentRainfallResponse,
    RainfallForecastResponse,
    RainfallHistoryResponse,
)
from app.rainfall.service import rainfall_service

router = APIRouter(prefix="/rainfall", tags=["Rainfall & Nowcasting"])


@router.get(
    "/current",
    response_model=CurrentRainfallResponse,
    status_code=status.HTTP_200_OK,
    summary="Get verified current rainfall observations across Barasat telemetry stations",
)
async def get_current_rainfall(
    mode: Optional[OperationMode] = Query(
        default=None,
        description="Execution mode: LIVE, SIMULATION, or HISTORICAL",
    ),
) -> CurrentRainfallResponse:
    """Returns current rainfall intensity (mm/h) and 24h accumulation across Barasat stations with QC flags."""
    return await rainfall_service.get_current_rainfall(mode=mode)


@router.get(
    "/history",
    response_model=RainfallHistoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get temporal rainfall history and hyetograph data",
)
async def get_rainfall_history(
    station_id: Optional[str] = Query(default=None, description="Filter by specific station ID"),
    hours_back: int = Query(default=6, ge=1, le=72, description="Number of historical hours to query"),
    mode: Optional[OperationMode] = Query(default=None, description="Execution mode"),
) -> RainfallHistoryResponse:
    """Returns time-series precipitation observations for storm hydrograph generation."""
    return await rainfall_service.get_rainfall_history(
        station_id=station_id,
        hours_back=hours_back,
        mode=mode,
    )


@router.get(
    "/forecast",
    response_model=RainfallForecastResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate 0–180 minute rainfall nowcast at 15-minute intervals",
)
async def get_rainfall_forecast(
    mode: Optional[OperationMode] = Query(
        default=None,
        description="Execution mode: LIVE, SIMULATION, or HISTORICAL",
    ),
    base_intensity: Optional[float] = Query(
        default=None,
        ge=0.0,
        le=350.0,
        description="Optional override base rainfall intensity (mm/h) for scenario simulation",
    ),
) -> RainfallForecastResponse:
    """Generates Lagrangian advection nowcast outputs across standard intervals (0, 15, 30, 45, 60, 90, 120, 150, 180 min)."""
    return await rainfall_service.generate_0_to_180_min_nowcast(
        mode=mode,
        base_intensity=base_intensity,
    )
