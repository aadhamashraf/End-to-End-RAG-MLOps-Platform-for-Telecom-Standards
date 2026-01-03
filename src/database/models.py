"""Database models for Auto-Standard."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class User(Base):
    """User model."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    queries = relationship("Query", back_populates="user")
    feedback = relationship("Feedback", back_populates="user")


class Query(Base):
    """Query history model."""
    __tablename__ = "queries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text)
    context = Column(Text)
    metadata = Column(JSON)  # Retrieved docs metadata
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    user = relationship("User", back_populates="queries")
    feedback = relationship("Feedback", back_populates="query", uselist=False)


class Document(Base):
    """Ingested documents model."""
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    spec_id = Column(String(50), index=True)
    release = Column(String(50), index=True)
    domains = Column(JSON)  # List of domains
    total_chunks = Column(Integer)
    ingested_at = Column(DateTime, default=datetime.utcnow)
    file_hash = Column(String(64), unique=True)  # For deduplication


class Feedback(Base):
    """User feedback model."""
    __tablename__ = "feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    query_id = Column(Integer, ForeignKey("queries.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer)  # 1-5 stars
    helpful = Column(Integer)  # 1=helpful, 0=not helpful, -1=harmful
    comment = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    query = relationship("Query", back_populates="feedback")
    user = relationship("User", back_populates="feedback")


class Experiment(Base):
    """MLOps experiment tracking."""
    __tablename__ = "experiments"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    run_id = Column(String(100), unique=True)
    params = Column(JSON)
    metrics = Column(JSON)
    model_path = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50))  # running, completed, failed
