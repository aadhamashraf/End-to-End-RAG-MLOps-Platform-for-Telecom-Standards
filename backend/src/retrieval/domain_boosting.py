"""Domain-based boosting for personalized retrieval."""
from typing import List, Dict
from src.utils import logger


class DomainBooster:
    """Boost retrieval results based on user domain preferences."""
    
    def __init__(self, user_preferences: Dict[str, float] = None):
        """
        Initialize domain booster.
        
        Args:
            user_preferences: Dict mapping domain to boost weight
                             Example: {"URLLC": 1.5, "eMBB": 0.8}
        """
        self.user_preferences = user_preferences or {}
    
    def boost(self, results: List[Dict]) -> List[Dict]:
        """Apply domain boosting to results."""
        if not self.user_preferences:
            return results
        
        logger.info(f"Applying domain boosting with preferences: {self.user_preferences}")
        
        boosted_results = []
        for result in results:
            metadata = result.get("metadata", {})
            domains = metadata.get("domains", [])
            
            # Calculate boost factor
            boost_factor = 1.0
            for domain in domains:
                if domain in self.user_preferences:
                    boost_factor *= self.user_preferences[domain]
            
            # Apply boost to score
            boosted_score = result["score"] * boost_factor
            
            boosted_results.append({
                **result,
                "score": boosted_score,
                "boost_factor": boost_factor,
            })
        
        # Re-sort by boosted score
        boosted_results.sort(key=lambda x: x["score"], reverse=True)
        
        return boosted_results
    
    def update_preferences(self, domain: str, weight: float) -> None:
        """Update user preference for a domain."""
        self.user_preferences[domain] = weight
        logger.info(f"Updated preference: {domain} = {weight}")


def create_user_preferences(query_history: List[Dict]) -> Dict[str, float]:
    """
    Create user preferences from query history.
    
    Args:
        query_history: List of past queries with metadata
    
    Returns:
        Domain preference weights
    """
    domain_counts = {}
    total_queries = len(query_history)
    
    if total_queries == 0:
        return {}
    
    # Count domain occurrences
    for query in query_history:
        domains = query.get("domains", [])
        for domain in domains:
            domain_counts[domain] = domain_counts.get(domain, 0) + 1
    
    # Calculate weights (frequency-based)
    preferences = {}
    for domain, count in domain_counts.items():
        frequency = count / total_queries
        # Boost weight: 1.0 + frequency (max 2.0)
        preferences[domain] = 1.0 + min(frequency, 1.0)
    
    logger.info(f"Generated user preferences: {preferences}")
    return preferences
