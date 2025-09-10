import os
from datetime import datetime
from typing import Dict, Any

def get_metadata_for_file(file_path: str) -> Dict[str, Any]:
    """
    Generates a base metadata dictionary based on the file's parent directory.
    This function acts as a router to specific metadata generators.
    """
    directory_name = os.path.basename(os.path.dirname(file_path))
    filename = os.path.basename(file_path)
    
    # Base metadata common to all files
    base_meta = {
        "language": "en",
        "last_updated": datetime.utcnow().isoformat() + "Z",
        # Set all specific fields to None initially
        "document_type": None, "chapter_number": None, "chapter_title": None,
        "section_number": None, "article_number": None, "clause_number": None,
        "ministry": None, "beneficiary_type": None, "benefit_type": None,
        "page_title": None, "question": None
    }
    
    if directory_name == "legal_codes":
        specific_meta = _get_legal_code_meta(filename)
    elif directory_name == "constitution":
        specific_meta = _get_constitution_meta(filename)
    elif directory_name == "schemes":
        specific_meta = _get_scheme_meta(filename)
    elif directory_name == "faqs":
        specific_meta = _get_faq_meta(filename)
    else:
        # Default metadata for uncategorized files
        specific_meta = {
            "source_type": "guide",
            "source_name": filename,
            "source_url": "URL_TO_BE_ADDED"
        }

    # Merge base and specific metadata
    base_meta.update(specific_meta)
    return base_meta

# --- Private helper functions for specific metadata ---

def _get_legal_code_meta(filename: str) -> Dict[str, Any]:
    # In a real system, you might look up this data from a database or a config file.
    # Here, we use a simple mapping for demonstration.
    if "indian_penal_code" in filename:
        return {
            "source_type": "law",
            "source_name": "Indian Penal Code, 1860",
            "source_url": "https://www.indiacode.nic.in/handle/123456789/2263",
            "document_type": "Code"
        }
    # Add more 'elif' blocks for other legal codes
    return {}

def _get_constitution_meta(filename: str) -> Dict[str, Any]:
    return {
        "source_type": "constitution",
        "source_name": "The Constitution of India",
        "source_url": "https://www.indiacode.nic.in/handle/123456789/15663",
        "document_type": "Constitution"
    }
    
def _get_scheme_meta(filename: str) -> Dict[str, Any]:
    if "pm_jay_scheme" in filename:
        return {
            "source_type": "scheme",
            "source_name": "Pradhan Mantri Jan Arogya Yojana (PM-JAY)",
            "source_url": "https://pmjay.gov.in/about/pmjay",
            "ministry": "Ministry of Health and Family Welfare",
            "beneficiary_type": ["Below Poverty Line", "Socio-Economic Caste Census 2011 beneficiaries"],
            "benefit_type": "Healthcare"
        }
    return {}

def _get_faq_meta(filename: str) -> Dict[str, Any]:
    if "ncrb_fir_faqs" in filename:
        return {
            "source_type": "faq",
            "source_name": "National Crime Records Bureau Portal - FAQs",
            "source_url": "https://ncrb.gov.in/en/common-questions",
            "ministry": "Ministry of Home Affairs",
            "page_title": "Common Questions about FIR"
        }
    return {}