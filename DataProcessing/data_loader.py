import os
from pypdf import PdfReader
from bs4 import BeautifulSoup

def load_document(file_path: str) -> str:
    """
    Loads and extracts text from a document based on its file extension.
    
    Args:
        file_path (str): The path to the document file.

    Returns:
        str: The extracted text content of the document.
    """
    _, extension = os.path.splitext(file_path)
    extension = extension.lower()

    print(f"-> Loading document: {os.path.basename(file_path)}")

    try:
        if extension == ".pdf":
            return load_pdf(file_path)
        elif extension == ".txt":
            return load_txt(file_path)
        elif extension == ".html":
            return load_html(file_path)
        else:
            print(f"Warning: Unsupported file type '{extension}'. Skipping file: {file_path}")
            return ""
    except Exception as e:
        print(f"Error loading file {file_path}: {e}")
        return ""

def load_pdf(file_path: str) -> str:
    """Extracts text from a PDF file."""
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text

def load_txt(file_path: str) -> str:
    """Extracts text from a TXT file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.read()

def load_html(file_path: str) -> str:
    """Extracts text from an HTML file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')
        return soup.get_text(separator="\n", strip=True)