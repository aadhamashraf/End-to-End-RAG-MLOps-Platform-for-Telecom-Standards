"""Admin endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pathlib import Path
import hashlib
from src.api.schemas import IngestRequest, IngestResponse, MetricsResponse
from src.database import get_db
from src.database.crud import DocumentCRUD, QueryCRUD, UserCRUD, FeedbackCRUD
from src.database.models import Feedback
from src.ingestion import parse_pdf, chunk_document, tag_metadata, get_embedder
from src.retrieval import get_vector_store
from src.utils import logger

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/ingest", response_model=IngestResponse)
async def ingest_document(
    request: IngestRequest,
    db: Session = Depends(get_db),
) -> IngestResponse:
    """
    Ingest a new telecom standard PDF.
    
    - **pdf_path**: Path to the PDF file
    """
    try:
        pdf_path = Path(request.pdf_path)
        
        if not pdf_path.exists():
            raise HTTPException(status_code=404, detail="PDF file not found")
        
        logger.info(f"Ingesting document: {pdf_path}")
        
        # Calculate file hash for deduplication
        file_hash = hashlib.sha256(pdf_path.read_bytes()).hexdigest()
        
        # Check if already ingested
        existing = DocumentCRUD.get_by_hash(db, file_hash)
        if existing:
            return IngestResponse(
                success=False,
                filename=existing.filename,
                spec_id=existing.spec_id,
                release=existing.release,
                total_chunks=existing.total_chunks,
                message="Document already ingested",
            )
        
        # Parse PDF
        parsed = parse_pdf(str(pdf_path))
        
        # Extract full text
        full_text = "\n".join(page["text"] for page in parsed["pages"])
        
        # Tag metadata
        metadata = tag_metadata(full_text, parsed["filename"])
        
        # Chunk document
        chunks = chunk_document(full_text, metadata)
        
        # Generate embeddings
        embedder = get_embedder()
        texts = [chunk["text"] for chunk in chunks]
        embeddings = embedder.embed(texts)
        
        # Add to vector store
        vector_store = get_vector_store()
        chunk_metadatas = [chunk["metadata"] for chunk in chunks]
        chunk_ids = [f"{file_hash}_{i}" for i in range(len(chunks))]
        
        vector_store.add(
            texts=texts,
            embeddings=embeddings,
            metadatas=chunk_metadatas,
            ids=chunk_ids,
        )
        
        # Save to database
        DocumentCRUD.create(
            db=db,
            filename=parsed["filename"],
            spec_id=metadata["spec_id"],
            release=metadata["release"],
            domains=metadata["domains"],
            total_chunks=len(chunks),
            file_hash=file_hash,
        )
        
        logger.info(f"Successfully ingested {len(chunks)} chunks from {pdf_path.name}")
        
        return IngestResponse(
            success=True,
            filename=parsed["filename"],
            spec_id=metadata["spec_id"],
            release=metadata["release"],
            total_chunks=len(chunks),
            message="Document ingested successfully",
        )
        
    except Exception as e:
        logger.error(f"Error ingesting document: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics", response_model=MetricsResponse)
async def get_metrics(db: Session = Depends(get_db)) -> MetricsResponse:
    """Get system metrics."""
    try:
        # Count queries
        total_queries = db.query(QueryCRUD).count()
        
        # Count users
        from src.database.models import User
        total_users = db.query(User).count()
        
        # Count documents
        from src.database.models import Document
        total_documents = db.query(Document).count()
        
        # Average rating
        from sqlalchemy import func
        avg_rating = db.query(func.avg(Feedback.rating)).scalar()
        
        # Recent queries
        from src.database.models import Query
        recent = db.query(Query).order_by(Query.created_at.desc()).limit(10).all()
        recent_queries = [
            {
                "id": q.id,
                "question": q.question[:100],
                "created_at": q.created_at.isoformat(),
            }
            for q in recent
        ]
        
        return MetricsResponse(
            total_queries=total_queries,
            total_users=total_users,
            total_documents=total_documents,
            avg_rating=float(avg_rating) if avg_rating else None,
            recent_queries=recent_queries,
        )
        
    except Exception as e:
        logger.error(f"Error getting metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))
