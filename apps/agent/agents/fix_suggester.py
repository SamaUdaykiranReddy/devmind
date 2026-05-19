from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from rag.retriever import get_context_for_error
import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

llm = ChatGroq(
    model="llama-3.1-8b-instant", api_key=os.getenv("GROQ_API_KEY"), temperature=0
)

FIX_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are a senior software engineer specializing in fixing bugs.
You have access to the relevant code context from the codebase.
Given the root cause and relevant code, provide a concrete, specific fix.
Show the BEFORE and AFTER code clearly.
Be specific — reference actual function names and line patterns from the context.""",
        ),
        (
            "human",
            """Root cause: {root_cause}
Original event: {event}

Relevant code context from codebase:
{context}

Provide the exact fix:""",
        ),
    ]
)


async def suggest_fix(state: dict) -> dict:
    # Get RAG context for this error
    error_text = str(state["raw_event"])
    context = get_context_for_error(error_text)

    chain = FIX_PROMPT | llm
    response = await chain.ainvoke(
        {"root_cause": state["root_cause"], "event": error_text, "context": context}
    )
    state["fix"] = response.content
    return state
