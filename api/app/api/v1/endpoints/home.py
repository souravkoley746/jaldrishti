"""Home Early Warning & Location Resolution Endpoints."""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel

from app.services.weather_service import WeatherService
from app.services.geocoding_service import GeocodingService
from app.services.home_advisory_service import HomeAdvisoryService

router = APIRouter()


class HomeEvaluationRequest(BaseModel):
    latitude: float
    longitude: float
    locality: Optional[str] = "Saved Home"
    address: Optional[str] = None


@router.get("/status")
async def get_home_status_api(
    lat: float = Query(default=22.7214),
    lon: float = Query(default=88.4821),
    locality: str = Query(default="Barasat Ward 4")
):
    """Evaluates Home flood safety and early warning status for given coordinates."""
    return await HomeAdvisoryService.evaluate_home_safety(lat, lon, locality)


@router.post("/evaluate")
async def evaluate_home(req: HomeEvaluationRequest):
    """Evaluates Home flood risk from POST request body."""
    return await HomeAdvisoryService.evaluate_home_safety(req.latitude, req.longitude, req.locality or "Home")


@router.get("/weather")
async def get_home_weather(
    lat: float = Query(default=22.7214),
    lon: float = Query(default=88.4821)
):
    """Returns real Open-Meteo meteorological forecast for given coordinates."""
    return await WeatherService.get_weather_forecast(lat, lon)


@router.get("/geocode/search")
async def search_geocoding(q: str = Query(...)):
    """Search address suggestions using Nominatim API."""
    return await GeocodingService.search_address(q)


@router.get("/geocode/reverse")
async def reverse_geocoding(
    lat: float = Query(...),
    lon: float = Query(...)
):
    """Reverse geocode GPS coordinates."""
    return await GeocodingService.reverse_geocode(lat, lon)
