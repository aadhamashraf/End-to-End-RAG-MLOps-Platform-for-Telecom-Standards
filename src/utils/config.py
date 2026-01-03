"""Configuration management for Auto-Standard platform."""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    database_url: str = "postgresql://user:password@localhost:5432/autostandard"
    vector_db_path: str = "./data/embeddings/chroma"
    
    # Model paths
    model_path: str = "./models"
    base_model: str = "microsoft/Phi-3-mini-4k-instruct"
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    hf_token: Optional[str] = None
    
    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    
    # MLOps
    mlflow_tracking_uri: str = "http://localhost:5000"
    wandb_api_key: Optional[str] = None
    
    # LLM-as-Judge
    judge_model: str = "gpt-4"
    openai_api_key: Optional[str] = None
    
    # Retrieval
    top_k: int = 5
    chunk_size: int = 512
    chunk_overlap: int = 50
    
    # Deployment
    environment: str = "development"
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
