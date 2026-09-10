"""Security, Hashing, and JWT Token Utilities for JALDRISHTI."""

from datetime import datetime, timedelta, timezone
from typing import Any, Optional, Union
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(
    subject: Union[str, Any],
    expires_delta: Optional[timedelta] = None,
    role: str = "PUBLIC_USER"
) -> str:
    """Generates a secure JWT access token with role claims."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "role": role,
        "iss": "jaldrishti-auth"
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain-text password against a hashed bcrypt representation."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generates a bcrypt hash of a given password."""
    return pwd_context.hash(password)
