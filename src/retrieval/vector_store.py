"""Vector store wrapper for ChromaDB."""
from typing import List, Dict, Optional
import chromadb
from chromadb.config import Settings as ChromaSettings
from src.utils import settings, logger


class VectorStore:
    """ChromaDB wrapper for vector storage and retrieval."""
    
    def __init__(self, collection_name: str = "telecom_specs"):
        logger.info(f"Initializing ChromaDB at: {settings.vector_db_path}")
        
        self.client = chromadb.PersistentClient(
            path=settings.vector_db_path,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
        
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            metadata={"description": "Telecom standards embeddings"},
        )
        
        logger.info(f"Collection '{collection_name}' ready with {self.collection.count()} documents")
    
    def add(
        self,
        texts: List[str],
        embeddings: List[List[float]],
        metadatas: List[Dict],
        ids: Optional[List[str]] = None,
    ) -> None:
        """Add documents to the vector store."""
        if ids is None:
            ids = [f"doc_{i}" for i in range(len(texts))]
        
        logger.info(f"Adding {len(texts)} documents to vector store")
        
        self.collection.add(
            documents=texts,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids,
        )
    
    def search(
        self,
        query_embedding: List[float],
        top_k: int = None,
        filters: Optional[Dict] = None,
    ) -> Dict:
        """Search for similar documents."""
        top_k = top_k or settings.top_k
        
        where = None
        if filters:
            where = self._build_where_clause(filters)
        
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where=where,
        )
        
        return {
            "documents": results["documents"][0],
            "metadatas": results["metadatas"][0],
            "distances": results["distances"][0],
            "ids": results["ids"][0],
        }
    
    def _build_where_clause(self, filters: Dict) -> Dict:
        """Build ChromaDB where clause from filters."""
        # Example: {"release": "Release 17", "domain": "URLLC"}
        where = {}
        for key, value in filters.items():
            where[key] = value
        return where
    
    def delete_collection(self) -> None:
        """Delete the collection."""
        self.client.delete_collection(self.collection.name)
        logger.info(f"Deleted collection: {self.collection.name}")
    
    def count(self) -> int:
        """Get document count."""
        return self.collection.count()


# Global vector store instance
_vector_store = None


def get_vector_store() -> VectorStore:
    """Get or create global vector store instance."""
    global _vector_store
    if _vector_store is None:
        _vector_store = VectorStore()
    return _vector_store
