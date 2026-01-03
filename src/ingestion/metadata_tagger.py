"""Metadata extraction and tagging for telecom standards."""
import re
from typing import Dict
from src.utils import logger


class MetadataTagger:
    """Extract and tag metadata from telecom specifications."""
    
    # Telecom domains
    DOMAINS = {
        "URLLC": ["ultra-reliable", "low latency", "urllc", "reliability"],
        "eMBB": ["enhanced mobile broadband", "embb", "throughput", "capacity"],
        "mMTC": ["massive machine type", "mmtc", "iot", "massive connectivity"],
        "V2X": ["vehicle-to-everything", "v2x", "v2v", "vehicular"],
        "Network Slicing": ["network slice", "slicing", "slice management"],
        "5G Core": ["5gc", "5g core", "amf", "smf", "upf"],
    }
    
    def tag(self, text: str, filename: str = "") -> Dict[str, any]:
        """Extract metadata from text and filename."""
        logger.info(f"Tagging metadata for: {filename}")
        
        metadata = {
            "spec_id": self._extract_spec_id(filename, text),
            "release": self._extract_release(filename, text),
            "domains": self._extract_domains(text),
            "filename": filename,
        }
        
        return metadata
    
    def _extract_spec_id(self, filename: str, text: str) -> str:
        """Extract 3GPP spec ID (e.g., TS 23.501)."""
        # Try filename first
        match = re.search(r'(TS|TR)\s*(\d{2}\.\d{3})', filename, re.IGNORECASE)
        if match:
            return f"{match.group(1).upper()} {match.group(2)}"
        
        # Try text
        match = re.search(r'(TS|TR)\s*(\d{2}\.\d{3})', text[:1000], re.IGNORECASE)
        if match:
            return f"{match.group(1).upper()} {match.group(2)}"
        
        return "Unknown"
    
    def _extract_release(self, filename: str, text: str) -> str:
        """Extract 3GPP release number."""
        # Try filename
        match = re.search(r'[Rr]el(?:ease)?[-_\s]*(\d+)', filename)
        if match:
            return f"Release {match.group(1)}"
        
        # Try text
        match = re.search(r'[Rr]elease\s+(\d+)', text[:2000])
        if match:
            return f"Release {match.group(1)}"
        
        return "Unknown"
    
    def _extract_domains(self, text: str) -> list[str]:
        """Identify relevant telecom domains."""
        text_lower = text.lower()
        domains = []
        
        for domain, keywords in self.DOMAINS.items():
            if any(keyword in text_lower for keyword in keywords):
                domains.append(domain)
        
        return domains if domains else ["General"]


def tag_metadata(text: str, filename: str = "") -> Dict[str, any]:
    """Convenience function to tag metadata."""
    tagger = MetadataTagger()
    return tagger.tag(text, filename)
