from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
import os
from dotenv import load_dotenv

from pathlib import Path
load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

llm = ChatGroq(
    model="llama-3.1-8b-instant", api_key=os.getenv("GROQ_API_KEY"), temperature=0
)

TEST_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are a senior QA engineer. 
Given a bug and its fix, write Jest/Pytest tests that would catch this bug if it regressed.
Write 2-3 focused test cases. Include edge cases.""",
        ),
        (
            "human",
            """Bug: {root_cause}
Fix: {fix}
Write tests to prevent regression:""",
        ),
    ]
)


async def generate_tests(state: dict) -> dict:
    chain = TEST_PROMPT | llm
    response = await chain.ainvoke(
        {"root_cause": state["root_cause"], "fix": state["fix"]}
    )
    state["tests"] = response.content
    return state
