from langgraph.graph import StateGraph, END
from typing import TypedDict, Optional
from agents.anomaly_detector import detect_anomaly
from agents.root_cause_analyst import analyze_root_cause
from agents.fix_suggester import suggest_fix
from agents.test_generator import generate_tests
from agents.explainer import explain_fix
from agents.pr_creator import create_github_pr
from agents.bdd_generator import generate_bdd_tests


class DevMindState(TypedDict):
    raw_event: dict
    anomaly: Optional[dict]
    root_cause: Optional[str]
    fix: Optional[str]
    tests: Optional[str]
    bdd_tests: Optional[str]
    explanation: Optional[str]
    github_pr_url: Optional[str]
    final_report: Optional[dict]


def compile_report(state: DevMindState) -> DevMindState:
    state["final_report"] = {
        "anomaly": state["anomaly"],
        "root_cause": state["root_cause"],
        "fix": state["fix"],
        "tests": state["tests"],
        "bdd_tests": state["bdd_tests"],
        "explanation": state["explanation"],
        "github_pr_url": state["github_pr_url"],
    }
    return state


def build_graph():
    g = StateGraph(DevMindState)

    g.add_node("detect_anomaly", detect_anomaly)
    g.add_node("analyze_root_cause", analyze_root_cause)
    g.add_node("suggest_fix", suggest_fix)
    g.add_node("generate_tests", generate_tests)
    g.add_node("generate_bdd_tests", generate_bdd_tests)
    g.add_node("explain_fix", explain_fix)
    g.add_node("create_github_pr", create_github_pr)
    g.add_node("compile_report", compile_report)

    g.set_entry_point("detect_anomaly")
    g.add_edge("detect_anomaly", "analyze_root_cause")
    g.add_edge("analyze_root_cause", "suggest_fix")
    g.add_edge("suggest_fix", "generate_tests")
    g.add_edge("generate_tests", "generate_bdd_tests")
    g.add_edge("generate_bdd_tests", "explain_fix")
    g.add_edge("explain_fix", "create_github_pr")
    g.add_edge("create_github_pr", "compile_report")
    g.add_edge("compile_report", END)

    return g.compile()


# Build graph at module load time
graph = build_graph()


async def run_orchestrator(event: dict) -> dict:
    initial_state = {
        "raw_event": event,
        "github_token": event.get("github_token"),
        "github_owner": event.get("github_owner"),
        "github_repo": event.get("github_repo"),
        "user_namespace": event.get("user_namespace", "default"),
    }
    result = await graph.ainvoke(initial_state)
    return result
