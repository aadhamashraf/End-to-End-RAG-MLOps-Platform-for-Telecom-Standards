"""Setup database tables."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from src.database import init_db
from src.utils import logger


def setup_database():
    """Initialize database tables."""
    logger.info("Setting up database...")
    
    try:
        init_db()
        logger.info("✓ Database tables created successfully")
    except Exception as e:
        logger.error(f"✗ Database setup failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    setup_database()
