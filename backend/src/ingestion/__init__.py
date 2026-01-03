"""Data ingestion package for Auto-Standard."""
from src.ingestion.pdf_parser import parse_pdf, PDFParser
from src.ingestion.chunker import chunk_document, SpecChunker
from src.ingestion.metadata_tagger import tag_metadata, MetadataTagger
from src.ingestion.embedder import get_embedder, Embedder

__all__ = [
    "parse_pdf",
    "PDFParser",
    "chunk_document",
    "SpecChunker",
    "tag_metadata",
    "MetadataTagger",
    "get_embedder",
    "Embedder",
]
