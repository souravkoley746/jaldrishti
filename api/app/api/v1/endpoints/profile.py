"""
Profile & Location Preferences Router for JALDRISHTI.
Provides MongoDB persistence for saved Home, Work Office, and Notification settings.
"""

from datetime import datetime, timezone
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.api.v1.endpoints.auth import get_current_user_from_token
from app.database.mongodb import get_database

router = APIRouter(prefix="/profile", tags=["User Profile"])

class SavedLocationPayload(BaseModel):
    id: str
    name: str
    address: str
    locality: str
    coordinates: list
    type: str
    isSet: Optional[bool] = True

class NotificationSettingsPayload(BaseModel):
    currentWaterlogging: Optional[bool] = True
    predictedFloodRisk: Optional[bool] = True
    heavyRainfallWarning: Optional[bool] = True
    routeFloodRisk: Optional[bool] = True

@router.put("/home")
async def update_saved_home(payload: SavedLocationPayload, user: dict = Depends(get_current_user_from_token)):
    """Updates user's saved Home location in MongoDB Atlas."""
    db = get_database()
    now_iso = datetime.now(timezone.utc).isoformat()
    home_dict = payload.model_dump()
    
    await db.users.update_one(
        {"userId": user["userId"]},
        {"$set": {"savedHome": home_dict, "updatedAt": now_iso}}
    )
    return {"success": True, "savedHome": home_dict}

@router.put("/work")
async def update_saved_work(payload: SavedLocationPayload, user: dict = Depends(get_current_user_from_token)):
    """Updates user's saved Work Office location in MongoDB Atlas."""
    db = get_database()
    now_iso = datetime.now(timezone.utc).isoformat()
    work_dict = payload.model_dump()
    
    await db.users.update_one(
        {"userId": user["userId"]},
        {"$set": {"savedWork": work_dict, "updatedAt": now_iso}}
    )
    return {"success": True, "savedWork": work_dict}

@router.put("/notifications")
async def update_notification_settings(payload: NotificationSettingsPayload, user: dict = Depends(get_current_user_from_token)):
    """Updates user's notification preferences in MongoDB Atlas."""
    db = get_database()
    now_iso = datetime.now(timezone.utc).isoformat()
    notif_dict = payload.model_dump()
    
    await db.users.update_one(
        {"userId": user["userId"]},
        {"$set": {"notificationPreferences": notif_dict, "updatedAt": now_iso}}
    )
    return {"success": True, "notificationPreferences": notif_dict}
