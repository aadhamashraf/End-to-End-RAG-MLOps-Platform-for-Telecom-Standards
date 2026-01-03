"""Evaluate model on test set."""
import sys
import json
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.generation import get_model_loader, RAGInference
from src.mlops import LLMJudge, MetricsCalculator
from src.utils import logger


def evaluate_model(test_set_path: str):
    """Evaluate RAG model on test set."""
    logger.info(f"Loading test set from {test_set_path}")
    
    # Load test cases
    with open(test_set_path, 'r') as f:
        test_cases = json.load(f)
    
    logger.info(f"Loaded {len(test_cases)} test cases")
    
    # Initialize RAG
    model_loader = get_model_loader()
    rag = RAGInference(
        model=model_loader.model,
        tokenizer=model_loader.tokenizer,
    )
    
    # Initialize evaluator
    judge = LLMJudge()
    
    # Run evaluation
    results = []
    for i, case in enumerate(test_cases, 1):
        logger.info(f"Evaluating case {i}/{len(test_cases)}")
        
        # Generate answer
        response = rag.query(
            question=case["question"],
            top_k=5,
            return_sources=True,
        )
        
        # Evaluate
        scores = judge.evaluate_answer(
            question=case["question"],
            answer=response["answer"],
            context=str(response.get("sources", [])),
            ground_truth=case.get("ground_truth"),
        )
        
        results.append({
            "question": case["question"],
            "answer": response["answer"],
            "scores": scores,
        })
    
    # Aggregate metrics
    avg_scores = {}
    for key in results[0]["scores"].keys():
        avg_scores[f"avg_{key}"] = sum(r["scores"][key] for r in results) / len(results)
    
    logger.info("=" * 50)
    logger.info("EVALUATION RESULTS")
    logger.info("=" * 50)
    for key, value in avg_scores.items():
        logger.info(f"{key}: {value:.3f}")
    
    # Save results
    output_path = Path("evaluation_results.json")
    with open(output_path, 'w') as f:
        json.dump({
            "metrics": avg_scores,
            "detailed_results": results,
        }, f, indent=2)
    
    logger.info(f"Results saved to {output_path}")
    
    return avg_scores


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Evaluate RAG model")
    parser.add_argument("--test-set", required=True, help="Path to test set JSON")
    
    args = parser.parse_args()
    
    evaluate_model(args.test_set)
