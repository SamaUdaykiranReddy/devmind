from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

llm = ChatGroq(
    model="llama-3.1-8b-instant", api_key=os.getenv("GROQ_API_KEY"), temperature=0
)

EXPLAIN_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are DevMind, a friendly AI debugging assistant.
A production error just occurred and you fixed it.
Explain to the developer in plain English like a senior developer talking to a junior.

Your explanation MUST follow this exact format:

## 🔍 What Happened
[1-2 sentences in plain English, no jargon]

## 🤔 Why It Happened  
[Technical root cause, simple language, mention exact file and line]

## ✅ What I Fixed
[Exactly what you changed, before vs after]

## 🛡️ How To Prevent This
[1-2 best practice tips to avoid this in future]

## 📚 What You Can Learn
[One thing the developer can learn from this bug]

Be friendly, specific, and educational. Reference actual file names and line numbers.""",
        ),
        (
            "human",
            """Error: {error}
File: {file}
Line: {line}
Root cause: {root_cause}
Fix applied: {fix}

Explain this to the developer:""",
        ),
    ]
)


async def explain_fix(state: dict) -> dict:
    event = state["raw_event"]

    chain = EXPLAIN_PROMPT | llm
    response = await chain.ainvoke(
        {
            "error": event.get("error", ""),
            "file": event.get("file", "unknown"),
            "line": event.get("line", "unknown"),
            "root_cause": state["root_cause"],
            "fix": state["fix"],
        }
    )
    state["explanation"] = response.content
    return state
