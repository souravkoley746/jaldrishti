"""SQLAlchemy Models for System Auditing, Health Logs, and Configuration."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Float, Integer, Boolean, JSON, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from app.database.base import Base, TimestampMixin
from app.core.enums import DataHealthStatus, ModelHealthStatus, OperationMode


class SystemAuditLog(Base, TimestampMixin):
    """Stores system events, startup records, and execution audits."""
    __tablename__ = "system_audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type = Column(String(50), nullable=False, index=True)
    component = Column(String(100), nullable=False)
    message = Column(String(500), nullable=False)
    payload = Column(JSON, nullable=True)
    severity = Column(String(20), default="INFO")


class DataSourceTelemetry(Base, TimestampMixin):
    """Tracks real-time telemetry freshness for radar, rain gauges, and municipal feeds."""
    __tablename__ = "data_source_telemetry"

    id = Column(String(50), primary_key=True)  # e.g., 'IMD_RADAR_KOLKATA', 'AWS_BARASAT_01'
    source_name = Column(String(150), nullable=False)
    status = Column(SQLEnum(DataHealthStatus), nullable=False, default=DataHealthStatus.LIVE)
    last_observation_time = Column(DateTime(timezone=True), nullable=True)
    last_ingestion_time = Column(DateTime(timezone=True), nullable=True)
    expected_interval_seconds = Column(Integer, default=600)
    quality_score = Column(Float, default=1.0)
    metadata_info = Column(JSON, nullable=True)
