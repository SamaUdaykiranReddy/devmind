from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
import os
from dotenv import load_dotenv

from pathlib import Path
load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

llm = ChatGroq(
     model="llama-3.1-8b-instant", api_key=os.getenv("GROQ_API_KEY"), temperature=0
)

ROOT_CAUSE_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are a root cause analysis expert for software systems.
Given an anomaly and the original event, identify the exact root cause.
Be specific — name the exact line, function, or pattern causing the issue.
Respond in 2-3 sentences maximum.""",
        ),
        (
            "human",
            """Event: {event}
Anomaly: {anomaly}
What is the root cause?""",
        ),
    ]
)


async def analyze_root_cause(state: dict) -> dict:
    chain = ROOT_CAUSE_PROMPT | llm
    response = await chain.ainvoke(
        {"event": str(state["raw_event"]), "anomaly": str(state["anomaly"])}
    )
    state["root_cause"] = response.content
    return state
