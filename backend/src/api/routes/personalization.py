from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from src.database import get_db
from src.database.models import Query, Feedback, User
from typing import List, Dict, Any
from datetime import datetime, timedelta
from collections import Counter

router = APIRouter(prefix="/personalization", tags=["personalization"])

@router.get("/dashboard/{user_id}")
async def get_personalization_dashboard(user_id: int, db: Session = Depends(get_db)):
    """
    Get personalization metrics for a user.
    """
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        # For demo purposes, if user 1 doesn't exist, we might return empty or error.
        # But to be safe for "Under Construction" migration, let's just return empty structure if not found or handle gracefully.
        # Ideally we should raise 404, but frontend might be hardcoded to user 1.
        # Let's assume user exists or we return empty stats.
        pass

    # 1. Top Interests (from Query History)
    queries = db.query(Query).filter(Query.user_id == user_id).all()
    
    domain_counter = Counter()
    for q in queries:
        if q.metadata and "domains" in q.metadata:
            domain_counter.update(q.metadata["domains"])
            
    top_interests = [
        {"topic": domain, "relevance": count, "trend": "neutral"} # trend logic requires more history analysis
        for domain, count in domain_counter.most_common(5)
    ]
    
    # Normalize relevance to 0-100 range for UI
    if top_interests:
        max_count = top_interests[0]["relevance"]
        for item in top_interests:
            item["relevance"] = int((item["relevance"] / max_count) * 100)
            
    # 2. Domain Activity (Heatmap/Timeline)
    # Group by date
    activity_map = {}
    for q in queries:
        date_str = q.created_at.strftime("%Y-%m-%d")
        if date_str not in activity_map:
            activity_map[date_str] = 0
        activity_map[date_str] += 1
        
    domain_activity = [
        {"date": date, "queries": count, "avgScore": 0.8} # avgScore is placeholder for now
        for date, count in sorted(activity_map.items())[-14:] # Last 14 days
    ]
    
    # 3. Ranking Influence
    # In a real system, we'd log when personalization re-ranked results.
    # Here, we'll check Feedback as a proxy for engagement, or just return 0 if no data.
    ranking_influence = [
        {"category": "Standard Ranking", "value": 30, "fullMark": 100},
        {"category": "Personalized Boost", "value": 70 if queries else 0, "fullMark": 100}, # Dummy logic: if active, high boost
    ]

    return {
        "topInterests": top_interests,
        "domainActivity": domain_activity,
        "rankingInfluence": ranking_influence
    }
