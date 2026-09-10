"""Pydantic Schemas for Explainable Flood Intelligence Engine."""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.core.enums import FloodRiskLevel, ConfidenceLevel, FactorImpactLevel, OperationMode


class LocationFeatures(BaseModel):
    """Input hydro-meteorological and physical terrain features for a location."""
    rainfall_intensity_mm_hr: float = Field(..., description="Instantaneous/forecasted rainfall intensity in mm/h", ge=0.0)
    accumulated_rainfall_mm: float = Field(..., description="Storm total accumulated rainfall in mm", ge=0.0)
    terrain_depression_index: float = Field(..., description="Micro-topographic depression factor (0.0=ridge, 1.0=deep sink)", ge=0.0, le=1.0)
    elevation_m: float = Field(..., description="Ground elevation relative to MSL in meters")
    slope_percentage: float = Field(..., description="Catchment topographic slope in percent", ge=0.0)
    imperviousness_ratio: float = Field(..., description="Fraction of impervious surface (paved/roof) (0.0 to 1.0)", ge=0.0, le=1.0)
    drain_capacity_utilization: float = Field(..., description="1D stormwater drainage capacity utilization ratio (1.0 = 100%)", ge=0.0)
    drainage_surcharge: bool = Field(default=False, description="Whether underground storm drain is surcharged or backflowing")
    downstream_congestion: bool = Field(default=False, description="Whether downstream canal or river outfall is congested/backwater locked")
    historical_flood_tendency: float = Field(default=0.5, description="Historical spatial vulnerability score (0.0 to 1.0)", ge=0.0, le=1.0)
    soil_infiltration_rate_mm_hr: Optional[float] = Field(default=4.5, description="Horton/Green-Ampt soil infiltration capacity in mm/h", ge=0.0)


class ContributingFactorItem(BaseModel):
    """Specific physical contributing factor explaining the flood risk."""
    factor: str = Field(..., description="Standardized factor identifier, e.g. 'high_rainfall', 'terrain_depression'")
    impact: FactorImpactLevel = Field(..., description="Causal impact severity: LOW, MEDIUM, HIGH, CRITICAL")
    weight_percentage: float = Field(..., description="Relative percentage contribution to flooding (0-100%)", ge=0.0, le=100.0)
    description: str = Field(..., description="Grounded physical explanation of the factor mechanism")
    metric_value: Optional[str] = Field(None, description="Quantified observed/simulated metric with unit")


class ConfidenceAssessmentBreakdown(BaseModel):
    """Detailed scoring matrix for prediction confidence calculation."""
    overall_confidence: ConfidenceLevel
    overall_score: float = Field(..., description="Normalized confidence score from 0.0 to 1.0", ge=0.0, le=1.0)
    data_freshness_score: float = Field(..., ge=0.0, le=1.0)
    input_completeness_score: float = Field(..., ge=0.0, le=1.0)
    model_health_score: float = Field(..., ge=0.0, le=1.0)
    historical_performance_score: float = Field(..., ge=0.0, le=1.0)
    details: Dict[str, str]


class LocationExplanationResponse(BaseModel):
    """Comprehensive explainable flood intelligence response for a location."""
    location_id: str
    location_name: Optional[str] = None
    ward_no: Optional[int] = None
    predicted_depth_cm: float = Field(..., description="Predicted inundation water depth in cm", ge=0.0)
    time_to_flood_minutes: int = Field(..., description="Estimated minutes until street is inundated (>5cm)", ge=0)
    risk_level: FloodRiskLevel
    confidence: ConfidenceLevel
    contributing_factors: List[ContributingFactorItem]
    primary_cause: str
    confidence_breakdown: Optional[ConfidenceAssessmentBreakdown] = None
    data_mode: OperationMode = OperationMode.SIMULATION
    metadata: Optional[Dict[str, Any]] = None


class RiskThresholdsConfig(BaseModel):
    """Configurable inundation depth thresholds for risk classification."""
    safe_max_cm: float = Field(default=5.0, description="Max depth for SAFE classification in cm", ge=0.0)
    caution_max_cm: float = Field(default=15.0, description="Max depth for CAUTION classification in cm", gt=0.0)
    high_max_cm: float = Field(default=30.0, description="Max depth for HIGH classification in cm", gt=0.0)
    critical_max_cm: float = Field(default=50.0, description="Max depth for CRITICAL classification in cm", gt=0.0)
    velocity_impassable_mps: float = Field(default=1.2, description="Flow velocity threshold causing impassability in m/s", ge=0.0)
