"""Logging configuration for Auto-Standard platform."""
import sys
from loguru import logger
from src.utils.config import settings


def setup_logger() -> None:
    """Configure loguru logger with appropriate settings."""
    logger.remove()  # Remove default handler
    
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level=settings.log_level,
        colorize=True,
    )
    
    logger.add(
        "logs/auto_standard_{time:YYYY-MM-DD}.log",
        rotation="00:00",
        retention="30 days",
        level=settings.log_level,
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
    )


setup_logger()
