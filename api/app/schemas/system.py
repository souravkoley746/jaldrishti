"""Pydantic Schemas for System Information and Municipal Configuration."""

from typing import List
from pydantic import BaseModel, Field
from app.core.enums import OperationMode


class MunicipalityInfo(BaseModel):
    name: str = "Barasat Municipality"
    code: str = "BARASAT_WB"
    state: str = "West Bengal"
    country: str = "India"
    center_coordinates: List[float] = Field(default=[22.7214, 88.4821], description="[lat, lon]")
    bounding_box: List[float] = Field(
        default=[88.4350, 22.6850, 88.5250, 22.7600],
        description="[min_lon, min_lat, max_lon, max_lat] in EPSG:4326"
    )
    total_wards: int = 35
    projected_crs: str = "EPSG:32645"


class PipelineCapabilities(BaseModel):
    nowcasting_enabled: bool = True
    coupled_1d_2d_simulation: bool = True
    ml_surrogate_acceleration: bool = True
    emergency_safe_routing: bool = True
    provenance_tracking: bool = True
    historical_replay: bool = True


class SystemInfoResponse(BaseModel):
    project_name: str
    version: str
    description: str
    environment: str
    mode: OperationMode
    municipality: MunicipalityInfo
    capabilities: PipelineCapabilities
    supported_forecast_horizons_min: List[int] = [0, 15, 30, 45, 60, 90, 120, 180]
