"""PDF parsing for 3GPP/ITU-T standards."""
import fitz  # PyMuPDF
from pathlib import Path
from typing import Dict, List
from src.utils import logger


class PDFParser:
    """Extract text and metadata from telecom standard PDFs."""
    
    def parse(self, pdf_path: Path) -> Dict[str, any]:
        """Parse PDF and extract text with structure preservation."""
        logger.info(f"Parsing PDF: {pdf_path}")
        
        doc = fitz.open(pdf_path)
        pages = []
        
        for page_num, page in enumerate(doc, 1):
            text = page.get_text("text")
            tables = self._extract_tables(page)
            
            pages.append({
                "page_num": page_num,
                "text": text,
                "tables": tables,
            })
        
        metadata = self._extract_metadata(doc)
        doc.close()
        
        return {
            "filename": pdf_path.name,
            "pages": pages,
            "metadata": metadata,
            "total_pages": len(pages),
        }
    
    def _extract_tables(self, page) -> List[str]:
        """Extract tables from page (simplified)."""
        # In production, use more sophisticated table extraction
        return []
    
    def _extract_metadata(self, doc) -> Dict[str, str]:
        """Extract PDF metadata."""
        return {
            "title": doc.metadata.get("title", ""),
            "author": doc.metadata.get("author", ""),
            "subject": doc.metadata.get("subject", ""),
            "creator": doc.metadata.get("creator", ""),
        }


def parse_pdf(pdf_path: str) -> Dict[str, any]:
    """Convenience function to parse a PDF."""
    parser = PDFParser()
    return parser.parse(Path(pdf_path))
