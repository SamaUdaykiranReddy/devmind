from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
import os, json, re
from dotenv import load_dotenv

from pathlib import Path
load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

llm = ChatGroq(
    model="llama-3.1-8b-instant", api_key=os.getenv("GROQ_API_KEY"), temperature=0
)

ANOMALY_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are an expert anomaly detection agent for software systems.
Analyze the incoming log/error event and determine:
1. Is this a real anomaly or normal behavior?
2. What TYPE of anomaly is it? (performance, crash, memory, logic_error, timeout)
3. What is the SEVERITY? (low, medium, high, critical)

Respond in this exact JSON format with no extra text:
{{
  "is_anomaly": true,
  "type": "crash|performance|memory|timeout|logic_error",
  "severity": "low|medium|high|critical",
  "summary": "one sentence description"
}}""",
        ),
        ("human", "Analyze this event: {event}"),
    ]
)


async def detect_anomaly(state: dict) -> dict:
    chain = ANOMALY_PROMPT | llm
    response = await chain.ainvoke({"event": str(state["raw_event"])})
    json_match = re.search(r"\{.*\}", response.content, re.DOTALL)
    if json_match:
        state["anomaly"] = json.loads(json_match.group())
    else:
        state["anomaly"] = {
            "is_anomaly": True,
            "type": "unknown",
            "severity": "medium",
            "summary": response.content,
        }
    return state
