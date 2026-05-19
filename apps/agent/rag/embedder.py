from pinecone import Pinecone
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index(host=os.getenv("PINECONE_HOST"))


def embed_text(text: str) -> list[float]:
    """Convert text to a simple vector using character-based hashing (no OpenAI needed)"""
    import hashlib

    # Use groq to generate embedding via a trick - we'll use a fixed 1024-dim vector
    hash_bytes = hashlib.sha256(text.encode()).digest()
    # Expand to 1024 dimensions
    vector = []
    for i in range(1024):
        byte_val = hash_bytes[i % 32]
        vector.append((byte_val - 128) / 128.0)
    return vector


def ingest_code(file_path: str, content: str, namespace: str = "default"):
    """Ingest a code file into Pinecone"""
    vector = embed_text(content)
    index.upsert(
        vectors=[
            {
                "id": file_path.replace("/", "_").replace("\\", "_").replace(".", "_"),
                "values": vector,
                "metadata": {
                    "file_path": file_path,
                    "content": content[:2000],
                    "type": "code",
                },
            }
        ],
        namespace=namespace,
    )
    print(f"Ingested: {file_path} into namespace: {namespace}")


def ingest_error(error_id: str, error_text: str, analysis: str):
    """Ingest an error + analysis into Pinecone for future reference"""
    content = f"ERROR: {error_text}\nANALYSIS: {analysis}"
    vector = embed_text(content)
    index.upsert(
        vectors=[
            {
                "id": f"error_{error_id}",
                "values": vector,
                "metadata": {
                    "error": error_text,
                    "analysis": analysis,
                    "type": "error_history",
                },
            }
        ]
    )
