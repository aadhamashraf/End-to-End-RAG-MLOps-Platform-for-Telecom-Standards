"""Experiment tracking with MLflow."""
import mlflow
from typing import Dict, Any
from src.utils import settings, logger


class ExperimentTracker:
    """Track experiments using MLflow."""
    
    def __init__(self, experiment_name: str = "auto-standard"):
        mlflow.set_tracking_uri(settings.mlflow_tracking_uri)
        mlflow.set_experiment(experiment_name)
        self.experiment_name = experiment_name
        logger.info(f"Initialized MLflow experiment: {experiment_name}")
    
    def start_run(self, run_name: str = None) -> str:
        """Start a new MLflow run."""
        run = mlflow.start_run(run_name=run_name)
        logger.info(f"Started MLflow run: {run.info.run_id}")
        return run.info.run_id
    
    def log_params(self, params: Dict[str, Any]) -> None:
        """Log parameters."""
        mlflow.log_params(params)
        logger.info(f"Logged {len(params)} parameters")
    
    def log_metrics(self, metrics: Dict[str, float], step: int = None) -> None:
        """Log metrics."""
        mlflow.log_metrics(metrics, step=step)
        logger.info(f"Logged {len(metrics)} metrics")
    
    def log_artifact(self, artifact_path: str) -> None:
        """Log artifact file."""
        mlflow.log_artifact(artifact_path)
        logger.info(f"Logged artifact: {artifact_path}")
    
    def log_model(self, model, artifact_path: str = "model") -> None:
        """Log model."""
        mlflow.pytorch.log_model(model, artifact_path)
        logger.info(f"Logged model to: {artifact_path}")
    
    def end_run(self) -> None:
        """End current run."""
        mlflow.end_run()
        logger.info("Ended MLflow run")
    
    def log_experiment(
        self,
        params: Dict[str, Any],
        metrics: Dict[str, float],
        artifacts: Dict[str, str] = None,
        run_name: str = None,
    ) -> str:
        """
        Log a complete experiment.
        
        Args:
            params: Hyperparameters and config
            metrics: Evaluation metrics
            artifacts: Dict of artifact_name: artifact_path
            run_name: Optional run name
        
        Returns:
            Run ID
        """
        run_id = self.start_run(run_name)
        
        self.log_params(params)
        self.log_metrics(metrics)
        
        if artifacts:
            for artifact_path in artifacts.values():
                self.log_artifact(artifact_path)
        
        self.end_run()
        
        return run_id


# Weights & Biases integration (alternative)
class WandBTracker:
    """Track experiments using Weights & Biases."""
    
    def __init__(self, project_name: str = "auto-standard"):
        import wandb
        
        wandb.login(key=settings.wandb_api_key)
        self.project_name = project_name
        self.wandb = wandb
        logger.info(f"Initialized W&B project: {project_name}")
    
    def init_run(self, config: Dict[str, Any], run_name: str = None):
        """Initialize W&B run."""
        self.wandb.init(
            project=self.project_name,
            name=run_name,
            config=config,
        )
    
    def log(self, metrics: Dict[str, float], step: int = None) -> None:
        """Log metrics."""
        self.wandb.log(metrics, step=step)
    
    def finish(self) -> None:
        """Finish run."""
        self.wandb.finish()
