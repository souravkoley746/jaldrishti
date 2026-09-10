"""System-wide domain Enums for JALDRISHTI."""

from enum import Enum


class OperationMode(str, Enum):
    """System-wide operational execution modes."""
    LIVE = "LIVE"
    SIMULATION = "SIMULATION"
    HISTORICAL = "HISTORICAL"


class DataHealthStatus(str, Enum):
    """Data stream validity and freshness states."""
    LIVE = "LIVE"
    STALE = "STALE"
    DEGRADED = "DEGRADED"
    DATA_UNAVAILABLE = "DATA_UNAVAILABLE"
    INVALID = "INVALID"


class ModelHealthStatus(str, Enum):
    """Scientific model operational states."""
    HEALTHY = "HEALTHY"
    DEGRADED = "DEGRADED"
    CALCULATING = "CALCULATING"
    SURROGATE_OFFLINE = "SURROGATE_OFFLINE"
    FAILED = "FAILED"


class SystemHealthStatus(str, Enum):
    """Overall API and infrastructure health status."""
    HEALTHY = "HEALTHY"
    DEGRADED = "DEGRADED"
    UNHEALTHY = "UNHEALTHY"


class FloodRiskLevel(str, Enum):
    """Street and cell level flood hazard classifications."""
    SAFE = "SAFE"            # < 5 cm
    CAUTION = "CAUTION"      # 5 - 15 cm
    HIGH = "HIGH"            # 15 - 30 cm
    CRITICAL = "CRITICAL"    # > 30 cm
    CLOSED = "CLOSED"        # Impassable / Submerged


class ConfidenceLevel(str, Enum):
    """System confidence scores derived from data freshness, completeness, and model validation."""
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    UNKNOWN = "UNKNOWN"


class FactorImpactLevel(str, Enum):
    """Relative causal impact weight of a physical factor."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class VehicleType(str, Enum):
    """Emergency and municipal vehicle mobility profiles."""
    AMBULANCE = "AMBULANCE"
    FIRE_ENGINE = "FIRE_ENGINE"
    POLICE = "POLICE"
    BUS = "BUS"
    CAR = "CAR"
    TWO_WHEELER = "TWO_WHEELER"
    PEDESTRIAN = "PEDESTRIAN"


class DrainageNodeStatus(str, Enum):
    """Hydraulic state of underground drainage nodes."""
    NORMAL = "NORMAL"
    STRESSED = "STRESSED"        # 60% - 90% capacity
    SURCHARGED = "SURCHARGED"    # > 90% / Spilling onto street
    UNKNOWN = "UNKNOWN"
