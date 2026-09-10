"""Main FastAPI Application Entry Point for JALDRISHTI."""

import time
from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logging import logger, setup_logging
from app.database.mongodb import connect_to_mongo, close_mongo_connection
from app.database.session import check_database_health, engine


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application startup and shutdown lifecycle management."""
    # Startup
    setup_logging()
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION} [{settings.ENVIRONMENT}]")
    logger.info(f"Target Domain: {settings.MUNICIPALITY_NAME} ({settings.MUNICIPALITY_CODE})")

    # Verify MongoDB Atlas connectivity
    mongo_healthy = await connect_to_mongo()
    if mongo_healthy:
        logger.info("MongoDB Atlas database connection initialized successfully")
    else:
        logger.warning("MongoDB Atlas connection unavailable at startup. Will operate in resilient fallback mode.")

    # Verify PostgreSQL Database connectivity
    db_healthy = await check_database_health()
    if db_healthy:
        logger.info("PostgreSQL + PostGIS connection initialized successfully")
    else:
        logger.warning("Database connection unavailable at startup. Will operate in resilient fallback mode.")

    yield

    # Shutdown
    logger.info(f"Shutting down {settings.PROJECT_NAME} backend engine...")
    await close_mongo_connection()
    await engine.dispose()
    logger.info("Database connection pool closed successfully.")


# Instantiate FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# Configure Cross-Origin Resource Sharing (CORS)
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


# Structured Request Timing & Logging Middleware
@app.middleware("http")
async def log_requests_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000.0

    logger.info(
        f"{request.method} {request.url.path} -> Status: {response.status_code} ({process_time:.1f}ms)"
    )
    response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
    return response


# Global Exception Handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error_code": "HTTP_ERROR",
            "message": exc.detail,
            "path": request.url.path,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error_code": "VALIDATION_ERROR",
            "message": "Input validation failed on payload attributes.",
            "details": exc.errors(),
            "path": request.url.path,
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled internal exception on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected scientific simulation or backend error occurred.",
            "path": request.url.path,
        },
    )


# Register API Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", include_in_schema=False)
async def root():
    """Root redirect to OpenAPI documentation."""
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "municipality": settings.MUNICIPALITY_NAME,
        "docs_url": f"{settings.API_V1_STR}/docs",
        "health_url": f"{settings.API_V1_STR}/health",
    }
