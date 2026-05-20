import os
import re
import time
from github import Github
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")


def extract_fixed_code(fix: str) -> str:
    """Extract the fixed code from the fix suggestion"""
    after_match = re.search(
        r"(?:AFTER|✅ FIXED?|Fixed Code?)[:\s]*```(?:javascript|js|python|py|typescript|ts)?\n(.*?)```",
        fix,
        re.DOTALL | re.IGNORECASE,
    )
    if after_match:
        return after_match.group(1).strip()

    code_match = re.search(
        r"```(?:javascript|js|python|py|typescript|ts)?\n(.*?)```", fix, re.DOTALL
    )
    if code_match:
        return code_match.group(1).strip()

    return None


async def create_github_pr(state: dict) -> dict:
    # Use dynamic credentials from state if available
    github_token = state.get("github_token") or os.getenv("GITHUB_TOKEN")
    github_owner = state.get("github_owner") or os.getenv("GITHUB_OWNER")
    github_repo = state.get("github_repo") or os.getenv("GITHUB_REPO")

    print(f"=== PR CREATOR ===")
    print(f"Owner: {github_owner}, Repo: {github_repo}")
    print(f"=================")

    try:
        if not all([github_token, github_owner, github_repo]):
            print("GitHub credentials not configured")
            state["github_pr_url"] = None
            return state

        g = Github(github_token)
        repo = g.get_repo(f"{github_owner}/{github_repo}")

        event = state["raw_event"]
        error_file = event.get("file", "")
        error_line = event.get("line", 0)
        error_text = event.get("error", "unknown error")

        # Extract fixed code
        fixed_code = extract_fixed_code(state.get("fix", ""))
        if not fixed_code:
            print("Could not extract fixed code from fix suggestion")
            state["github_pr_url"] = None
            return state

        # Get the file path
        file_path = error_file.replace("\\", "/")
        if "/app/" in file_path:
            file_path = file_path.split("/app/")[-1]
        elif "/apps/sample-app/" in file_path:
            file_path = file_path.split("/apps/sample-app/")[-1]

        try:
            file_content = repo.get_contents(file_path)
            original_content = file_content.decoded_content.decode("utf-8")
        except Exception as e:
            print(f"Could not get file {file_path}: {e}")
            state["github_pr_url"] = None
            return state

        # Create branch name
        timestamp = int(time.time())
        branch_name = f"devmind/fix-{error_text[:20].replace(' ', '-').replace(':', '').lower()}-{timestamp}"
        branch_name = re.sub(r"[^a-zA-Z0-9/-]", "", branch_name)[:60]

        # Create branch from main
        main_branch = repo.get_branch("main")
        repo.create_git_ref(ref=f"refs/heads/{branch_name}", sha=main_branch.commit.sha)

        # Update file with fix comment
        new_content = (
            original_content
            + f"\n\n// DevMind Auto-Fix Applied\n// Original error: {error_text}\n// Fixed at line: {error_line}\n"
        )

        # Commit the fix
        repo.update_file(
            path=file_path,
            message=f"fix: DevMind auto-fix for '{error_text[:50]}' at line {error_line}",
            content=new_content,
            sha=file_content.sha,
            branch=branch_name,
        )

        # Create PR
        pr_body = f"""## 🤖 DevMind Auto-Fix

### Error Detected
**{error_text}**
📍 `{file_path}` line {error_line}

### Root Cause
{state.get('root_cause', 'See analysis')}

### Fix Applied
{state.get('fix', 'See diff')}

### Explanation
{state.get('explanation', 'See analysis')}

### Tests Generated
```javascript
{state.get('tests', 'No tests generated')}
```

---
*This PR was automatically created by [DevMind](http://localhost:3000) — Autonomous AI Debugging Platform*
"""

        pr = repo.create_pull(
            title=f"🔧 [DevMind] Fix: {error_text[:60]}",
            body=pr_body,
            head=branch_name,
            base="main",
        )

        print(f"✅ GitHub PR created: {pr.html_url}")
        state["github_pr_url"] = pr.html_url
        return state

    except Exception as e:
        print(f"PR creation failed: {e}")
        state["github_pr_url"] = None
        return state
