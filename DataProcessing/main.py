import os
import uuid
import logging
from typing import List, Dict, Any
from tqdm import tqdm

# Import local modules
import config
from data_loader import load_document
from text_chunker import chunk_text
from metadata_manager import get_metadata_for_file
from vectorizer import get_embeddings
from pinecone_manager import get_or_create_index, upsert_batch

# --- Setup Logging ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(config.LOG_FILE_PATH), # Log to a file
        logging.StreamHandler() # Also print to console
    ]
)

def process_file(file_path: str) -> List[Dict[str, Any]]:
    """
    Processes a single file: load, chunk, and add metadata.
    Returns a list of chunk data dictionaries, ready for embedding.
    """
    full_text = load_document(file_path)
    if not full_text:
        return []
    chunks = chunk_text(full_text)
    base_metadata = get_metadata_for_file(file_path)
    processed_chunks = []
    for i, chunk_content in enumerate(chunks):
        chunk_id = f"{os.path.basename(file_path)}-chunk-{i}"
        chunk_metadata = base_metadata.copy()
        chunk_metadata["text"] = chunk_content
        processed_chunks.append({
            "id": chunk_id,
            "text_content": chunk_content,
            "metadata": chunk_metadata
        })
    return processed_chunks

def run_pipeline():
    """
    Main function to run the entire ETL pipeline.
    """
    logging.info("Starting Nyay Sahayak Data Processing Pipeline...")
    pinecone_index = get_or_create_index()
    all_processed_chunks = []
    for dirpath, _, filenames in os.walk(config.RAW_DATA_PATH):
        for filename in filenames:
            if filename.startswith('.'):
                continue
            file_path = os.path.join(dirpath, filename)
            file_chunks = process_file(file_path)
            all_processed_chunks.extend(file_chunks)

    logging.info(f"Total chunks to process and upsert: {len(all_processed_chunks)}")

    for i in tqdm(range(0, len(all_processed_chunks), config.UPSERT_BATCH_SIZE), desc="Upserting Batches"):
        batch = all_processed_chunks[i:i + config.UPSERT_BATCH_SIZE]
        texts_to_embed = [item["text_content"] for item in batch]
        embeddings = get_embeddings(texts_to_embed)
        
        if not embeddings or len(embeddings) != len(batch):
            logging.error(f"Skipping batch {i // config.UPSERT_BATCH_SIZE + 1} due to embedding generation error.")
            continue
            
        vectors_to_upsert = []
        for j, item in enumerate(batch):
            # --- THIS IS THE NEW LINE ---
            # Remove any metadata fields that have a value of None
            clean_metadata = {k: v for k, v in item["metadata"].items() if v is not None}

            vectors_to_upsert.append({
                "id": item["id"],
                "values": embeddings[j],
                "metadata": clean_metadata # Use the cleaned metadata
            })
            
        try:
            upsert_batch(pinecone_index, vectors_to_upsert)
            for vector in vectors_to_upsert:
                logging.info(f"SUCCESS_UPSERT - Chunk ID: {vector['id']}")
        except Exception as e:
            logging.error(f"Failed to upsert batch. Halting pipeline. Error: {e}")
            break # Stop the pipeline if an upsert fails
        
    logging.info("Pipeline finished!")

if __name__ == "__main__":
    run_pipeline()