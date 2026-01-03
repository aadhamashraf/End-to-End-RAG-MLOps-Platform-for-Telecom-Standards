"""RAG inference pipeline."""
import torch
from typing import List, Dict
from src.ingestion import get_embedder
from src.retrieval import get_vector_store, HybridSearch, DomainBooster
from src.utils import logger


class RAGInference:
    """End-to-end RAG inference pipeline."""
    
    def __init__(self, model, tokenizer, use_hybrid: bool = True):
        self.model = model
        self.tokenizer = tokenizer
        self.embedder = get_embedder()
        self.vector_store = get_vector_store()
        self.use_hybrid = use_hybrid
        
        if use_hybrid:
            self.hybrid_search = HybridSearch(alpha=0.7)
        
        self.domain_booster = None
        
        logger.info("RAG inference pipeline initialized")
    
    def set_user_preferences(self, preferences: Dict[str, float]) -> None:
        """Set user domain preferences for boosting."""
        self.domain_booster = DomainBooster(preferences)
    
    def query(
        self,
        question: str,
        top_k: int = 5,
        filters: Dict = None,
        return_sources: bool = True,
    ) -> Dict:
        """
        Execute RAG query.
        
        Args:
            question: User question
            top_k: Number of documents to retrieve
            filters: Metadata filters
            return_sources: Include source documents in response
        
        Returns:
            Dict with answer and optional sources
        """
        logger.info(f"Processing query: {question[:100]}...")
        
        # 1. Embed query
        query_embedding = self.embedder.embed_query(question)
        
        # 2. Retrieve relevant documents
        semantic_results = self.vector_store.search(
            query_embedding=query_embedding,
            top_k=top_k * 2 if self.use_hybrid else top_k,
            filters=filters,
        )
        
        # 3. Apply hybrid search if enabled
        if self.use_hybrid:
            results = self.hybrid_search.search(
                query=question,
                semantic_results=semantic_results,
                top_k=top_k,
            )
        else:
            results = self._format_results(semantic_results)[:top_k]
        
        # 4. Apply domain boosting if configured
        if self.domain_booster:
            results = self.domain_booster.boost(results)[:top_k]
        
        # 5. Generate answer
        context = self._build_context(results)
        answer = self._generate_answer(question, context)
        
        response = {
            "answer": answer,
            "question": question,
        }
        
        if return_sources:
            response["sources"] = [
                {
                    "text": r["text"][:200] + "...",
                    "metadata": r["metadata"],
                    "score": r["score"],
                }
                for r in results
            ]
        
        return response
    
    def _format_results(self, semantic_results: Dict) -> List[Dict]:
        """Format semantic results."""
        results = []
        for i in range(len(semantic_results["ids"])):
            results.append({
                "id": semantic_results["ids"][i],
                "text": semantic_results["documents"][i],
                "metadata": semantic_results["metadatas"][i],
                "score": 1.0 / (1.0 + semantic_results["distances"][i]),
            })
        return results
    
    def _build_context(self, results: List[Dict]) -> str:
        """Build context from retrieved documents."""
        context_parts = []
        
        for i, result in enumerate(results, 1):
            metadata = result["metadata"]
            spec_id = metadata.get("spec_id", "Unknown")
            release = metadata.get("release", "Unknown")
            
            context_parts.append(
                f"[Source {i}: {spec_id}, {release}]\n{result['text']}\n"
            )
        
        return "\n".join(context_parts)
    
    def _generate_answer(self, question: str, context: str) -> str:
        """Generate answer using LLM."""
        prompt = f"""You are an expert in 3GPP and ITU-T telecom standards. Answer the question based on the provided context. If the context doesn't contain enough information, say so.

### Context:
{context}

### Question:
{question}

### Answer:
"""
        
        inputs = self.tokenizer(
            prompt,
            return_tensors="pt",
            truncation=True,
            max_length=2048,
        ).to(self.model.device)
        
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=512,
                temperature=0.7,
                top_p=0.9,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id,
            )
        
        answer = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Extract only the answer part
        if "### Answer:" in answer:
            answer = answer.split("### Answer:")[-1].strip()
        
        return answer
