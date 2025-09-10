from langchain.text_splitter import RecursiveCharacterTextSplitter
from typing import List
import config

def chunk_text(text: str) -> List[str]:
    """
    Splits a long text into smaller chunks of a specified size.

    Args:
        text (str): The text content to be chunked.

    Returns:
        List[str]: A list of text chunks.
    """
    if not text:
        return []
        
    print("-> Chunking text...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=config.CHUNK_SIZE,
        chunk_overlap=config.CHUNK_OVERLAP,
        length_function=len,
        add_start_index=True,
    )
    
    # Langchain's splitter returns Document objects, we just need the content
    chunks_with_metadata = text_splitter.create_documents([text])
    text_chunks = [chunk.page_content for chunk in chunks_with_metadata]
    
    print(f"   - Text split into {len(text_chunks)} chunks.")
    return text_chunks