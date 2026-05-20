from fastapi import FastAPI, Request
from rag.repo_indexer import index_repo
from fastapi.responses import JSONResponse
from agents.orchestrator import run_orchestrator
from agents.pattern_detector import detect_patterns
import traceback

app = FastAPI(title="DevMind Agent Service")


@app.get("/health")
def health():
    return {"status": "ok", "service": "devmind-agents"}


@app.post("/analyze")
async def analyze(request: Request):
    try:
        payload = await request.json()
        print(f"Received: {payload}")
        result = await run_orchestrator(payload)
        print(f"Result: {result}")
        return result
    except Exception as e:
        print(f"ERROR: {e}")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/index-repo")
async def index_repository(payload: dict):
    """Index a GitHub repo into Pinecone RAG"""
    github_token = payload.get("github_token")
    repo_owner = payload.get("repo_owner")
    repo_name = payload.get("repo_name")
    user_id = payload.get("user_id")

    print(f"Indexing repo: {repo_owner}/{repo_name} for user {user_id}")

    result = await index_repo(
        github_token=github_token,
        repo_owner=repo_owner,
        repo_name=repo_name,
        user_id=user_id,
    )
    return result


@app.post("/detect-patterns")
async def detect_error_patterns(payload: dict):
    """Detect patterns in recent errors"""
    errors = payload.get("errors", [])
    result = await detect_patterns(errors)
    return result
