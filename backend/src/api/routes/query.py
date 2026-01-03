"""Query endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.api.schemas import QueryRequest, QueryResponse, Source
from src.database import get_db
from src.database.crud import QueryCRUD, UserCRUD
from src.generation import get_model_loader, RAGInference
from src.retrieval import create_user_preferences
from src.utils import logger

router = APIRouter(prefix="/query", tags=["query"])

# Initialize RAG pipeline (lazy loading)
_rag_pipeline = None


def get_rag_pipeline() -> RAGInference:
    """Get or create RAG pipeline."""
    global _rag_pipeline
    if _rag_pipeline is None:
        logger.info("Initializing RAG pipeline...")
        model_loader = get_model_loader()
        _rag_pipeline = RAGInference(
            model=model_loader.model,
            tokenizer=model_loader.tokenizer,
            use_hybrid=True,
        )
    return _rag_pipeline


@router.post("/", response_model=QueryResponse)
async def query_standards(
    request: QueryRequest,
    db: Session = Depends(get_db),
) -> QueryResponse:
    """
    Query telecom standards using RAG.
    
    - **question**: The question to ask
    - **user_id**: Optional user ID for personalization
    - **top_k**: Number of documents to retrieve (default: 5)
    - **filters**: Optional metadata filters (e.g., {"release": "Release 17"})
    """
    try:
        logger.info(f"Received query: {request.question[:100]}...")
        
        # Get RAG pipeline
        rag = get_rag_pipeline()
        
        # Apply user preferences if user_id provided
        if request.user_id:
            user = UserCRUD.get_by_id(db, request.user_id)
            if user:
                # Get user query history
                history = QueryCRUD.get_user_history(db, request.user_id, limit=20)
                
                # Extract domains from history
                query_history = [
                    {"domains": q.metadata.get("domains", [])}
                    for q in history
                    if q.metadata
                ]
                
                # Create preferences
                preferences = create_user_preferences(query_history)
                if preferences:
                    rag.set_user_preferences(preferences)
                    logger.info(f"Applied user preferences: {preferences}")
        
        # Execute query
        result = rag.query(
            question=request.question,
            top_k=request.top_k,
            filters=request.filters,
            return_sources=True,
        )
        
        # Save query to database
        query_id = None
        if request.user_id:
            query_record = QueryCRUD.create(
                db=db,
                user_id=request.user_id,
                question=request.question,
                answer=result["answer"],
                context=str(result.get("sources", [])),
                metadata={
                    "sources": result.get("sources", []),
                    "top_k": request.top_k,
                },
            )
            query_id = query_record.id
        
        # Format response
        sources = [
            Source(
                text=s["text"],
                metadata=s["metadata"],
                score=s["score"],
            )
            for s in result.get("sources", [])
        ]
        
        return QueryResponse(
            answer=result["answer"],
            question=result["question"],
            sources=sources,
            query_id=query_id,
        )
        
    except Exception as e:
        logger.error(f"Error processing query: {e}")
        raise HTTPException(status_code=500, detail=str(e))
