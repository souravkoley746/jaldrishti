"""System Information and Municipal Metadata Endpoints."""

from fastapi import APIRouter, status
from app.schemas.system import SystemInfoResponse
from app.services.health_service import HealthService

router = APIRouter(tags=["System Info"])


@router.get(
    "/system/info",
    response_model=SystemInfoResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Barasat Municipality spatial domain, bounding box, and pipeline capabilities",
)
async def get_system_info() -> SystemInfoResponse:
    """Returns spatial bounding boxes, total wards, CRS definitions, and active digital twin capabilities."""
    return await HealthService.get_system_info()
