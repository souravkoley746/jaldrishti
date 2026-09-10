"""Integration tests for Rainfall & Nowcasting endpoints."""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_current_rainfall():
    """Verifies that /api/v1/rainfall/current returns observations with valid metadata."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/rainfall/current")
        assert response.status_code == 200
        data = response.json()
        assert "observations" in data
        assert len(data["observations"]) > 0
        for obs in data["observations"]:
            assert "rainfall_intensity" in obs
            assert "accumulated_rainfall" in obs
            assert "source" in obs
            assert "quality_status" in obs
            assert "data_mode" in obs
            assert obs["rainfall_intensity"] >= 0.0


@pytest.mark.asyncio
async def test_rainfall_history():
    """Verifies that /api/v1/rainfall/history returns historical hyetograph points."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/rainfall/history?hours_back=3")
        assert response.status_code == 200
        data = response.json()
        assert "records" in data
        assert data["total_records"] > 0


@pytest.mark.asyncio
async def test_rainfall_nowcast_forecast():
    """Verifies that /api/v1/rainfall/forecast produces 0 to 180 min nowcast across all specified timesteps."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/rainfall/forecast")
        assert response.status_code == 200
        data = response.json()
        assert data["forecast_horizon_min"] == 180
        expected_intervals = [0, 15, 30, 45, 60, 90, 120, 150, 180]
        assert data["intervals_minutes"] == expected_intervals
        assert len(data["forecasts"]) == len(expected_intervals)
        for forecast in data["forecasts"]:
            assert "generated_at" in forecast
            assert "valid_time" in forecast
            assert "rainfall_intensity" in forecast
            assert "source" in forecast
            assert "method" in forecast
            assert "confidence" in forecast
            assert "data_mode" in forecast
            assert forecast["rainfall_intensity"] >= 0.0
