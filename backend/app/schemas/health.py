"""Pydantic Schemas for System, Data, and Model Health Endpoints."""

from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from app.core.enums import (
    DataHealthStatus,
    ModelHealthStatus,
    OperationMode,
    SystemHealthStatus,
)


class BaseResponse(BaseModel):
    """Standardized API response wrapper."""
    success: bool = True
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    mode: OperationMode = OperationMode.LIVE


class DatabaseHealth(BaseModel):
    status: str
    connected: bool
    latency_ms: Optional[float] = None


class RedisHealth(BaseModel):
    status: str
    connected: bool


class HealthResponse(BaseModel):
    status: SystemHealthStatus
    version: str
    timestamp: datetime
    mode: OperationMode
    database: DatabaseHealth
    redis: RedisHealth
    uptime_seconds: float


class DataSourceStatus(BaseModel):
    source_name: str
    status: DataHealthStatus
    last_observation_time: Optional[datetime] = None
    last_ingestion_time: Optional[datetime] = None
    expected_update_interval_sec: int
    quality_score: float = Field(default=1.0, ge=0.0, le=1.0)
    details: Optional[str] = None


class DataHealthResponse(BaseModel):
    overall_status: DataHealthStatus
    timestamp: datetime
    mode: OperationMode
    sources: List[DataSourceStatus]
    stale_count: int
    unavailable_count: int


class SubModelStatus(BaseModel):
    component: str
    status: ModelHealthStatus
    last_run_timestamp: Optional[datetime] = None
    execution_time_ms: Optional[int] = None
    version: str
    error_message: Optional[str] = None


class ModelHealthResponse(BaseModel):
    overall_status: ModelHealthStatus
    timestamp: datetime
    active_model_version: str
    forecast_horizon_min: int = 180
    timestep_interval_min: int = 15
    models: List[SubModelStatus]
