from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

llm = ChatGroq(
    model="llama-3.1-8b-instant", api_key=os.getenv("GROQ_API_KEY"), temperature=0
)

PATTERN_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are an expert at detecting patterns in software errors.
Given a list of recent errors, identify:
1. Are there recurring patterns?
2. Is there a risk of outage based on error frequency?
3. What is the predicted impact if not fixed?

Respond in JSON format:
{{
  "has_pattern": true/false,
  "pattern_description": "description",
  "risk_level": "low/medium/high/critical",
  "predicted_impact": "description",
  "recommendation": "what to do"
}}""",
        ),
        ("human", "Analyze these recent errors:\n{errors}"),
    ]
)


async def detect_patterns(errors: list) -> dict:
    """Detect patterns in recent errors"""
    if not errors:
        return {"has_pattern": False}

    error_summary = "\n".join(
        [
            f"- {e.get('error_text', '')} ({e.get('service', '')} → {e.get('route', '')}) "
            f"occurred {e.get('occurrence_count', 1)} times"
            for e in errors[:10]
        ]
    )

    chain = PATTERN_PROMPT | llm
    response = await chain.ainvoke({"errors": error_summary})

    import json
    import re

    json_match = re.search(r"\{.*\}", response.content, re.DOTALL)
    if json_match:
        return json.loads(json_match.group())
    return {"has_pattern": False}
