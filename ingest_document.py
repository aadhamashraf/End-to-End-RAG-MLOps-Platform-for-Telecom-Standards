"""Script to ingest a PDF document."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.ingestion import parse_pdf, chunk_document, tag_metadata, get_embedder
from src.retrieval import get_vector_store
from src.database import SessionLocal, init_db
from src.database.crud import DocumentCRUD
import hashlib
from src.utils import logger


def ingest_pdf(pdf_path: str) -> None:
    """Ingest a PDF into the system."""
    pdf_path = Path(pdf_path)
    
    if not pdf_path.exists():
        logger.error(f"PDF not found: {pdf_path}")
        return
    
    logger.info(f"Ingesting: {pdf_path}")
    
    # Initialize database
    init_db()
    db = SessionLocal()
    
    try:
        # Calculate hash
        file_hash = hashlib.sha256(pdf_path.read_bytes()).hexdigest()
        
        # Check if already ingested
        existing = DocumentCRUD.get_by_hash(db, file_hash)
        if existing:
            logger.info(f"Document already ingested: {existing.filename}")
            return
        
        # Parse
        parsed = parse_pdf(str(pdf_path))
        full_text = "\n".join(page["text"] for page in parsed["pages"])
        
        # Tag metadata
        metadata = tag_metadata(full_text, parsed["filename"])
        
        # Chunk
        chunks = chunk_document(full_text, metadata)
        
        # Embed
        embedder = get_embedder()
        texts = [chunk["text"] for chunk in chunks]
        embeddings = embedder.embed(texts)
        
        # Store in vector DB
        vector_store = get_vector_store()
        chunk_metadatas = [chunk["metadata"] for chunk in chunks]
        chunk_ids = [f"{file_hash}_{i}" for i in range(len(chunks))]
        
        vector_store.add(
            texts=texts,
            embeddings=embeddings,
            metadatas=chunk_metadatas,
            ids=chunk_ids,
        )
        
        # Store in SQL DB
        DocumentCRUD.create(
            db=db,
            filename=parsed["filename"],
            spec_id=metadata["spec_id"],
            release=metadata["release"],
            domains=metadata["domains"],
            total_chunks=len(chunks),
            file_hash=file_hash,
        )
        
        logger.info(f"✓ Ingested {len(chunks)} chunks from {pdf_path.name}")
        
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python ingest_document.py <pdf_path>")
        sys.exit(1)
    
    ingest_pdf(sys.argv[1])
