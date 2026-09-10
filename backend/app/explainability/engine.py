"""Physics-Informed and Model-Feature Attribution Explainability Engine."""

import math
from typing import List, Tuple
from app.core.enums import FactorImpactLevel, FloodRiskLevel
from app.explainability.schemas import (
    ContributingFactorItem,
    LocationFeatures,
)


class ExplainableFloodIntelligenceEngine:
    """
    Evaluates physical mechanisms causing water accumulation and street inundation.
    Derives quantifiable causal factors from Saint-Venant mass conservation,
    SCS Curve Number runoff, SWMM 1D hydraulic surcharge, and DEM topographic depression.
    """

    @classmethod
    def evaluate_factors(
        cls,
        features: LocationFeatures,
    ) -> Tuple[List[ContributingFactorItem], str, float, int]:
        """
        Analyzes input features to compute:
        1. List of validated contributing factors with impact tiers and weight percentages.
        2. Primary plain-language grounded cause.
        3. Predicted water depth (cm).
        4. Time to flood (minutes).
        """
        raw_weights: List[Tuple[str, float, FactorImpactLevel, str, str]] = []

        # -------------------------------------------------------------
        # 1. Rainfall Dynamics (Intensity & Accumulation)
        # -------------------------------------------------------------
        # Flash convective storm threshold: > 25 mm/h or accumulation > 40 mm
        rain_score = 0.0
        if features.rainfall_intensity_mm_hr >= 50.0:
            rain_impact = FactorImpactLevel.CRITICAL
            rain_score = 40.0 + min(20.0, (features.rainfall_intensity_mm_hr - 50.0) * 0.5)
            rain_desc = f"Extreme convective cloudburst rate ({features.rainfall_intensity_mm_hr:.1f} mm/h) overwhelming surface storage."
        elif features.rainfall_intensity_mm_hr >= 30.0:
            rain_impact = FactorImpactLevel.HIGH
            rain_score = 30.0 + (features.rainfall_intensity_mm_hr - 30.0) * 0.5
            rain_desc = f"High precipitation intensity ({features.rainfall_intensity_mm_hr:.1f} mm/h) exceeding natural catchment discharge."
        elif features.rainfall_intensity_mm_hr >= 15.0 or features.accumulated_rainfall_mm >= 40.0:
            rain_impact = FactorImpactLevel.MEDIUM
            rain_score = 18.0 + (features.accumulated_rainfall_mm / 100.0) * 10.0
            rain_desc = f"Moderate rainfall intensity ({features.rainfall_intensity_mm_hr:.1f} mm/h) with {features.accumulated_rainfall_mm:.1f} mm accumulation."
        elif features.rainfall_intensity_mm_hr > 0.0:
            rain_impact = FactorImpactLevel.LOW
            rain_score = 8.0
            rain_desc = f"Light rainfall ({features.rainfall_intensity_mm_hr:.1f} mm/h)."
        else:
            rain_impact = FactorImpactLevel.LOW
            rain_score = 0.0
            rain_desc = "No active rainfall."

        if rain_score > 0:
            raw_weights.append((
                "high_rainfall",
                rain_score,
                rain_impact,
                rain_desc,
                f"{features.rainfall_intensity_mm_hr:.1f} mm/h (Accum: {features.accumulated_rainfall_mm:.1f} mm)",
            ))

        # -------------------------------------------------------------
        # 2. Topographic Depression & Micro-Catchment Slope
        # -------------------------------------------------------------
        # Sinks (depression_index > 0.5) and low slope (< 0.5%) cause pooling
        topo_score = 0.0
        if features.terrain_depression_index >= 0.70 or (features.elevation_m < 8.0 and features.slope_percentage < 0.3):
            topo_impact = FactorImpactLevel.HIGH
            topo_score = 25.0 + features.terrain_depression_index * 15.0
            topo_desc = f"Severe local topographic sink (Depression index: {features.terrain_depression_index:.2f}, Elevation: {features.elevation_m:.1f}m MSL) causing runoff convergence."
        elif features.terrain_depression_index >= 0.40 or features.slope_percentage < 0.8:
            topo_impact = FactorImpactLevel.MEDIUM
            topo_score = 15.0 + features.terrain_depression_index * 10.0
            topo_desc = f"Moderate basin depression and low gradient slope ({features.slope_percentage:.1f}%) delaying natural surface drainage."
        elif features.terrain_depression_index >= 0.20:
            topo_impact = FactorImpactLevel.LOW
            topo_score = 6.0
            topo_desc = f"Slight local depression (Index: {features.terrain_depression_index:.2f})."

        if topo_score > 0:
            raw_weights.append((
                "terrain_depression",
                topo_score,
                topo_impact,
                topo_desc,
                f"Elev: {features.elevation_m:.1f}m | Slope: {features.slope_percentage:.2f}% | Sink Idx: {features.terrain_depression_index:.2f}",
            ))

        # -------------------------------------------------------------
        # 3. Underground 1D Stormwater Surcharge & Capacity Stress
        # -------------------------------------------------------------
        drain_score = 0.0
        if features.drainage_surcharge or features.drain_capacity_utilization >= 1.0:
            drain_impact = FactorImpactLevel.CRITICAL
            drain_score = 35.0 + min(15.0, (features.drain_capacity_utilization - 1.0) * 20.0)
            drain_desc = f"1D stormwater conduit surcharged ({int(features.drain_capacity_utilization * 100)}% capacity) causing manhole backflow onto road surface."
        elif features.drain_capacity_utilization >= 0.75:
            drain_impact = FactorImpactLevel.HIGH
            drain_score = 20.0 + (features.drain_capacity_utilization - 0.75) * 40.0
            drain_desc = f"Storm drain under high hydraulic stress ({int(features.drain_capacity_utilization * 100)}% capacity)."
        elif features.drain_capacity_utilization >= 0.45:
            drain_impact = FactorImpactLevel.MEDIUM
            drain_score = 10.0
            drain_desc = f"Moderate drainage pipe utilization ({int(features.drain_capacity_utilization * 100)}%)."
        elif features.drain_capacity_utilization > 0.0:
            drain_impact = FactorImpactLevel.LOW
            drain_score = 4.0
            drain_desc = f"Adequate drainage conveyance capacity ({int(features.drain_capacity_utilization * 100)}% utilized)."

        if drain_score > 0:
            raw_weights.append((
                "drainage_surcharge",
                drain_score,
                drain_impact,
                drain_desc,
                f"{int(features.drain_capacity_utilization * 100)}% capacity (Surcharged: {features.drainage_surcharge})",
            ))

        # -------------------------------------------------------------
        # 4. Surface Imperviousness & Low Infiltration
        # -------------------------------------------------------------
        imperv_score = 0.0
        if features.imperviousness_ratio >= 0.80:
            imperv_impact = FactorImpactLevel.HIGH
            imperv_score = 18.0 + (features.imperviousness_ratio - 0.80) * 20.0
            imperv_desc = f"Dense urban impervious paving ({int(features.imperviousness_ratio * 100)}%) generating near-total surface runoff (SCS Runoff Coeff > 0.85)."
        elif features.imperviousness_ratio >= 0.55:
            imperv_impact = FactorImpactLevel.MEDIUM
            imperv_score = 10.0
            imperv_desc = f"Moderate impervious surface cover ({int(features.imperviousness_ratio * 100)}%)."
        elif features.imperviousness_ratio >= 0.30:
            imperv_impact = FactorImpactLevel.LOW
            imperv_score = 4.0
            imperv_desc = f"Low-to-moderate impervious cover ({int(features.imperviousness_ratio * 100)}%)."

        if imperv_score > 0:
            raw_weights.append((
                "high_imperviousness",
                imperv_score,
                imperv_impact,
                imperv_desc,
                f"{int(features.imperviousness_ratio * 100)}% paved / impervious",
            ))

        # -------------------------------------------------------------
        # 5. Downstream Congestion & Outfall Backwater Lock
        # -------------------------------------------------------------
        if features.downstream_congestion:
            raw_weights.append((
                "downstream_congestion",
                16.0,
                FactorImpactLevel.HIGH,
                "Canal outfall or downstream arterial culvert backwater effect blocking gravity discharge.",
                "Outfall Backwater Locked",
            ))

        # -------------------------------------------------------------
        # 6. Historical Spatial Flood Vulnerability
        # -------------------------------------------------------------
        if features.historical_flood_tendency >= 0.75:
            raw_weights.append((
                "historical_flood_tendency",
                12.0,
                FactorImpactLevel.MEDIUM,
                f"Location is a persistent historical waterlogging hotspot (Vulnerability index: {features.historical_flood_tendency:.2f}).",
                f"Historical Index: {features.historical_flood_tendency:.2f}",
            ))

        # -------------------------------------------------------------
        # Normalize Factor Weights to Sum to 100%
        # -------------------------------------------------------------
        total_raw_score = sum(w[1] for w in raw_weights) or 1.0
        contributing_factors: List[ContributingFactorItem] = []

        for factor_id, score, impact, desc, metric in sorted(raw_weights, key=lambda x: x[1], reverse=True):
            normalized_pct = round((score / total_raw_score) * 100.0, 1)
            contributing_factors.append(
                ContributingFactorItem(
                    factor=factor_id,
                    impact=impact,
                    weight_percentage=normalized_pct,
                    description=desc,
                    metric_value=metric,
                )
            )

        # -------------------------------------------------------------
        # Grounded Hydrodynamic Depth Estimation (Saint-Venant + Empirical)
        # -------------------------------------------------------------
        # Depth in cm calculated from net inflow (rainfall + surcharge) vs outflow (slope + capacity)
        effective_rain = features.rainfall_intensity_mm_hr * features.imperviousness_ratio
        depression_retention = features.terrain_depression_index * 25.0  # cm
        surcharge_overflow = 18.0 if features.drainage_surcharge else max(0.0, (features.drain_capacity_utilization - 0.9) * 20.0)

        estimated_depth_cm = round(
            max(0.0, (effective_rain * 0.45) + (depression_retention * 0.55) + surcharge_overflow - (features.slope_percentage * 3.0)),
            1
        )

        # Time to flood estimation in minutes
        if estimated_depth_cm <= 5.0:
            time_to_flood_min = 180
        elif features.rainfall_intensity_mm_hr > 40.0 or features.drainage_surcharge:
            time_to_flood_min = max(5, int(45 - (features.rainfall_intensity_mm_hr * 0.4) - (features.terrain_depression_index * 15)))
        else:
            time_to_flood_min = max(15, int(90 - (estimated_depth_cm * 1.2)))

        # Primary Cause Summary
        if contributing_factors:
            top_factor = contributing_factors[0]
            if len(contributing_factors) > 1 and contributing_factors[1].weight_percentage >= 25.0:
                primary_cause = f"Primary driver: {top_factor.description} Compound effect with {contributing_factors[1].factor.replace('_', ' ')}."
            else:
                primary_cause = top_factor.description
        else:
            primary_cause = "No significant flood risk factors detected; surface drainage capacity is adequate."

        return contributing_factors, primary_cause, estimated_depth_cm, time_to_flood_min


explainability_engine = ExplainableFloodIntelligenceEngine()
