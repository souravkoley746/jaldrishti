"""Integration and Contract Tests for JALDRISHTI Agentic AI Endpoints."""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_agent_home_safety():
    """Verifies that /api/v1/agent/home-safety returns structured home safety reasoning."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/agent/home-safety?locality=Barasat%20Ward%204&forecast_rainfall=88.5")
        assert response.status_code == 200
        data = response.json()
        assert data["home_locality"] == "Barasat Ward 4"
        assert data["risk_level"] in {"LOW", "MODERATE", "HIGH", "CRITICAL"}
        assert data["should_notify_user"] is True
        assert "advisory_headline" in data
        assert "alternative_route_summary" in data


@pytest.mark.asyncio
async def test_agent_evaluate_routes():
    """Verifies that /api/v1/agent/evaluate-routes returns route choice decisions with why_recommended rationale."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/api/v1/agent/evaluate-routes?origin=Barasat&destination=Howrah&vehicle_type=CAR")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 3

        top_route = data[0]
        assert top_route["flood_exposure"] == "LOW"
        assert len(top_route["why_recommended"]) >= 2
        assert top_route["vehicle_clearance_status"] in {"SAFE", "RISKY", "INACCESSIBLE"}


@pytest.mark.asyncio
async def test_agent_decision_trace():
    """Verifies that /api/v1/agent/trace returns step-by-step agent decision traces for pro command mode."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/agent/trace")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 4
        assert data[0]["agent_name"] == "DataQualityAgent"
        assert data[1]["agent_name"] == "FloodRiskDecisionAgent"


@pytest.mark.asyncio
async def test_agent_data_quality():
    """Verifies that /api/v1/agent/data-quality returns telemetry health status."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/agent/data-quality")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] in {"GOOD", "DEGRADED", "STALE", "UNAVAILABLE"}
        assert data["weather_data_fresh"] is True
