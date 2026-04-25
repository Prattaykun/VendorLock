"""
Structured logging with Loguru.
"""
import sys
from loguru import logger
from app.core.config import settings


def setup_logging():
    logger.remove()
    level = "DEBUG" if settings.DEBUG else "INFO"
    fmt = (
        "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> — "
        "<level>{message}</level>"
    )
    logger.add(sys.stdout, format=fmt, level=level, colorize=True)
    logger.add(
        "logs/vendorlock_{time:YYYY-MM-DD}.log",
        rotation="00:00",
        retention="14 days",
        compression="zip",
        level="INFO",
        format=fmt,
    )
