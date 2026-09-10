"""Explainability Business Logic Service."""

from typing import Optional, Dict, Any
from datetime import datetime, timezone
from app.core.config import settings
from app.core.enums import OperationMode, DataHealthStatus, ModelHealthStatus
from app.explainability.schemas import (
    LocationFeatures,
    LocationExplanationResponse,
    RiskThresholdsConfig,
)
from app.explainability.engine import explainability_engine
from app.explainability.risk_classifier import risk_classifier
from app.explainability.confidence_engine import confidence_engine


class ExplainabilityService:
    """Orchestrates physical factor attribution, risk classification, and confidence scoring."""

    # Curated Barasat Road Segments / Node Master Catalog with Pre-calculated Terrain Metrics
    BARASAT_LOCATION_CATALOG: Dict[str, Dict[str, Any]] = {
        "road_102": {
            "name": "Jessore Road - Champadali Bus Stand Junction",
            "ward_no": 4,
            "features": LocationFeatures(
                rainfall_intensity_mm_hr=44.0,
                accumulated_rainfall_mm=71.0,
                terrain_depression_index=0.78,
                elevation_m=8.2,
                slope_percentage=0.25,
                imperviousness_ratio=0.88,
                drain_capacity_utilization=1.15,
                drainage_surcharge=True,
                downstream_congestion=True,
                historical_flood_tendency=0.92,
            ),
        },
        "RD-BAR-001": {
            "name": "Champadali More to Barasat Station Jn (Jessore Rd)",
            "ward_no": 4,
            "features": LocationFeatures(
                rainfall_intensity_mm_hr=42.0,
                accumulated_rainfall_mm=68.0,
                terrain_depression_index=0.74,
                elevation_m=8.2,
                slope_percentage=0.30,
                imperviousness_ratio=0.85,
                drain_capacity_utilization=1.10,
                drainage_surcharge=True,
                downstream_congestion=True,
                historical_flood_tendency=0.90,
            ),
        },
        "RD-BAR-002": {
            "name": "Duckbanglow More Interceptor (Jessore Rd - NH12 Link)",
            "ward_no": 29,
            "features": LocationFeatures(
                rainfall_intensity_mm_hr=38.5,
                accumulated_rainfall_mm=62.4,
                terrain_depression_index=0.82,
                elevation_m=7.9,
                slope_percentage=0.20,
                imperviousness_ratio=0.90,
                drain_capacity_utilization=1.18,
                drainage_surcharge=True,
                downstream_congestion=False,
                historical_flood_tendency=0.88,
            ),
        },
        "RD-BAR-003": {
            "name": "Colony More Bypass to Kazipara Link (NH-12 Corridor)",
            "ward_no": 12,
            "features": LocationFeatures(
                rainfall_intensity_mm_hr=32.0,
                accumulated_rainfall_mm=54.0,
                terrain_depression_index=0.10,
                elevation_m=11.4,
                slope_percentage=1.80,
                imperviousness_ratio=0.65,
                drain_capacity_utilization=0.45,
                drainage_surcharge=False,
                downstream_congestion=False,
                historical_flood_tendency=0.15,
            ),
        },
        "RD-BAR-004": {
            "name": "District Hospital Emergency Access Way (Kachhari Rd)",
            "ward_no": 1,
            "features": LocationFeatures(
                rainfall_intensity_mm_hr=38.5,
                accumulated_rainfall_mm=62.4,
                terrain_depression_index=0.42,
                elevation_m=9.8,
                slope_percentage=0.65,
                imperviousness_ratio=0.72,
                drain_capacity_utilization=0.82,
                drainage_surcharge=False,
                downstream_congestion=False,
                historical_flood_tendency=0.48,
            ),
        },
        "RD-BAR-005": {
            "name": "Sethpukur Basin Internal Connector",
            "ward_no": 33,
            "features": LocationFeatures(
                rainfall_intensity_mm_hr=40.0,
                accumulated_rainfall_mm=66.0,
                terrain_depression_index=0.88,
                elevation_m=7.2,
                slope_percentage=0.15,
                imperviousness_ratio=0.70,
                drain_capacity_utilization=1.00,
                drainage_surcharge=True,
                downstream_congestion=True,
                historical_flood_tendency=0.95,
            ),
        },
        "RD-BAR-006": {
            "name": "Nabapally Co-operative Road to Taki Road Jn",
            "ward_no": 22,
            "features": LocationFeatures(
                rainfall_intensity_mm_hr=29.0,
                accumulated_rainfall_mm=51.2,
                terrain_depression_index=0.45,
                elevation_m=8.9,
                slope_percentage=0.50,
                imperviousness_ratio=0.68,
                drain_capacity_utilization=0.78,
                drainage_surcharge=False,
                downstream_congestion=False,
                historical_flood_tendency=0.55,
            ),
        },
    }

    async def evaluate_location(
        self,
        location_id: str,
        custom_features: Optional[LocationFeatures] = None,
        data_mode: Optional[OperationMode] = None,
    ) -> LocationExplanationResponse:
        """Evaluates causal contributing factors, depth, risk tier, and confidence for a location."""
        op_mode = data_mode or OperationMode(settings.DEFAULT_OPERATION_MODE)

        # Lookup from catalog or use custom features
        catalog_entry = self.BARASAT_LOCATION_CATALOG.get(location_id)
        if custom_features is not None:
            features = custom_features
            loc_name = catalog_entry["name"] if catalog_entry else f"Location {location_id}"
            ward_no = catalog_entry["ward_no"] if catalog_entry else None
        elif catalog_entry is not None:
            features = catalog_entry["features"]
            loc_name = catalog_entry["name"]
            ward_no = catalog_entry["ward_no"]
        else:
            # Fallback default features for unspecified location
            features = LocationFeatures(
                rainfall_intensity_mm_hr=35.0,
                accumulated_rainfall_mm=55.0,
                terrain_depression_index=0.50,
                elevation_m=9.0,
                slope_percentage=0.50,
                imperviousness_ratio=0.70,
                drain_capacity_utilization=0.85,
                drainage_surcharge=False,
                downstream_congestion=False,
                historical_flood_tendency=0.50,
            )
            loc_name = f"Location {location_id}"
            ward_no = None

        # 1. Physics factor evaluation
        contributing_factors, primary_cause, depth_cm, time_to_flood_min = explainability_engine.evaluate_factors(features)

        # 2. Risk classification using configurable thresholds
        risk_level = risk_classifier.classify(depth_cm=depth_cm)

        # 3. Multivariate confidence computation
        conf_breakdown = confidence_engine.evaluate_confidence(
            telemetry_timestamp=datetime.now(timezone.utc),
            data_health=DataHealthStatus.LIVE if op_mode == OperationMode.LIVE else DataHealthStatus.LIVE,
            model_health=ModelHealthStatus.HEALTHY,
            missing_features_count=0,
            total_features_count=10,
            historical_iou=0.865,
        )

        return LocationExplanationResponse(
            location_id=location_id,
            location_name=loc_name,
            ward_no=ward_no,
            predicted_depth_cm=depth_cm,
            time_to_flood_minutes=time_to_flood_min,
            risk_level=risk_level,
            confidence=conf_breakdown.overall_confidence,
            contributing_factors=contributing_factors,
            primary_cause=primary_cause,
            confidence_breakdown=conf_breakdown,
            data_mode=op_mode,
            metadata={
                "elevation_m": features.elevation_m,
                "slope_percentage": features.slope_percentage,
                "imperviousness_ratio": features.imperviousness_ratio,
                "drain_capacity_utilization": features.drain_capacity_utilization,
                "drainage_surcharge": features.drainage_surcharge,
            },
        )

    def get_thresholds(self) -> RiskThresholdsConfig:
        """Returns the current risk threshold configuration."""
        return risk_classifier.config

    def set_thresholds(self, config: RiskThresholdsConfig) -> RiskThresholdsConfig:
        """Updates the risk threshold configuration."""
        risk_classifier.update_config(config)
        return risk_classifier.config


explainability_service = ExplainabilityService()
