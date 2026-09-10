"""Meteorological Quality Control and Ingestion Validation."""

from datetime import datetime, timezone, timedelta
from typing import Tuple, Dict, Any
from app.core.enums import DataHealthStatus


class MeteorologicalQualityControl:
    """Rigorous meteorological verification tests for ground and radar inputs."""

    # Physical meteorological bounds for tropical urban storm events
    MAX_PLAUSIBLE_INTENSITY_MM_HR = 350.0  # Max recorded cloudburst / extreme convection rate
    MAX_PLAUSIBLE_ACCUMULATION_MM = 1200.0
    STALE_THRESHOLD_SECONDS = 1800         # 30 mins

    @classmethod
    def validate_observation(
        cls,
        intensity: float,
        accumulation: float,
        timestamp: datetime,
        lat: float,
        lon: float,
    ) -> Tuple[DataHealthStatus, str]:
        """Validates physical plausibility, coordinates, and observation freshness."""
        now = datetime.now(timezone.utc)

        # 1. Coordinate check within Greater Kolkata / Barasat region
        if not (22.5 <= lat <= 23.0 and 88.3 <= lon <= 88.7):
            return DataHealthStatus.INVALID, "Spatial coordinates outside Barasat meteorological domain"

        # 2. Non-negative checks
        if intensity < 0.0 or accumulation < 0.0:
            return DataHealthStatus.INVALID, "Negative precipitation values are physically impossible"

        # 3. Physical upper boundary limit
        if intensity > cls.MAX_PLAUSIBLE_INTENSITY_MM_HR:
            return DataHealthStatus.INVALID, f"Rainfall rate {intensity} mm/h exceeds physical limit of {cls.MAX_PLAUSIBLE_INTENSITY_MM_HR} mm/h"

        if accumulation > cls.MAX_PLAUSIBLE_ACCUMULATION_MM:
            return DataHealthStatus.INVALID, "Accumulation exceeds physical limits"

        # 4. Freshness check
        if timestamp.tzinfo is None:
            timestamp = timestamp.replace(tzinfo=timezone.utc)

        time_delta = (now - timestamp).total_seconds()
        if time_delta > cls.STALE_THRESHOLD_SECONDS:
            return DataHealthStatus.STALE, f"Telemetry record is {int(time_delta/60)} minutes old"

        return DataHealthStatus.LIVE, "Passed all meteorological QC checks"
