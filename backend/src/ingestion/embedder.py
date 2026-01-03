"""Embedding generation for telecom text."""
from typing import List
import torch
from sentence_transformers import SentenceTransformer
from src.utils import settings, logger


class Embedder:
    """Generate embeddings for text chunks."""
    
    def __init__(self, model_name: str = None):
        self.model_name = model_name or settings.embedding_model
        logger.info(f"Loading embedding model: {self.model_name}")
        self.model = SentenceTransformer(self.model_name)
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model.to(self.device)
        logger.info(f"Embedder using device: {self.device}")
    
    def embed(self, texts: List[str], batch_size: int = 32) -> List[List[float]]:
        """Generate embeddings for a list of texts."""
        logger.info(f"Generating embeddings for {len(texts)} texts")
        
        embeddings = self.model.encode(
            texts,
            batch_size=batch_size,
            show_progress_bar=True,
            convert_to_numpy=True,
        )
        
        return embeddings.tolist()
    
    def embed_query(self, query: str) -> List[float]:
        """Generate embedding for a single query."""
        embedding = self.model.encode(query, convert_to_numpy=True)
        return embedding.tolist()


# Global embedder instance
_embedder = None


def get_embedder() -> Embedder:
    """Get or create global embedder instance."""
    global _embedder
    if _embedder is None:
        _embedder = Embedder()
    return _embedder
