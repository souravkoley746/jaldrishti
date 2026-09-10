"""API Version 1 Router Aggregator."""

from fastapi import APIRouter
from app.api.v1.endpoints import health, system, navigation, agent, home, prediction, auth, profile, feedback
from app.rainfall.router import router as rainfall_router
from app.explainability.router import router as explainability_router

api_router = APIRouter()

# Register core foundation and domain endpoints
api_router.include_router(health.router)
api_router.include_router(system.router)
api_router.include_router(navigation.router, prefix="/navigation", tags=["Navigation"])
api_router.include_router(home.router, prefix="/home", tags=["Home Early Warning"])
api_router.include_router(prediction.router, prefix="/prediction", tags=["Flood Prediction"])
api_router.include_router(agent.router, prefix="/agent", tags=["Agentic AI"])
api_router.include_router(auth.router)
api_router.include_router(profile.router)
api_router.include_router(feedback.router)
api_router.include_router(rainfall_router)
api_router.include_router(explainability_router)

# Top-level direct endpoint aliases required by API specification
api_router.add_api_route("/routes", navigation.calculate_osrm_routes_post_api, methods=["POST"], tags=["Navigation"])
api_router.add_api_route("/routes", navigation.evaluate_routes_api, methods=["GET"], tags=["Navigation"])
api_router.add_api_route("/geocode", navigation.geocode_search_api, methods=["GET"], tags=["Navigation"])
