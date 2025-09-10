from openai import OpenAI
from typing import List
import config

# Initialize OpenAI client
try:
    client = OpenAI(api_key=config.OPENAI_API_KEY)
except Exception as e:
    raise ConnectionError(f"Failed to initialize OpenAI client: {e}")

def get_embeddings(texts: List[str]) -> List[List[float]]:
    """
    Generates embeddings for a list of text chunks.

    Args:
        texts (List[str]): The list of text chunks to embed.

    Returns:
        List[List[float]]: A list of embedding vectors.
    """
    if not texts:
        return []
    
    # Replace newlines, which can affect performance
    texts = [text.replace("\n", " ") for text in texts]
    
    print(f"-> Generating embeddings for {len(texts)} texts...")
    try:
        response = client.embeddings.create(
            input=texts,
            model=config.EMBEDDING_MODEL
        )
        embeddings = [item.embedding for item in response.data]
        print(f"   - Successfully generated {len(embeddings)} embeddings.")
        return embeddings
    except Exception as e:
        print(f"An error occurred while generating embeddings: {e}")
        return []