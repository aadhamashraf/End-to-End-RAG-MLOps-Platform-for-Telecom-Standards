"""FastAPI main application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import query, admin, health, documents, personalization, explainability, evaluation
from src.database import init_db
from src.utils import logger

# Create FastAPI app
app = FastAPI(
    title="Auto-Standard API",
    description="End-to-End RAG & MLOps Platform for Telecom Standards",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(query.router)
app.include_router(admin.router)
app.include_router(health.router)
app.include_router(documents.router)
app.include_router(personalization.router)
app.include_router(explainability.router)
app.include_router(evaluation.router)


@app.on_event("startup")
async def startup_event():
    """Initialize on startup."""
    logger.info("Starting Auto-Standard API...")
    
    # Initialize database
    try:
        init_db()
        logger.info("Database initialized")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
    
    logger.info("Auto-Standard API ready")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down Auto-Standard API...")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Auto-Standard API",
        "version": "0.1.0",
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn
    from src.utils.config import settings
    
    uvicorn.run(
        "src.api.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True,
    )
