"""Structured Logging Configuration for JALDRISHTI."""

import logging
import sys
from app.core.config import settings


def setup_logging() -> None:
    """Configures structured standard logging for the backend application."""
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    log_format = "%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d - %(message)s"
    date_format = "%Y-%m-%d %H:%M:%S"

    # Reset root logger handlers
    logging.root.handlers = []

    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter(log_format, date_format)
    handler.setFormatter(formatter)

    logging.root.setLevel(log_level)
    logging.root.addHandler(handler)

    # Silence overly verbose third-party loggers
    for lib in ("uvicorn.access", "sqlalchemy.engine", "asyncpg"):
        logging.getLogger(lib).setLevel(logging.WARNING)


logger = logging.getLogger("jaldrishti")
