"""Ranking model for personalized retrieval."""
from typing import List, Dict
import numpy as np
from lightgbm import LGBMRanker
from src.utils import logger


class RankingModel:
    """Re-rank retrieval results based on user preferences."""
    
    def __init__(self):
        self.model = LGBMRanker(
            objective="lambdarank",
            metric="ndcg",
            n_estimators=100,
            learning_rate=0.1,
        )
        self.is_trained = False
    
    def train(
        self,
        X: np.ndarray,
        y: np.ndarray,
        group: List[int],
    ) -> None:
        """
        Train ranking model.
        
        Args:
            X: Feature matrix (n_samples, n_features)
            y: Relevance labels (n_samples,)
            group: Query group sizes (n_queries,)
        """
        logger.info("Training ranking model...")
        
        self.model.fit(X, y, group=group)
        self.is_trained = True
        
        logger.info("Ranking model trained")
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Predict relevance scores."""
        if not self.is_trained:
            logger.warning("Model not trained, returning zeros")
            return np.zeros(len(X))
        
        return self.model.predict(X)
    
    def rerank(
        self,
        results: List[Dict],
        user_features: np.ndarray,
    ) -> List[Dict]:
        """
        Re-rank results based on user features.
        
        Args:
            results: List of retrieval results
            user_features: User feature vector
        
        Returns:
            Re-ranked results
        """
        if not self.is_trained or not results:
            return results
        
        # Create features for each result
        # Simplified: combine result score with user domain preferences
        features = []
        for result in results:
            result_features = [
                result.get("score", 0.0),
                len(result.get("text", "")),
            ]
            # Append user features
            features.append(result_features + user_features.tolist())
        
        X = np.array(features)
        scores = self.predict(X)
        
        # Sort by predicted scores
        ranked_indices = np.argsort(scores)[::-1]
        reranked = [results[i] for i in ranked_indices]
        
        logger.info("Results re-ranked")
        return reranked
