"""Test metadata tagger."""
import pytest
from src.ingestion.metadata_tagger import MetadataTagger, tag_metadata


def test_extract_spec_id():
    """Test spec ID extraction."""
    tagger = MetadataTagger()
    
    # From filename
    spec_id = tagger._extract_spec_id("TS_23.501_Release_17.pdf", "")
    assert "TS 23.501" in spec_id
    
    # From text
    text = "This document describes TS 38.300 specifications."
    spec_id = tagger._extract_spec_id("", text)
    assert "TS 38.300" in spec_id


def test_extract_release():
    """Test release extraction."""
    tagger = MetadataTagger()
    
    # From filename
    release = tagger._extract_release("spec_rel17.pdf", "")
    assert "17" in release
    
    # From text
    text = "This specification is part of Release 16."
    release = tagger._extract_release("", text)
    assert "16" in release


def test_extract_domains():
    """Test domain extraction."""
    tagger = MetadataTagger()
    
    text = "This document covers URLLC and ultra-reliable low latency communication."
    domains = tagger._extract_domains(text)
    
    assert "URLLC" in domains


def test_tag_metadata_full():
    """Test full metadata tagging."""
    filename = "TS_23.501_Release_17_URLLC.pdf"
    text = "This specification covers ultra-reliable low latency communication in Release 17."
    
    metadata = tag_metadata(text, filename)
    
    assert "spec_id" in metadata
    assert "release" in metadata
    assert "domains" in metadata
    assert "URLLC" in metadata["domains"]
