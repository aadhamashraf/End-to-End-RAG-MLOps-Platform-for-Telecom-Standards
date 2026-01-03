"""Custom metrics for RAG evaluation."""
from typing import List, Dict
import numpy as np
from sklearn.metrics import precision_score, recall_score, f1_score


def retrieval_precision_at_k(retrieved_docs: List[str], relevant_docs: List[str], k: int = 5) -> float:
    """Calculate precision@k for retrieval."""
    retrieved_k = retrieved_docs[:k]
    relevant_retrieved = len(set(retrieved_k) & set(relevant_docs))
    return relevant_retrieved / k if k > 0 else 0.0


def retrieval_recall_at_k(retrieved_docs: List[str], relevant_docs: List[str], k: int = 5) -> float:
    """Calculate recall@k for retrieval."""
    retrieved_k = retrieved_docs[:k]
    relevant_retrieved = len(set(retrieved_k) & set(relevant_docs))
    return relevant_retrieved / len(relevant_docs) if len(relevant_docs) > 0 else 0.0


def mean_reciprocal_rank(retrieved_docs: List[str], relevant_docs: List[str]) -> float:
    """Calculate MRR for retrieval."""
    for i, doc in enumerate(retrieved_docs, 1):
        if doc in relevant_docs:
            return 1.0 / i
    return 0.0


def answer_f1_score(predicted: str, ground_truth: str) -> float:
    """Calculate token-level F1 score for answers."""
    pred_tokens = set(predicted.lower().split())
    truth_tokens = set(ground_truth.lower().split())
    
    if len(pred_tokens) == 0 or len(truth_tokens) == 0:
        return 0.0
    
    common = pred_tokens & truth_tokens
    
    if len(common) == 0:
        return 0.0
    
    precision = len(common) / len(pred_tokens)
    recall = len(common) / len(truth_tokens)
    
    f1 = 2 * (precision * recall) / (precision + recall)
    return f1


def citation_accuracy(answer: str, retrieved_docs: List[Dict]) -> float:
    """
    Evaluate if citations in answer match retrieved documents.
    
    Returns:
        Ratio of valid citations
    """
    # Extract citation markers from answer
    import re
    citations = re.findall(r'\[Source (\d+)', answer)
    
    if not citations:
        return 0.0
    
    valid_citations = 0
    for citation in citations:
        idx = int(citation) - 1
        if 0 <= idx < len(retrieved_docs):
            valid_citations += 1
    
    return valid_citations / len(citations)


class MetricsCalculator:
    """Calculate comprehensive metrics for RAG system."""
    
    @staticmethod
    def calculate_retrieval_metrics(
        retrieved_docs: List[str],
        relevant_docs: List[str],
        k_values: List[int] = [1, 3, 5, 10],
    ) -> Dict[str, float]:
        """Calculate all retrieval metrics."""
        metrics = {}
        
        for k in k_values:
            metrics[f"precision@{k}"] = retrieval_precision_at_k(retrieved_docs, relevant_docs, k)
            metrics[f"recall@{k}"] = retrieval_recall_at_k(retrieved_docs, relevant_docs, k)
        
        metrics["mrr"] = mean_reciprocal_rank(retrieved_docs, relevant_docs)
        
        return metrics
    
    @staticmethod
    def calculate_generation_metrics(
        predicted: str,
        ground_truth: str,
        retrieved_docs: List[Dict] = None,
    ) -> Dict[str, float]:
        """Calculate generation quality metrics."""
        metrics = {
            "answer_f1": answer_f1_score(predicted, ground_truth),
            "answer_length": len(predicted.split()),
        }
        
        if retrieved_docs:
            metrics["citation_accuracy"] = citation_accuracy(predicted, retrieved_docs)
        
        return metrics
    
    @staticmethod
    def calculate_all_metrics(
        retrieved_docs: List[str],
        relevant_docs: List[str],
        predicted_answer: str,
        ground_truth_answer: str,
        retrieved_doc_objects: List[Dict] = None,
    ) -> Dict[str, float]:
        """Calculate all metrics."""
        metrics = {}
        
        # Retrieval metrics
        metrics.update(
            MetricsCalculator.calculate_retrieval_metrics(retrieved_docs, relevant_docs)
        )
        
        # Generation metrics
        metrics.update(
            MetricsCalculator.calculate_generation_metrics(
                predicted_answer,
                ground_truth_answer,
                retrieved_doc_objects,
            )
        )
        
        return metrics
