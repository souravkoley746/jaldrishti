"""Integration and Contract Tests for Core Backend Health Endpoints."""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_health_endpoint():
    """Verifies that /api/v1/health returns HTTP 200 with structured component statuses."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "version" in data
        assert "database" in data
        assert "redis" in data
        assert data["version"] == "1.0.0"


@pytest.mark.asyncio
async def test_system_info_endpoint():
    """Verifies that /api/v1/system/info returns Barasat Municipality geographic and capability bounds."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/system/info")
        assert response.status_code == 200
        data = response.json()
        assert data["project_name"] == "JALDRISHTI"
        assert data["municipality"]["name"] == "Barasat Municipality"
        assert data["municipality"]["total_wards"] == 35
        assert len(data["municipality"]["bounding_box"]) == 4


@pytest.mark.asyncio
async def test_data_health_endpoint():
    """Verifies that /api/v1/data-health lists all telemetry feeds with explicit health states."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/data-health")
        assert response.status_code == 200
        data = response.json()
        assert "overall_status" in data
        assert "sources" in data
        assert len(data["sources"]) >= 4
        # Validate that statuses adhere to strict enums (LIVE, STALE, DEGRADED, DATA_UNAVAILABLE)
        valid_statuses = {"LIVE", "STALE", "DEGRADED", "DATA_UNAVAILABLE", "INVALID"}
        for source in data["sources"]:
            assert source["status"] in valid_statuses


@pytest.mark.asyncio
async def test_model_health_endpoint():
    """Verifies that /api/v1/model-health reports statuses of hydrology, hydraulics, and ML surrogates."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/model-health")
        assert response.status_code == 200
        data = response.json()
        assert "overall_status" in data
        assert "models" in data
        assert data["forecast_horizon_min"] == 180
