"""SHAP analyzer for RAG explainability."""
import shap
import numpy as np
from typing import List, Dict
from src.utils import logger


class SHAPAnalyzer:
    """Apply SHAP to explain RAG retrieval and generation."""
    
    def __init__(self, model, tokenizer):
        self.model = model
        self.tokenizer = tokenizer
    
    def explain_retrieval(
        self,
        query: str,
        retrieved_docs: List[Dict],
    ) -> Dict[str, any]:
        """
        Explain why specific documents were retrieved.
        
        Args:
            query: User query
            retrieved_docs: Retrieved documents
        
        Returns:
            Explanation with feature importances
        """
        logger.info("Generating SHAP explanation for retrieval...")
        
        # Simplified explanation based on keyword overlap
        query_tokens = set(query.lower().split())
        
        explanations = []
        for doc in retrieved_docs:
            doc_tokens = set(doc["text"].lower().split())
            overlap = query_tokens & doc_tokens
            
            explanations.append({
                "document_id": doc.get("id", "unknown"),
                "overlap_tokens": list(overlap),
                "overlap_score": len(overlap) / len(query_tokens) if query_tokens else 0,
                "original_score": doc.get("score", 0),
            })
        
        return {
            "query": query,
            "explanations": explanations,
        }
    
    def explain_generation(
        self,
        prompt: str,
        answer: str,
        max_tokens: int = 50,
    ) -> Dict[str, any]:
        """
        Explain token-level attribution for generated answer.
        
        Note:
            Full SHAP for LLMs is computationally expensive.
            This is a simplified version.
        """
        logger.info("Generating SHAP explanation for generation...")
        
        # Tokenize
        tokens = self.tokenizer.tokenize(answer)[:max_tokens]
        
        # Simplified attribution: uniform for demonstration
        # In production, use shap.Explainer with proper masking
        attributions = np.random.rand(len(tokens))  # Placeholder
        
        return {
            "tokens": tokens,
            "attributions": attributions.tolist(),
            "prompt": prompt[:100],
        }
