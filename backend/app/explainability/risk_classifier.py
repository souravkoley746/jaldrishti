"""Configurable Flood Risk Classifier."""

from typing import Optional
from app.core.enums import FloodRiskLevel
from app.explainability.schemas import RiskThresholdsConfig


class FloodRiskClassifier:
    """Classifies flood risk based on water depth and hydro-dynamic flow velocities."""

    def __init__(self, config: Optional[RiskThresholdsConfig] = None):
        self.config = config or RiskThresholdsConfig()

    def update_config(self, new_config: RiskThresholdsConfig) -> None:
        """Dynamically updates the operational classification thresholds."""
        self.config = new_config

    def classify(self, depth_cm: float, velocity_mps: float = 0.0) -> FloodRiskLevel:
        """
        Classifies water depth into standard operational tiers:
        - SAFE: < safe_max_cm (default < 5 cm)
        - CAUTION: 5 - 15 cm
        - HIGH: 15 - 30 cm
        - CRITICAL: 30 - 50 cm
        - CLOSED: > 50 cm OR velocity > 1.2 m/s (Impassable / High hydro-dynamic thrust)
        """
        if depth_cm < 0.0:
            depth_cm = 0.0

        # Physical impassability checks due to high velocity thrust or extreme depth
        if depth_cm > self.config.critical_max_cm:
            return FloodRiskLevel.CLOSED

        if velocity_mps >= self.config.velocity_impassable_mps and depth_cm >= self.config.caution_max_cm:
            return FloodRiskLevel.CLOSED

        if depth_cm > self.config.high_max_cm:
            return FloodRiskLevel.CRITICAL

        if depth_cm > self.config.caution_max_cm:
            return FloodRiskLevel.HIGH

        if depth_cm > self.config.safe_max_cm:
            return FloodRiskLevel.CAUTION

        return FloodRiskLevel.SAFE


# Global singleton instance with default municipal configuration
risk_classifier = FloodRiskClassifier()
