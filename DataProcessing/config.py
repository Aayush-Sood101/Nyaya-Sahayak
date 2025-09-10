import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- Pinecone Configuration ---
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")
PINECONE_CLOUD = os.getenv("PINECONE_CLOUD")
PINECONE_REGION = os.getenv("PINECONE_REGION")


# --- OpenAI Configuration ---
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMENSION = 1536 # Dimension for text-embedding-3-small

# --- Data Configuration ---
RAW_DATA_PATH = "../data/raw"

# --- Logging Configuration ---
LOG_FILE_PATH = "data_processing.log"

# --- Text Splitting Configuration ---
CHUNK_SIZE = 800
CHUNK_OVERLAP = 100

# --- Batching for Upsert ---
UPSERT_BATCH_SIZE = 100

# --- Error Handling ---
if not all([PINECONE_API_KEY, PINECONE_INDEX_NAME, OPENAI_API_KEY, PINECONE_CLOUD, PINECONE_REGION]):
    raise ValueError("One or more essential environment variables are not set. Please check your .env file.")