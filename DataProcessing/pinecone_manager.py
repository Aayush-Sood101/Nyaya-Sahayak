from pinecone import Pinecone, ServerlessSpec
from typing import List, Dict, Any
import config

# Initialize Pinecone client
try:
    pc = Pinecone(api_key=config.PINECONE_API_KEY)
except Exception as e:
    raise ConnectionError(f"Failed to initialize Pinecone client: {e}")

def get_or_create_index():
    """
    Gets the Pinecone index, creating it if it doesn't exist.
    """
    if config.PINECONE_INDEX_NAME in pc.list_indexes().names():
        print(f"Index '{config.PINECONE_INDEX_NAME}' already exists. Connecting.")
        index = pc.Index(config.PINECONE_INDEX_NAME)
    else:
        print(f"Index '{config.PINECONE_INDEX_NAME}' not found. Creating new index...")
        pc.create_index(
            name=config.PINECONE_INDEX_NAME,
            dimension=config.EMBEDDING_DIMENSION,
            metric="cosine", 
            spec=ServerlessSpec(
                cloud=config.PINECONE_CLOUD, 
                region=config.PINECONE_REGION
            ) 
        )
        index = pc.Index(config.PINECONE_INDEX_NAME)
        print("Index created successfully.")
    
    return index

def upsert_batch(index, vectors: List[Dict[str, Any]]):
    """
    Upserts a batch of vectors to the Pinecone index.
    """
    if not vectors:
        print("Warning: No vectors to upsert.")
        return
    
    print(f"-> Upserting batch of {len(vectors)} vectors to Pinecone...")
    try:
        index.upsert(vectors=vectors)
        print("   - Batch upserted successfully.")
    except Exception as e:
        print(f"An error occurred during Pinecone upsert: {e}")
        # --- THIS IS THE NEW LINE ---
        # Re-raise the exception to stop the main script
        raise e