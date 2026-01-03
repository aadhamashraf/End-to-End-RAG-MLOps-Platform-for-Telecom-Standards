"""Test chunker functionality."""
import pytest
from src.ingestion.chunker import SpecChunker, chunk_document


def test_chunker_basic():
    """Test basic chunking."""
    chunker = SpecChunker(chunk_size=50, overlap=10)
    
    text = " ".join([f"Sentence {i}." for i in range(100)])
    chunks = chunker.chunk(text)
    
    assert len(chunks) > 0
    assert all("text" in chunk for chunk in chunks)
    assert all("metadata" in chunk for chunk in chunks)


def test_chunker_with_metadata():
    """Test chunking with metadata."""
    metadata = {"spec_id": "TS 23.501", "release": "Release 17"}
    
    text = "This is a test document about 5G specifications."
    chunks = chunk_document(text, metadata)
    
    assert len(chunks) > 0
    assert chunks[0]["metadata"] == metadata


def test_chunker_empty_text():
    """Test chunking empty text."""
    chunker = SpecChunker()
    chunks = chunker.chunk("")
    
    assert len(chunks) == 0
