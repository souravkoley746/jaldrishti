"""Multivariate Confidence Assessment Engine for Flood Predictions."""

from typing import Dict, Any, Optional
from datetime import datetime, timezone, timedelta
from app.core.enums import ConfidenceLevel, DataHealthStatus, ModelHealthStatus
from app.explainability.schemas import ConfidenceAssessmentBreakdown


class ConfidenceEngine:
    """
    Evaluates prediction confidence across four fundamental pillars:
    1. Data Freshness (Age of telemetry / radar feeds)
    2. Input Completeness (Availability of rainfall, DEM, drainage parameters)
    3. Model Health (Numerical stability, surrogate inference status)
    4. Historical Performance (Validated benchmark IoU / F1 score in current basin)
    """

    # Pillar Weights in Composite Score
    WEIGHT_FRESHNESS = 0.30
    WEIGHT_COMPLETENESS = 0.25
    WEIGHT_MODEL_HEALTH = 0.25
    WEIGHT_HISTORICAL_PERF = 0.20

    @classmethod
    def evaluate_confidence(
        cls,
        telemetry_timestamp: Optional[datetime] = None,
        data_health: DataHealthStatus = DataHealthStatus.LIVE,
        model_health: ModelHealthStatus = ModelHealthStatus.HEALTHY,
        missing_features_count: int = 0,
        total_features_count: int = 10,
        historical_iou: float = 0.865,
    ) -> ConfidenceAssessmentBreakdown:
        details: Dict[str, str] = {}

        # 1. Evaluate Data Freshness (0.0 to 1.0)
        now = datetime.now(timezone.utc)
        if telemetry_timestamp:
            if telemetry_timestamp.tzinfo is None:
                telemetry_timestamp = telemetry_timestamp.replace(tzinfo=timezone.utc)
            age_seconds = (now - telemetry_timestamp).total_seconds()
            if age_seconds <= 300:  # <= 5 min
                freshness_score = 1.0
                details["freshness"] = f"Real-time live telemetry ({int(age_seconds)}s old)"
            elif age_seconds <= 900:  # <= 15 min
                freshness_score = 0.85
                details["freshness"] = f"Slightly delayed telemetry ({int(age_seconds/60)}m old)"
            elif age_seconds <= 1800:  # <= 30 min
                freshness_score = 0.60
                details["freshness"] = f"Aging telemetry ({int(age_seconds/60)}m old)"
            else:
                freshness_score = 0.20
                details["freshness"] = f"Stale telemetry ({int(age_seconds/60)}m old)"
        else:
            if data_health == DataHealthStatus.LIVE:
                freshness_score = 0.95
                details["freshness"] = "Live synthetic/simulation telemetry"
            elif data_health == DataHealthStatus.STALE:
                freshness_score = 0.40
                details["freshness"] = "Stale feed flag present"
            elif data_health == DataHealthStatus.DATA_UNAVAILABLE:
                freshness_score = 0.0
                details["freshness"] = "Data unavailable"
            else:
                freshness_score = 0.50
                details["freshness"] = f"Data health status: {data_health.value}"

        # 2. Evaluate Input Completeness (0.0 to 1.0)
        valid_features = max(0, total_features_count - missing_features_count)
        completeness_score = valid_features / max(1, total_features_count)
        details["completeness"] = f"{valid_features}/{total_features_count} hydro-terrain parameters available"

        # 3. Evaluate Model Health (0.0 to 1.0)
        if model_health == ModelHealthStatus.HEALTHY:
            model_score = 1.0
            details["model_health"] = "Coupled 1D/2D Saint-Venant + ML surrogate converged"
        elif model_health == ModelHealthStatus.DEGRADED:
            model_score = 0.60
            details["model_health"] = "Surrogate operating with fallback boundary approximation"
        elif model_health == ModelHealthStatus.SURROGATE_OFFLINE:
            model_score = 0.40
            details["model_health"] = "Pure empirical Manning/Rational fallback active"
        else:
            model_score = 0.10
            details["model_health"] = f"Model health degraded ({model_health.value})"

        # 4. Evaluate Historical Performance (0.0 to 1.0)
        if historical_iou >= 0.85:
            perf_score = 1.0
            details["historical_performance"] = f"High validated benchmark spatial IoU: {historical_iou:.3f}"
        elif historical_iou >= 0.70:
            perf_score = 0.75
            details["historical_performance"] = f"Moderate benchmark spatial IoU: {historical_iou:.3f}"
        elif historical_iou >= 0.50:
            perf_score = 0.50
            details["historical_performance"] = f"Low benchmark spatial IoU: {historical_iou:.3f}"
        else:
            perf_score = 0.25
            details["historical_performance"] = "Uncalibrated catchment zone"

        # Composite Weighted Calculation
        overall_score = (
            cls.WEIGHT_FRESHNESS * freshness_score
            + cls.WEIGHT_COMPLETENESS * completeness_score
            + cls.WEIGHT_MODEL_HEALTH * model_score
            + cls.WEIGHT_HISTORICAL_PERF * perf_score
        )
        overall_score = round(max(0.0, min(1.0, overall_score)), 3)

        # Map to ConfidenceLevel Enum
        if data_health == DataHealthStatus.DATA_UNAVAILABLE or completeness_score < 0.3:
            confidence_level = ConfidenceLevel.UNKNOWN
        elif overall_score >= 0.80:
            confidence_level = ConfidenceLevel.HIGH
        elif overall_score >= 0.55:
            confidence_level = ConfidenceLevel.MEDIUM
        else:
            confidence_level = ConfidenceLevel.LOW

        return ConfidenceAssessmentBreakdown(
            overall_confidence=confidence_level,
            overall_score=overall_score,
            data_freshness_score=round(freshness_score, 2),
            input_completeness_score=round(completeness_score, 2),
            model_health_score=round(model_score, 2),
            historical_performance_score=round(perf_score, 2),
            details=details,
        )


confidence_engine = ConfidenceEngine()
