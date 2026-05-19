from pinecone import Pinecone
from rag.embedder import embed_text
import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index(host=os.getenv("PINECONE_HOST"))


def retrieve_similar(query: str, top_k: int = 3) -> list[dict]:
    """Find most similar code or errors from Pinecone"""
    vector = embed_text(query)
    results = index.query(vector=vector, top_k=top_k, include_metadata=True)
    matches = []
    for match in results.matches:
        matches.append(
            {
                "score": match.score,
                "file_path": match.metadata.get("file_path", "unknown"),
                "content": match.metadata.get("content", ""),
                "type": match.metadata.get("type", "unknown"),
            }
        )
    return matches


def get_context_for_error(error_text: str) -> str:
    """Get relevant code context for an error — used by Fix Suggester agent"""
    matches = retrieve_similar(error_text, top_k=3)
    if not matches:
        return "No relevant code context found."
    context = "RELEVANT CODE CONTEXT:\n"
    for i, match in enumerate(matches):
        context += f"\n--- Match {i+1} (similarity: {match['score']:.2f}) ---\n"
        context += f"File: {match['file_path']}\n"
        context += f"{match['content']}\n"
    return context
