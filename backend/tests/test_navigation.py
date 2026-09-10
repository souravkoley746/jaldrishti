"""Integration and Contract Tests for JALDRISHTI Navigation & Early Warning Endpoints."""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_get_home_status():
    """Verifies that /api/v1/navigation/home/status returns early warning summary for user's home area."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/navigation/home/status?locality=Barasat%20Ward%204")
        assert response.status_code == 200
        data = response.json()
        assert data["home_locality"] == "Barasat Ward 4"
        assert data["flood_risk_level"] in {"SAFE", "CAUTION", "HIGH", "CRITICAL", "CLOSED"}
        assert data["forecast_rainfall_mm"] > 0
        assert data["expected_peak_depth_cm"] > 0
        assert "recommended_alternative" in data


@pytest.mark.asyncio
async def test_get_nearby_hospitals():
    """Verifies that /api/v1/navigation/hospitals returns hospital accessibility status and water depth."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/navigation/hospitals")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 3
        valid_access_statuses = {"ACCESSIBLE", "MODERATE_WATERLOGGING", "PREDICTED_FLOOD", "INACCESSIBLE"}
        for hosp in data:
            assert hosp["access_status"] in valid_access_statuses
            assert hosp["emergency_phone"] != ""
            assert hosp["distance_km"] > 0


@pytest.mark.asyncio
async def test_evaluate_routes():
    """Verifies that /api/v1/navigation/routes/evaluate ranks candidate routes by travel time, flood risk, and vehicle constraints."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/api/v1/navigation/routes/evaluate?origin=Barasat&destination=Howrah&vehicle_type=CAR")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 3

        # Recommended route must be marked with LOW flood exposure
        recommended = data[0]
        assert "RECOMMENDED" in recommended["label"]
        assert recommended["flood_exposure"] == "LOW"
        assert recommended["why_recommended"] != ""
