from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
import os
import re
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

llm = ChatGroq(
    model="llama-3.1-8b-instant", api_key=os.getenv("GROQ_API_KEY"), temperature=0
)

BDD_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are a senior QA engineer specializing in BDD testing.
Given a production error and its fix, generate comprehensive BDD tests.

Your response MUST follow this EXACT format:

## 📋 Feature File (Gherkin)
```gherkin
Feature: [Feature name based on the route/service]
  As a developer
  I want [what the route should do]
  So that [business value]

  Background:
    Given the application is running
    And the endpoint is available

  Scenario: Handle error gracefully
    Given the route receives a request
    When the error condition occurs
    Then the app should handle it gracefully
    And the app should not crash

  Scenario: Happy path works correctly
    Given the route receives a valid request
    When valid data is provided
    Then the response should be successful
```

## 🔧 Step Definitions (JavaScript)
```javascript
const {{ Given, When, Then }} = require('@cucumber/cucumber');
const request = require('supertest');
const app = require('../app');

Given('the application is running', function() {{
  this.app = app;
}});

When('the route receives a request', async function() {{
  this.response = await request(this.app).get('/process');
}});

Then('the app should not crash', function() {{
  expect(this.response.status).not.toBe(500);
}});
```

## 🐍 Step Definitions (Python)
```python
from behave import given, when, then
import requests

BASE_URL = 'http://localhost:4000'

@given('the application is running')
def step_app_running(context):
    context.base_url = BASE_URL

@when('the route receives a request')
def step_route_request(context):
    context.response = requests.get(f'{{context.base_url}}/process')

@then('the app should not crash')
def step_no_crash(context):
    assert context.response.status_code != 500
```

## ✅ Acceptance Criteria
1. The route handles null/undefined values gracefully
2. The app returns meaningful error messages
3. The app never returns a 500 status for known error cases
""",
        ),
        (
            "human",
            """Service: {service}
Route: {route}
Error: {error}
File: {file}
Line: {line}
Root cause: {root_cause}
Fix applied: {fix}

Generate comprehensive BDD tests for this specific error:""",
        ),
    ]
)


async def generate_bdd_tests(state: dict) -> dict:
    event = state["raw_event"]

    chain = BDD_PROMPT | llm
    response = await chain.ainvoke(
        {
            "service": event.get("service", "unknown"),
            "route": event.get("route", "unknown"),
            "error": event.get("error", ""),
            "file": event.get("file", "unknown"),
            "line": event.get("line", "unknown"),
            "root_cause": state["root_cause"],
            "fix": state["fix"],
        }
    )
    state["bdd_tests"] = response.content
    return state


def extract_feature_file(bdd_content: str) -> str:
    """Extract just the Gherkin feature file content"""
    match = re.search(r"```gherkin\n(.*?)```", bdd_content, re.DOTALL)
    if match:
        return match.group(1).strip()
    return bdd_content


def extract_step_definitions(bdd_content: str, language: str = "javascript") -> str:
    """Extract step definitions for a specific language"""
    if language == "javascript":
        match = re.search(
            r"Step Definitions \(JavaScript\).*?```javascript\n(.*?)```",
            bdd_content,
            re.DOTALL,
        )
    else:
        match = re.search(
            r"Step Definitions \(Python\).*?```python\n(.*?)```", bdd_content, re.DOTALL
        )

    if match:
        return match.group(1).strip()
    return ""
