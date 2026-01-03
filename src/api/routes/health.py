"""Health check endpoint."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from src.api.schemas import HealthResponse
from src.database import get_db
from src.retrieval import get_vector_store
from src.generation import get_model_loader

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check(db: Session = Depends(get_db)) -> HealthResponse:
    """Health check endpoint."""
    # Check vector store
    try:
        vector_store = get_vector_store()
        vector_count = vector_store.count()
    except:
        vector_count = 0
    
    # Check model
    try:
        model_loader = get_model_loader()
        model_loaded = model_loader.model is not None
    except:
        model_loaded = False
    
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        vector_store_count=vector_count,
        model_loaded=model_loaded,
    )
