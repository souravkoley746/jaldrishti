"""Integration tests for Explainable Flood Intelligence Engine."""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_get_location_explanation_road_102():
    """Verifies that /api/v1/explainability/location/road_102 returns grounded contributing factors."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/explainability/location/road_102")
        assert response.status_code == 200
        data = response.json()

        assert data["location_id"] == "road_102"
        assert "predicted_depth_cm" in data
        assert "time_to_flood_minutes" in data
        assert "risk_level" in data
        assert "confidence" in data
        assert data["risk_level"] in ["SAFE", "CAUTION", "HIGH", "CRITICAL", "CLOSED"]
        assert data["confidence"] in ["HIGH", "MEDIUM", "LOW", "UNKNOWN"]

        # Verify contributing factors structure
        assert "contributing_factors" in data
        assert len(data["contributing_factors"]) > 0

        # Check weights sum approximately to 100%
        total_weight = sum(f["weight_percentage"] for f in data["contributing_factors"])
        assert 98.0 <= total_weight <= 102.0

        for factor in data["contributing_factors"]:
            assert "factor" in factor
            assert "impact" in factor
            assert factor["impact"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
            assert "description" in factor
            assert len(factor["description"]) > 0

        # Verify confidence breakdown
        assert "confidence_breakdown" in data
        assert data["confidence_breakdown"]["overall_score"] >= 0.0


@pytest.mark.asyncio
async def test_evaluate_custom_features_post():
    """Verifies that POST /api/v1/explainability/evaluate computes factors for custom inputs."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "rainfall_intensity_mm_hr": 55.0,
            "accumulated_rainfall_mm": 80.0,
            "terrain_depression_index": 0.85,
            "elevation_m": 7.5,
            "slope_percentage": 0.2,
            "imperviousness_ratio": 0.90,
            "drain_capacity_utilization": 1.25,
            "drainage_surcharge": True,
            "downstream_congestion": True,
            "historical_flood_tendency": 0.95,
        }

        response = await ac.post("/api/v1/explainability/evaluate?location_id=test_sink_01", json=payload)
        assert response.status_code == 200
        data = response.json()

        assert data["location_id"] == "test_sink_01"
        assert data["predicted_depth_cm"] > 25.0
        assert data["risk_level"] in ["HIGH", "CRITICAL", "CLOSED"]

        # Ensure high_rainfall and drainage_surcharge are identified with high/critical impacts
        factor_names = [f["factor"] for f in data["contributing_factors"]]
        assert "high_rainfall" in factor_names
        assert "drainage_surcharge" in factor_names
        assert "terrain_depression" in factor_names


@pytest.mark.asyncio
async def test_risk_thresholds_endpoints():
    """Verifies retrieval and update of configurable risk thresholds."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Get current thresholds
        get_res = await ac.get("/api/v1/explainability/thresholds")
        assert get_res.status_code == 200
        current_cfg = get_res.json()
        assert current_cfg["safe_max_cm"] == 5.0

        # 2. Update thresholds
        new_cfg = {
            "safe_max_cm": 6.0,
            "caution_max_cm": 16.0,
            "high_max_cm": 32.0,
            "critical_max_cm": 52.0,
            "velocity_impassable_mps": 1.5,
        }
        put_res = await ac.put("/api/v1/explainability/thresholds", json=new_cfg)
        assert put_res.status_code == 200
        updated = put_res.json()
        assert updated["safe_max_cm"] == 6.0

        # 3. Restore default
        default_cfg = {
            "safe_max_cm": 5.0,
            "caution_max_cm": 15.0,
            "high_max_cm": 30.0,
            "critical_max_cm": 50.0,
            "velocity_impassable_mps": 1.2,
        }
        await ac.put("/api/v1/explainability/thresholds", json=default_cfg)
