"""Dynamic Waterlogging Flood Prediction Endpoint for JALDRISHTI."""

from typing import Optional
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel

from app.services.prediction_service import FloodPredictionService

router = APIRouter()


@router.get("/waterlogging")
async def get_waterlogging_prediction(
    lat: float = Query(default=22.7214, description="Target Latitude"),
    lon: float = Query(default=88.4821, description="Target Longitude"),
    name: Optional[str] = Query(default="Target Location", description="Location Name")
):
    """Evaluates multi-factor dynamic flood waterlogging prediction for any given coordinates across India."""
    return await FloodPredictionService.evaluate_location_prediction(lat, lon, name or "Target Location")
