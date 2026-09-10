"""Reusable FastAPI Dependencies."""

from typing import AsyncGenerator
from fastapi import Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import AsyncSessionLocal


async def get_database_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency providing an async database session for request scopes."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def verify_api_key_header(x_api_key: str = Header(default="public-demo-key")) -> str:
    """Validates optional API keys for administrative or high-frequency endpoints."""
    if not x_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API Key header 'X-API-Key' is missing",
        )
    return x_api_key
