"""Intelligent chunking for telecom specifications."""
from typing import List, Dict
from src.utils import settings, logger


class SpecChunker:
    """Chunk telecom specs optimized for retrieval."""
    
    def __init__(self, chunk_size: int = None, overlap: int = None):
        self.chunk_size = chunk_size or settings.chunk_size
        self.overlap = overlap or settings.chunk_overlap
    
    def chunk(self, text: str, metadata: Dict = None) -> List[Dict]:
        """Create overlapping chunks from text."""
        logger.info(f"Chunking text (size={self.chunk_size}, overlap={self.overlap})")
        
        # Split by sentences for better semantic boundaries
        sentences = self._split_sentences(text)
        chunks = []
        current_chunk = []
        current_length = 0
        
        for sentence in sentences:
            sentence_length = len(sentence.split())
            
            if current_length + sentence_length > self.chunk_size and current_chunk:
                # Save current chunk
                chunk_text = " ".join(current_chunk)
                chunks.append({
                    "text": chunk_text,
                    "metadata": metadata or {},
                    "length": current_length,
                })
                
                # Start new chunk with overlap
                overlap_sentences = self._get_overlap_sentences(current_chunk)
                current_chunk = overlap_sentences + [sentence]
                current_length = sum(len(s.split()) for s in current_chunk)
            else:
                current_chunk.append(sentence)
                current_length += sentence_length
        
        # Add final chunk
        if current_chunk:
            chunks.append({
                "text": " ".join(current_chunk),
                "metadata": metadata or {},
                "length": current_length,
            })
        
        logger.info(f"Created {len(chunks)} chunks")
        return chunks
    
    def _split_sentences(self, text: str) -> List[str]:
        """Split text into sentences (simplified)."""
        # In production, use spaCy or NLTK for better sentence segmentation
        import re
        sentences = re.split(r'(?<=[.!?])\s+', text)
        return [s.strip() for s in sentences if s.strip()]
    
    def _get_overlap_sentences(self, sentences: List[str]) -> List[str]:
        """Get sentences for overlap."""
        overlap_words = 0
        overlap_sentences = []
        
        for sentence in reversed(sentences):
            words = len(sentence.split())
            if overlap_words + words <= self.overlap:
                overlap_sentences.insert(0, sentence)
                overlap_words += words
            else:
                break
        
        return overlap_sentences


def chunk_document(text: str, metadata: Dict = None) -> List[Dict]:
    """Convenience function to chunk a document."""
    chunker = SpecChunker()
    return chunker.chunk(text, metadata)
