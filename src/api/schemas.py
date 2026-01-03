"""Pydantic schemas for API."""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime


class QueryRequest(BaseModel):
    """Request schema for query endpoint."""
    question: str = Field(..., min_length=1, description="User question")
    user_id: Optional[int] = Field(None, description="User ID for personalization")
    top_k: Optional[int] = Field(5, ge=1, le=20, description="Number of documents to retrieve")
    filters: Optional[Dict[str, str]] = Field(None, description="Metadata filters")


class Source(BaseModel):
    """Source document schema."""
    text: str
    metadata: Dict
    score: float


class QueryResponse(BaseModel):
    """Response schema for query endpoint."""
    answer: str
    question: str
    sources: List[Source]
    query_id: Optional[int] = None


class FeedbackRequest(BaseModel):
    """Request schema for feedback."""
    query_id: int
    user_id: int
    rating: Optional[int] = Field(None, ge=1, le=5)
    helpful: Optional[int] = Field(None, ge=-1, le=1)
    comment: Optional[str] = None


class IngestRequest(BaseModel):
    """Request schema for document ingestion."""
    pdf_path: str = Field(..., description="Path to PDF file")


class IngestResponse(BaseModel):
    """Response schema for ingestion."""
    success: bool
    filename: str
    spec_id: str
    release: str
    total_chunks: int
    message: str


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    timestamp: datetime
    vector_store_count: int
    model_loaded: bool


class MetricsResponse(BaseModel):
    """Metrics response."""
    total_queries: int
    total_users: int
    total_documents: int
    avg_rating: Optional[float]
    recent_queries: List[Dict]
