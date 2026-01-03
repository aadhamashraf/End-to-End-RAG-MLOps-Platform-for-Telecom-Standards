"""CRUD operations for database."""
from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from src.database.models import User, Query, Document, Feedback, Experiment
from datetime import datetime


class UserCRUD:
    """CRUD operations for users."""
    
    @staticmethod
    def create(db: Session, username: str, email: str) -> User:
        """Create a new user."""
        user = User(username=username, email=email)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def get_by_username(db: Session, username: str) -> Optional[User]:
        """Get user by username."""
        return db.query(User).filter(User.username == username).first()
    
    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID."""
        return db.query(User).filter(User.id == user_id).first()


class QueryCRUD:
    """CRUD operations for queries."""
    
    @staticmethod
    def create(
        db: Session,
        user_id: int,
        question: str,
        answer: str,
        context: str = None,
        metadata: Dict = None,
    ) -> Query:
        """Create a new query record."""
        query = Query(
            user_id=user_id,
            question=question,
            answer=answer,
            context=context,
            metadata=metadata or {},
        )
        db.add(query)
        db.commit()
        db.refresh(query)
        return query
    
    @staticmethod
    def get_user_history(db: Session, user_id: int, limit: int = 50) -> List[Query]:
        """Get user query history."""
        return (
            db.query(Query)
            .filter(Query.user_id == user_id)
            .order_by(Query.created_at.desc())
            .limit(limit)
            .all()
        )
    
    @staticmethod
    def get_by_id(db: Session, query_id: int) -> Optional[Query]:
        """Get query by ID."""
        return db.query(Query).filter(Query.id == query_id).first()


class DocumentCRUD:
    """CRUD operations for documents."""
    
    @staticmethod
    def create(
        db: Session,
        filename: str,
        spec_id: str,
        release: str,
        domains: List[str],
        total_chunks: int,
        file_hash: str,
    ) -> Document:
        """Create a new document record."""
        doc = Document(
            filename=filename,
            spec_id=spec_id,
            release=release,
            domains=domains,
            total_chunks=total_chunks,
            file_hash=file_hash,
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        return doc
    
    @staticmethod
    def get_by_hash(db: Session, file_hash: str) -> Optional[Document]:
        """Get document by file hash."""
        return db.query(Document).filter(Document.file_hash == file_hash).first()
    
    @staticmethod
    def list_all(db: Session) -> List[Document]:
        """List all documents."""
        return db.query(Document).order_by(Document.ingested_at.desc()).all()


class FeedbackCRUD:
    """CRUD operations for feedback."""
    
    @staticmethod
    def create(
        db: Session,
        query_id: int,
        user_id: int,
        rating: int = None,
        helpful: int = None,
        comment: str = None,
    ) -> Feedback:
        """Create feedback."""
        feedback = Feedback(
            query_id=query_id,
            user_id=user_id,
            rating=rating,
            helpful=helpful,
            comment=comment,
        )
        db.add(feedback)
        db.commit()
        db.refresh(feedback)
        return feedback


class ExperimentCRUD:
    """CRUD operations for experiments."""
    
    @staticmethod
    def create(
        db: Session,
        name: str,
        run_id: str,
        params: Dict,
        metrics: Dict,
        model_path: str = None,
        status: str = "running",
    ) -> Experiment:
        """Create experiment record."""
        exp = Experiment(
            name=name,
            run_id=run_id,
            params=params,
            metrics=metrics,
            model_path=model_path,
            status=status,
        )
        db.add(exp)
        db.commit()
        db.refresh(exp)
        return exp
    
    @staticmethod
    def update_status(db: Session, run_id: str, status: str) -> None:
        """Update experiment status."""
        db.query(Experiment).filter(Experiment.run_id == run_id).update({"status": status})
        db.commit()
