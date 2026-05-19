import os
from pathlib import Path
from github import Github
from dotenv import load_dotenv
from rag.embedder import ingest_code

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

# File extensions we want to index
SUPPORTED_EXTENSIONS = {
    ".js",
    ".ts",
    ".jsx",
    ".tsx",
    ".py",
    ".java",
    ".go",
    ".rb",
    ".php",
    ".cs",
    ".cpp",
    ".c",
    ".h",
    ".rs",
}

# Files/folders to skip
SKIP_PATTERNS = {
    "node_modules",
    ".git",
    "__pycache__",
    "venv",
    ".env",
    "dist",
    "build",
    ".next",
    "coverage",
    ".pytest_cache",
}


def should_index_file(file_path: str) -> bool:
    """Check if file should be indexed"""
    path = Path(file_path)
    for part in path.parts:
        if part in SKIP_PATTERNS:
            return False
    return path.suffix.lower() in SUPPORTED_EXTENSIONS


def get_all_files(repo, path: str) -> list:
    """Recursively get all files from a GitHub repo"""
    files = []
    try:
        contents = repo.get_contents(path)
        for item in contents:
            if item.name in SKIP_PATTERNS:
                continue
            if item.type == "dir":
                files.extend(get_all_files(repo, item.path))
            elif item.type == "file":
                try:
                    if item.size < 1_000_000:
                        content = item.decoded_content.decode("utf-8")
                        files.append((item.path, content))
                except Exception:
                    pass
    except Exception as e:
        print(f"Error reading path {path}: {e}")
    return files


async def index_repo(
    github_token: str, repo_owner: str, repo_name: str, user_id: int
) -> dict:
    """Clone a GitHub repo and index all code files into Pinecone RAG"""
    print(f"🔍 Starting indexing for {repo_owner}/{repo_name}")

    indexed_files = 0
    skipped_files = 0
    errors = []

    try:
        g = Github(github_token)
        repo = g.get_repo(f"{repo_owner}/{repo_name}")

        contents = get_all_files(repo, "")
        print(f"📁 Found {len(contents)} files to process")

        for file_path, file_content in contents:
            try:
                if not should_index_file(file_path):
                    skipped_files += 1
                    continue

                ingest_code(
                    file_path=f"{repo_owner}/{repo_name}/{file_path}",
                    content=file_content,
                    namespace=f"user_{user_id}",
                )
                indexed_files += 1
                print(f"✅ Indexed: {file_path}")

            except Exception as e:
                errors.append(f"{file_path}: {str(e)}")
                print(f"❌ Error indexing {file_path}: {e}")

        print(f"✅ Indexing complete: {indexed_files} files indexed")

        return {
            "success": True,
            "repo": f"{repo_owner}/{repo_name}",
            "indexed_files": indexed_files,
            "skipped_files": skipped_files,
            "errors": errors,
        }

    except Exception as e:
        print(f"❌ Repo indexing failed: {e}")
        return {"success": False, "error": str(e), "indexed_files": indexed_files}
