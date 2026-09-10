"""Database Session Management and Async Connection Engine."""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy import text
from app.core.config import settings
from app.core.logging import logger

# Async PostgreSQL + PostGIS engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_pre_ping=True,
)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI Dependency for transactional database sessions."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def check_database_health() -> bool:
    """Performs a quick SELECT 1 query to verify database and PostGIS connectivity."""
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1;"))
            return result.scalar() == 1
    except Exception as e:
        logger.warning(f"Database healthcheck failed: {e}")
        return False
