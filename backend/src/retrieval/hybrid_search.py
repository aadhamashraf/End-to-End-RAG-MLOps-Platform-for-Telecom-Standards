"""Hybrid search combining semantic and keyword retrieval."""
from typing import List, Dict
from rank_bm25 import BM25Okapi
from src.utils import logger


class HybridSearch:
    """Combine vector similarity search with BM25 keyword search."""
    
    def __init__(self, alpha: float = 0.5):
        """
        Initialize hybrid search.
        
        Args:
            alpha: Weight for semantic search (1-alpha for keyword search)
        """
        self.alpha = alpha
        self.bm25 = None
        self.corpus = []
        self.corpus_metadata = []
    
    def index_corpus(self, documents: List[str], metadatas: List[Dict]) -> None:
        """Index documents for BM25 search."""
        logger.info(f"Indexing {len(documents)} documents for BM25")
        
        self.corpus = documents
        self.corpus_metadata = metadatas
        
        # Tokenize documents
        tokenized_corpus = [doc.lower().split() for doc in documents]
        self.bm25 = BM25Okapi(tokenized_corpus)
    
    def search(
        self,
        query: str,
        semantic_results: Dict,
        top_k: int = 5,
    ) -> List[Dict]:
        """
        Perform hybrid search using RRF (Reciprocal Rank Fusion).
        
        Args:
            query: Search query
            semantic_results: Results from vector search
            top_k: Number of results to return
        
        Returns:
            Fused and re-ranked results
        """
        if self.bm25 is None:
            logger.warning("BM25 not indexed, returning semantic results only")
            return self._format_semantic_results(semantic_results)
        
        # BM25 keyword search
        tokenized_query = query.lower().split()
        bm25_scores = self.bm25.get_scores(tokenized_query)
        
        # Get top BM25 results
        bm25_ranked = sorted(
            enumerate(bm25_scores),
            key=lambda x: x[1],
            reverse=True,
        )[:top_k * 2]  # Get more for fusion
        
        # Reciprocal Rank Fusion
        fused_scores = {}
        k = 60  # RRF constant
        
        # Add semantic scores
        for rank, doc_id in enumerate(semantic_results["ids"]):
            fused_scores[doc_id] = fused_scores.get(doc_id, 0) + self.alpha / (k + rank + 1)
        
        # Add BM25 scores
        for rank, (idx, score) in enumerate(bm25_ranked):
            doc_id = f"doc_{idx}"
            fused_scores[doc_id] = fused_scores.get(doc_id, 0) + (1 - self.alpha) / (k + rank + 1)
        
        # Sort by fused score
        ranked_ids = sorted(fused_scores.items(), key=lambda x: x[1], reverse=True)[:top_k]
        
        # Format results
        results = []
        for doc_id, score in ranked_ids:
            if doc_id in semantic_results["ids"]:
                idx = semantic_results["ids"].index(doc_id)
                results.append({
                    "id": doc_id,
                    "text": semantic_results["documents"][idx],
                    "metadata": semantic_results["metadatas"][idx],
                    "score": score,
                })
        
        logger.info(f"Hybrid search returned {len(results)} results")
        return results
    
    def _format_semantic_results(self, semantic_results: Dict) -> List[Dict]:
        """Format semantic-only results."""
        results = []
        for i in range(len(semantic_results["ids"])):
            results.append({
                "id": semantic_results["ids"][i],
                "text": semantic_results["documents"][i],
                "metadata": semantic_results["metadatas"][i],
                "score": 1.0 / (1.0 + semantic_results["distances"][i]),
            })
        return results
