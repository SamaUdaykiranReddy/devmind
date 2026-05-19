import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent / ".env")

from rag.embedder import ingest_code

# Ingest the sample app code
sample_app_path = Path(__file__).parent.parent / "sample-app" / "index.js"

if sample_app_path.exists():
    content = sample_app_path.read_text()
    ingest_code("apps/sample-app/index.js", content)
    print("✅ Sample app ingested into Pinecone!")
else:
    print("❌ Sample app not found at:", sample_app_path)
