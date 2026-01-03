"""Feature extraction for personalization."""
from typing import List, Dict
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from src.utils import logger


class FeatureExtractor:
    """Extract features from user query history."""
    
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=100)
    
    def extract_query_features(self, queries: List[str]) -> np.ndarray:
        """Extract TF-IDF features from queries."""
        if not queries:
            return np.array([])
        
        logger.info(f"Extracting features from {len(queries)} queries")
        
        try:
            features = self.vectorizer.fit_transform(queries)
            return features.toarray()
        except:
            return np.array([])
    
    def extract_domain_features(self, domain_counts: Dict[str, int]) -> np.ndarray:
        """Convert domain counts to feature vector."""
        # Predefined domain list
        domains = ["URLLC", "eMBB", "mMTC", "V2X", "Network Slicing", "5G Core"]
        
        features = []
        total = sum(domain_counts.values()) if domain_counts else 1
        
        for domain in domains:
            count = domain_counts.get(domain, 0)
            features.append(count / total)
        
        return np.array(features)
