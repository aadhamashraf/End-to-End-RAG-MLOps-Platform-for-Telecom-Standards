"""LLM-as-Judge evaluation system."""
from typing import List, Dict
import openai
from src.utils import settings, logger


class LLMJudge:
    """Evaluate RAG outputs using LLM-as-a-Judge."""
    
    def __init__(self, judge_model: str = None):
        self.judge_model = judge_model or settings.judge_model
        openai.api_key = settings.openai_api_key
        logger.info(f"Initialized LLM Judge with model: {self.judge_model}")
    
    def evaluate_answer(
        self,
        question: str,
        answer: str,
        context: str,
        ground_truth: str = None,
    ) -> Dict[str, float]:
        """
        Evaluate a single answer across multiple dimensions.
        
        Returns:
            Dict with scores for relevance, accuracy, groundedness, citation_quality
        """
        logger.info("Evaluating answer with LLM Judge...")
        
        scores = {}
        
        # 1. Relevance: Does the answer address the question?
        scores["relevance"] = self._evaluate_relevance(question, answer)
        
        # 2. Groundedness: Is the answer supported by the context?
        scores["groundedness"] = self._evaluate_groundedness(answer, context)
        
        # 3. Accuracy: If ground truth available, how accurate?
        if ground_truth:
            scores["accuracy"] = self._evaluate_accuracy(answer, ground_truth)
        
        # 4. Citation quality: Are sources properly referenced?
        scores["citation_quality"] = self._evaluate_citations(answer, context)
        
        # Overall score
        scores["overall"] = sum(scores.values()) / len(scores)
        
        return scores
    
    def _evaluate_relevance(self, question: str, answer: str) -> float:
        """Evaluate if answer is relevant to question."""
        prompt = f"""Rate how well the answer addresses the question on a scale of 0-10.

Question: {question}

Answer: {answer}

Provide only a number between 0 and 10."""
        
        score = self._get_score(prompt)
        return score / 10.0
    
    def _evaluate_groundedness(self, answer: str, context: str) -> float:
        """Evaluate if answer is grounded in context."""
        prompt = f"""Rate how well the answer is supported by the provided context on a scale of 0-10.
The answer should not contain information not present in the context.

Context: {context[:1000]}...

Answer: {answer}

Provide only a number between 0 and 10."""
        
        score = self._get_score(prompt)
        return score / 10.0
    
    def _evaluate_accuracy(self, answer: str, ground_truth: str) -> float:
        """Evaluate accuracy against ground truth."""
        prompt = f"""Rate how accurate the answer is compared to the ground truth on a scale of 0-10.

Ground Truth: {ground_truth}

Answer: {answer}

Provide only a number between 0 and 10."""
        
        score = self._get_score(prompt)
        return score / 10.0
    
    def _evaluate_citations(self, answer: str, context: str) -> float:
        """Evaluate citation quality."""
        # Simplified: check if answer references sources
        has_citations = any(marker in answer for marker in ["[Source", "TS ", "TR "])
        return 1.0 if has_citations else 0.5
    
    def _get_score(self, prompt: str) -> float:
        """Get score from LLM."""
        try:
            response = openai.chat.completions.create(
                model=self.judge_model,
                messages=[
                    {"role": "system", "content": "You are an expert evaluator. Provide only numerical scores."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.0,
                max_tokens=10,
            )
            
            score_text = response.choices[0].message.content.strip()
            score = float(score_text)
            return max(0, min(10, score))  # Clamp to 0-10
            
        except Exception as e:
            logger.error(f"Error getting score from LLM: {e}")
            return 5.0  # Default middle score
    
    def evaluate_batch(
        self,
        test_cases: List[Dict],
    ) -> Dict[str, float]:
        """
        Evaluate a batch of test cases.
        
        Args:
            test_cases: List of dicts with 'question', 'answer', 'context', 'ground_truth'
        
        Returns:
            Aggregated metrics
        """
        logger.info(f"Evaluating batch of {len(test_cases)} test cases...")
        
        all_scores = []
        
        for i, case in enumerate(test_cases, 1):
            logger.info(f"Evaluating case {i}/{len(test_cases)}")
            
            scores = self.evaluate_answer(
                question=case["question"],
                answer=case["answer"],
                context=case.get("context", ""),
                ground_truth=case.get("ground_truth"),
            )
            
            all_scores.append(scores)
        
        # Aggregate scores
        aggregated = {}
        for key in all_scores[0].keys():
            aggregated[f"avg_{key}"] = sum(s[key] for s in all_scores) / len(all_scores)
        
        logger.info(f"Batch evaluation complete: {aggregated}")
        return aggregated
