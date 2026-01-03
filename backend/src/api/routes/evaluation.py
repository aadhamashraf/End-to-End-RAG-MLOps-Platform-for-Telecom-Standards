from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from src.database.models import Experiment, Feedback, Query
from src.database.crud import ExperimentCRUD, FeedbackCRUD
from typing import List, Dict, Any

router = APIRouter(prefix="/evaluation", tags=["evaluation"])

@router.get("/runs")
async def get_evaluation_runs(db: Session = Depends(get_db)):
    """
    Get all evaluation runs (experiments).
    """
    experiments = db.query(Experiment).order_by(Experiment.created_at.desc()).all()
    
    # Format for frontend
    # Frontend expects: { id, date, datasetVersion, modelVersion, accuracy, faithfulness, hallucinationRate, status }
    runs = []
    for exp in experiments:
        metrics = exp.metrics or {}
        runs.append({
            "id": exp.run_id or str(exp.id),
            "date": exp.created_at.strftime("%Y-%m-%d"),
            "datasetVersion": exp.params.get("dataset_version", "unknown"),
            "modelVersion": exp.params.get("model_version", "unknown"),
            "accuracy": metrics.get("accuracy", 0),
            "faithfulness": metrics.get("faithfulness", 0),
            "hallucinationRate": metrics.get("hallucination_rate", 0),
            "status": exp.status
        })
        
    # If no runs, return empty list (frontend handles empty?)
    # Or return dummy if truly empty for demo?
    # Let's return real db data. If empty, it's empty.
    
    return runs

@router.get("/failures")
async def get_failure_examples(db: Session = Depends(get_db)):
    """
    Get failure examples based on negative feedback or low scores.
    """
    # Find feedback with rating < 3 or helpful = 0/-1
    feedbacks = db.query(Feedback).filter(
        (Feedback.rating < 3) | (Feedback.helpful <= 0)
    ).order_by(Feedback.created_at.desc()).limit(10).all()
    
    failures = []
    for f in feedbacks:
        query = f.query
        if query:
            failures.append({
                "id": str(f.id),
                "query": query.question,
                "expectedAnswer": "N/A (User Feedback)", # We might not have expected answer in live query
                "actualAnswer": query.answer,
                "issue": f.comment or "Negative user feedback",
                "severity": "medium", # specialized logic needed
                "missingCitation": "Unknown"
            })
            
    return failures
