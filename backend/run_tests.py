"""Standalone Test Runner for JALDRISHTI FastAPI Backend & Agentic AI Engine."""

from fastapi.testclient import TestClient
from app.main import app


def run_backend_tests():
    print("=" * 65)
    print("JALDRISHTI BACKEND API INTEGRATION & AGENTIC AI TEST SUITE")
    print("=" * 65)

    client = TestClient(app)

    # Test 1: Health Endpoint
    print("[TEST 1/10] GET /api/v1/health ...", end=" ")
    res = client.get("/api/v1/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert data["version"] == "1.0.0"
    print("PASSED [OK]")

    # Test 2: System Info
    print("[TEST 2/10] GET /api/v1/system/info ...", end=" ")
    res = client.get("/api/v1/system/info")
    assert res.status_code == 200
    data = res.json()
    assert data["municipality"]["name"] == "Barasat Municipality"
    print("PASSED [OK]")

    # Test 3: Home Status Early Warning
    print("[TEST 3/10] GET /api/v1/navigation/home/status ...", end=" ")
    res = client.get("/api/v1/navigation/home/status?locality=Barasat%20Ward%204")
    assert res.status_code == 200
    data = res.json()
    assert data["home_locality"] == "Barasat Ward 4"
    assert data["expected_peak_depth_cm"] == 35.0
    print("PASSED [OK]")

    # Test 4: Hospitals Accessibility
    print("[TEST 4/10] GET /api/v1/navigation/hospitals ...", end=" ")
    res = client.get("/api/v1/navigation/hospitals")
    assert res.status_code == 200
    hospitals = res.json()
    assert len(hospitals) >= 3
    print("PASSED [OK]")

    # Test 5: Route Evaluation & Ranking
    print("[TEST 5/10] POST /api/v1/navigation/routes/evaluate ...", end=" ")
    res = client.post("/api/v1/navigation/routes/evaluate?origin=Barasat&destination=Howrah&vehicle_type=CAR")
    assert res.status_code == 200
    routes = res.json()
    assert len(routes) >= 1
    assert routes[0]["flood_exposure"] in ("LOW", "MODERATE", "HIGH", "CRITICAL")
    print("PASSED [OK]")

    # Test 6: Agent Home Safety Advisory
    print("[TEST 6/10] GET /api/v1/agent/home-safety ...", end=" ")
    res = client.get("/api/v1/agent/home-safety?locality=Barasat%20Ward%204&forecast_rainfall=88.5")
    assert res.status_code == 200
    agent_home = res.json()
    assert agent_home["home_locality"] == "Barasat Ward 4"
    assert agent_home["should_notify_user"] is True
    print("PASSED [OK]")

    # Test 7: Agent Route Evaluation
    print("[TEST 7/10] POST /api/v1/agent/evaluate-routes ...", end=" ")
    res = client.post("/api/v1/agent/evaluate-routes?origin=Barasat&destination=Howrah&vehicle_type=CAR")
    assert res.status_code == 200
    agent_routes = res.json()
    assert len(agent_routes) >= 1
    assert agent_routes[0]["vehicle_clearance_status"] == "SAFE"
    print("PASSED [OK]")

    # Test 8: Agent Decision Trace & Telemetry Quality
    print("[TEST 8/10] GET /api/v1/agent/trace ...", end=" ")
    res = client.get("/api/v1/agent/trace")
    assert res.status_code == 200
    trace = res.json()
    assert len(trace) >= 4
    print("PASSED [OK]")

    # Test 9: Location-Agnostic Home Flood Risk Evaluation
    print("[TEST 9/10] GET /api/v1/home/status ...", end=" ")
    res = client.get("/api/v1/home/status?lat=22.7214&lon=88.4821&locality=Barasat%20Ward%204")
    assert res.status_code == 200
    home_eval = res.json()
    assert "home_safety" in home_eval
    assert home_eval["data_provenance"]["weather_state"] in ["LIVE", "SIMULATION"]
    print("PASSED [OK]")

    # Test 10: OpenStreetMap Nominatim Geocoding API Search
    print("[TEST 10/10] GET /api/v1/home/geocode/search ...", end=" ")
    res = client.get("/api/v1/home/geocode/search?q=Barasat")
    assert res.status_code == 200
    geocode = res.json()
    assert len(geocode) >= 1
    print("PASSED [OK]")

    print("=" * 65)
    print("ALL 10 BACKEND INTEGRATION & AGENTIC AI TESTS PASSED! [OK]")
    print("=" * 65)


if __name__ == "__main__":
    run_backend_tests()
