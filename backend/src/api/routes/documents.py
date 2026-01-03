from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from src.database import get_db
from src.database.models import Document
from src.database.crud import DocumentCRUD  # Assuming we might add this or just use session directly
from typing import List, Dict, Any, Optional

router = APIRouter(prefix="/documents", tags=["documents"])

@router.get("/tree")
async def get_document_tree(db: Session = Depends(get_db)):
    """
    Get text hierarchy of documents: Org -> Release -> Spec.
    """
    documents = db.query(Document).all()
    
    # Build tree
    tree = []
    
    # 1. Group by Org (Hardcoded as 3GPP/ITU-T for now based on dummy data pattern, or infer from filename/metadata?)
    # The dummy data had 3GPP and ITU-T. Real data might just be flat.
    # Let's infer Org from 'release' or 'spec_id' if possible, or just default to "Standard Specifications"
    
    # Let's group by Release first as that's a column.
    
    releases = {}
    
    for doc in documents:
        rel = doc.release or "Unknown Release"
        if rel not in releases:
            releases[rel] = []
        releases[rel].append(doc)
        
    # Construct tree nodes
    # Root: 3GPP (Assuming most are 3GPP for this telecom context)
    root_children = []
    
    for release_name, docs in releases.items():
        release_node = {
            "id": f"rel-{release_name.replace(' ', '-').lower()}",
            "name": release_name,
            "type": "release",
            "children": []
        }
        
        for doc in docs:
            spec_node = {
                "id": str(doc.spec_id), # Use spec_id from DB
                "name": f"{doc.spec_id} - {doc.filename.replace('.pdf', '')}",
                "type": "spec",
                "metadata": {
                    "release": doc.release,
                    "lastIndexed": doc.ingested_at.isoformat() if doc.ingested_at else None,
                    "domains": doc.domains,
                    "total_chunks": doc.total_chunks
                },
                # We don't have clauses in DB yet, so leaves are specs
            }
            release_node["children"].append(spec_node)
            
        root_children.append(release_node)
        
    tree = [
        {
            "id": "3gpp",
            "name": "3GPP",
            "type": "org",
            "children": root_children
        }
    ]
    
    return tree

@router.get("/spec/{spec_id}/metadata")
async def get_spec_metadata(spec_id: str, db: Session = Depends(get_db)):
    """Get metadata for a specific document."""
    doc = db.query(Document).filter(Document.spec_id == spec_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    return {
        "id": doc.id,
        "spec_id": doc.spec_id,
        "filename": doc.filename,
        "release": doc.release,
        "domains": doc.domains,
        "ingested_at": doc.ingested_at,
        "total_chunks": doc.total_chunks
    }

@router.get("/spec/{spec_id}/content")
async def get_spec_content(spec_id: str, db: Session = Depends(get_db)):
    """
    Get snippet content for a document. 
    Since we don't store full text in SQL, and vector store is for search,
    we'll return a placeholder or try to read from file system if path known?
    
    For now, returning a static message or synthesized preview.
    """
    doc = db.query(Document).filter(Document.spec_id == spec_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return {
        "content": f"Content preview for {doc.filename}.\n\nThis document describes technical specifications for {doc.spec_id} related to release {doc.release}.\n\n(Full text retrieval from vector store not yet implemented via this endpoint)."
    }
