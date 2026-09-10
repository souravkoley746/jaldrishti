"""Pydantic Schemas for Rainfall Ingestion, Observations, and 0-3h Nowcast Predictions."""

from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.core.enums import DataHealthStatus, OperationMode


class RainfallStationLocation(BaseModel):
    station_id: str
    station_name: str
    latitude: float
    longitude: float


class RainfallObservationItem(BaseModel):
    id: str
    timestamp: datetime
    location: str
    latitude: float
    longitude: float
    rainfall_intensity: float = Field(..., description="Precipitation rate in mm/hour", ge=0.0)
    accumulated_rainfall: float = Field(..., description="Storm/day accumulated rainfall in mm", ge=0.0)
    source: str
    quality_status: DataHealthStatus
    data_mode: OperationMode
    details: Optional[Dict[str, Any]] = None


class CurrentRainfallResponse(BaseModel):
    timestamp: datetime
    data_mode: OperationMode
    total_active_stations: int
    mean_rainfall_intensity_mm_hr: float
    max_rainfall_intensity_mm_hr: float
    observations: List[RainfallObservationItem]
    radar_available: bool
    radar_status: DataHealthStatus


class RainfallHistoryResponse(BaseModel):
    station_id: Optional[str] = None
    start_time: datetime
    end_time: datetime
    data_mode: OperationMode
    total_records: int
    records: List[RainfallObservationItem]


class NowcastPointForecast(BaseModel):
    generated_at: datetime
    valid_time: datetime
    timestep_minutes: int
    rainfall_intensity: float = Field(..., description="Predicted rainfall intensity in mm/hour", ge=0.0)
    source: str
    method: str
    confidence: str = Field(..., description="Forecast confidence level: HIGH, MEDIUM, LOW")
    data_mode: OperationMode


class SpatialRainfallGridCell(BaseModel):
    cell_id: str
    latitude: float
    longitude: float
    rainfall_intensity: float
    ward_no: Optional[int] = None


class NowcastTimestepSlice(BaseModel):
    timestep_minutes: int
    valid_time: datetime
    mean_intensity_mm_hr: float
    max_intensity_mm_hr: float
    confidence: str
    spatial_grid: Optional[List[SpatialRainfallGridCell]] = None


class RainfallForecastResponse(BaseModel):
    run_id: str
    generated_at: datetime
    forecast_horizon_min: int = 180
    intervals_minutes: List[int] = [0, 15, 30, 45, 60, 90, 120, 150, 180]
    source: str
    method: str
    data_mode: OperationMode
    advection_velocity_kmh: float
    advection_bearing_deg: float
    forecasts: List[NowcastPointForecast]
    timesteps: List[NowcastTimestepSlice]
