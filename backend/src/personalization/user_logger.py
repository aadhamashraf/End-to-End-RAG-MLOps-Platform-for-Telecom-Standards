"""Personalization package - User logging."""
from typing import Dict, List
from sqlalchemy.orm import Session
from src.database.crud import QueryCRUD
from src.utils import logger


class UserLogger:
    """Log and analyze user interactions."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_patterns(self, user_id: int) -> Dict[str, any]:
        """
        Extract user interaction patterns.
        
        Returns:
            Dict with domain frequencies, query topics, etc.
        """
        logger.info(f"Analyzing patterns for user {user_id}")
        
        # Get query history
        history = QueryCRUD.get_user_history(self.db, user_id, limit=100)
        
        if not history:
            return {"domains": {}, "query_count": 0}
        
        # Count domain occurrences
        domain_counts = {}
        for query in history:
            if query.metadata and "sources" in query.metadata:
                for source in query.metadata["sources"]:
                    domains = source.get("metadata", {}).get("domains", [])
                    for domain in domains:
                        domain_counts[domain] = domain_counts.get(domain, 0) + 1
        
        return {
            "domains": domain_counts,
            "query_count": len(history),
            "recent_topics": [q.question[:50] for q in history[:5]],
        }
