"""
Authentication Router for JALDRISHTI.
Provides MongoDB-backed account registration, login, logout, and session validation.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Header, Response, status
from pydantic import BaseModel, EmailStr, Field
import bcrypt
from app.database.mongodb import get_database

router = APIRouter(prefix="/auth", tags=["Authentication"])

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    name: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")

class AuthResponse(BaseModel):
    success: bool
    message: str
    token: Optional[str] = None
    user: Optional[dict] = None

def hash_password(password: str) -> str:
    pw_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pw_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pw_bytes = plain_password.encode('utf-8')[:72]
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pw_bytes, hash_bytes)
    except Exception:
        return False

async def get_current_user_from_token(authorization: Optional[str] = Header(None)) -> dict:
    """Dependency helper to resolve authenticated user from Bearer token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    token = authorization.split(" ")[1]
    db = get_database()
    
    session = await db.sessions.find_one({"token": token})
    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired or invalid")
    
    user = await db.users.find_one({"userId": session["userId"]})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account not found")
    
    # Remove sensitive hash before returning
    user["_id"] = str(user["_id"])
    user.pop("passwordHash", None)
    return user

@router.post("/register", response_model=AuthResponse)
async def register_account(payload: RegisterRequest):
    """Registers a new user account in MongoDB Atlas."""
    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    email_clean = payload.email.strip().lower()
    db = get_database()

    # Check if user already exists
    existing = await db.users.find_one({"email": email_clean})
    if existing:
        # If user exists, check if password matches to log them in, or return error
        if verify_password(payload.password, existing["passwordHash"]):
            # Create new session for existing account
            token = f"sess_{uuid.uuid4().hex}"
            await db.sessions.insert_one({
                "token": token,
                "userId": existing["userId"],
                "userEmail": existing["email"],
                "createdAt": datetime.now(timezone.utc).isoformat()
            })
            user_dict = {
                "userId": existing["userId"],
                "email": existing["email"],
                "name": existing.get("name") or existing["email"].split("@")[0],
                "savedHome": existing.get("savedHome"),
                "savedWork": existing.get("savedWork"),
                "notificationPreferences": existing.get("notificationPreferences")
            }
            return AuthResponse(
                success=True,
                message="Account authenticated successfully.",
                token=token,
                user=user_dict
            )
        else:
            raise HTTPException(status_code=400, detail="An account with this email already exists with a different password.")

    # Create new user identity
    user_id = f"usr_{uuid.uuid4().hex[:12]}"
    password_hash = hash_password(payload.password)
    now_iso = datetime.now(timezone.utc).isoformat()

    default_home = {
        "id": f"LOC-HOME-{user_id}",
        "name": "Home",
        "address": "Ballygunge, Kolkata, West Bengal, India",
        "locality": "Ballygunge",
        "coordinates": [22.5280, 88.3650],
        "type": "HOME",
        "isSet": True
    }
    default_work = {
        "id": f"LOC-WORK-{user_id}",
        "name": "Work Office",
        "address": "Sector V, Salt Lake Electronics Complex, Kolkata, West Bengal, India",
        "locality": "Salt Lake Sector V",
        "coordinates": [22.5726, 88.4331],
        "type": "WORK",
        "isSet": True
    }
    default_notifs = {
        "currentWaterlogging": True,
        "predictedFloodRisk": True,
        "heavyRainfallWarning": True,
        "routeFloodRisk": True
    }

    user_doc = {
        "userId": user_id,
        "email": email_clean,
        "passwordHash": password_hash,
        "name": payload.name or email_clean.split("@")[0],
        "savedHome": default_home,
        "savedWork": default_work,
        "notificationPreferences": default_notifs,
        "createdAt": now_iso,
        "updatedAt": now_iso
    }

    await db.users.insert_one(user_doc)

    # Create persistent session
    token = f"sess_{uuid.uuid4().hex}"
    await db.sessions.insert_one({
        "token": token,
        "userId": user_id,
        "userEmail": email_clean,
        "createdAt": now_iso
    })

    user_dict = {
        "userId": user_id,
        "email": email_clean,
        "name": user_doc["name"],
        "savedHome": default_home,
        "savedWork": default_work,
        "notificationPreferences": default_notifs
    }

    return AuthResponse(
        success=True,
        message="Account registered successfully.",
        token=token,
        user=user_dict
    )

@router.post("/login", response_model=AuthResponse)
async def login_account(payload: LoginRequest):
    """Authenticates email + password against MongoDB users collection."""
    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    email_clean = payload.email.strip().lower()
    db = get_database()

    user = await db.users.find_one({"email": email_clean})
    if not user or not verify_password(payload.password, user["passwordHash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = f"sess_{uuid.uuid4().hex}"
    await db.sessions.insert_one({
        "token": token,
        "userId": user["userId"],
        "userEmail": user["email"],
        "createdAt": datetime.now(timezone.utc).isoformat()
    })

    user_dict = {
        "userId": user["userId"],
        "email": user["email"],
        "name": user.get("name") or user["email"].split("@")[0],
        "savedHome": user.get("savedHome"),
        "savedWork": user.get("savedWork"),
        "notificationPreferences": user.get("notificationPreferences")
    }

    return AuthResponse(
        success=True,
        message="Login successful.",
        token=token,
        user=user_dict
    )

@router.post("/logout")
async def logout_account(authorization: Optional[str] = Header(None)):
    """Invalidates active session token."""
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        db = get_database()
        await db.sessions.delete_many({"token": token})
    return {"success": True, "message": "Logged out successfully."}

@router.get("/me")
async def get_me(user: dict = Depends(get_current_user_from_token)):
    """Returns profile for currently authenticated user."""
    return {"success": True, "user": user}
