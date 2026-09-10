"""SQLAlchemy Models for Rainfall Ingestion, Observations, and Nowcast Grids."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Float, Integer, Enum as SQLEnum, JSON, Index
from sqlalchemy.dialects.postgresql import UUID
from app.database.base import Base, TimestampMixin
from app.core.enums import DataHealthStatus, OperationMode


class RainfallObservation(Base, TimestampMixin):
    """Point-based rainfall telemetry records from rain gauges or validated sensor feeds."""
    __tablename__ = "rainfall_observations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    station_id = Column(String(50), nullable=False, index=True)
    station_name = Column(String(150), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    observation_time = Column(DateTime(timezone=True), nullable=False, index=True)
    rainfall_intensity_mm_hr = Column(Float, nullable=False)  # mm/h rate
    accumulated_rainfall_mm = Column(Float, nullable=False)   # 24h/storm accumulation
    source = Column(String(100), nullable=False)              # e.g., 'IMD_AWS_BARASAT', 'SIMULATION_EVENT'
    quality_status = Column(SQLEnum(DataHealthStatus), nullable=False, default=DataHealthStatus.LIVE)
    data_mode = Column(SQLEnum(OperationMode), nullable=False, default=OperationMode.SIMULATION)
    raw_payload = Column(JSON, nullable=True)

    __table_args__ = (
        Index("idx_rainfall_station_time", "station_id", "observation_time"),
    )


class NowcastRun(Base, TimestampMixin):
    """Metadata record of an executed 0–180min short-term nowcast generation."""
    __tablename__ = "rainfall_nowcast_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    generated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    forecast_horizon_min = Column(Integer, default=180)
    source = Column(String(100), nullable=False)
    method = Column(String(100), nullable=False)  # e.g. 'LAGRANGIAN_EXTRAPOLATION_OPTICAL_FLOW'
    data_mode = Column(SQLEnum(OperationMode), nullable=False, default=OperationMode.SIMULATION)
    mean_advection_u = Column(Float, default=0.0)  # U wind / storm motion component (m/s or grid px/min)
    mean_advection_v = Column(Float, default=0.0)  # V wind / storm motion component
    total_grid_cells = Column(Integer, default=0)
    provenance_hash = Column(String(64), nullable=True)


class NowcastTimestepEntry(Base, TimestampMixin):
    """Timestep slice entry within a nowcast run."""
    __tablename__ = "rainfall_nowcast_timesteps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    timestep_min = Column(Integer, nullable=False)  # 0, 15, 30, 45, 60, 90, 120, 150, 180
    valid_time = Column(DateTime(timezone=True), nullable=False, index=True)
    avg_intensity_mm_hr = Column(Float, nullable=False)
    peak_intensity_mm_hr = Column(Float, nullable=False)
    confidence = Column(String(20), default="HIGH")  # 'HIGH', 'MEDIUM', 'LOW'
    spatial_summary = Column(JSON, nullable=True)     # GeoJSON or multi-point spatial array
