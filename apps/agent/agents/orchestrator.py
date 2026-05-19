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


async def run_orchestrator(event: dict) -> dict:
    graph = build_graph()
    initial_state: DevMindState = {
        "raw_event": event,
        "anomaly": None,
        "root_cause": None,
        "fix": None,
        "tests": None,
        "bdd_tests": None,
        "explanation": None,
        "github_pr_url": None,
        "final_report": None,
    }
    result = await graph.ainvoke(initial_state)
    return result


def build_graph():
    graph = StateGraph(DevMindState)

    graph.add_node("detect_anomaly", detect_anomaly)
    graph.add_node("analyze_root_cause", analyze_root_cause)
    graph.add_node("suggest_fix", suggest_fix)
    graph.add_node("generate_tests", generate_tests)
    graph.add_node("generate_bdd_tests", generate_bdd_tests)
    graph.add_node("explain_fix", explain_fix)
    graph.add_node("create_github_pr", create_github_pr)
    graph.add_node("compile_report", compile_report)

    graph.set_entry_point("detect_anomaly")
    graph.add_edge("detect_anomaly", "analyze_root_cause")
    graph.add_edge("analyze_root_cause", "suggest_fix")
    graph.add_edge("suggest_fix", "generate_tests")
    graph.add_edge("generate_tests", "generate_bdd_tests")
    graph.add_edge("generate_bdd_tests", "explain_fix")
    graph.add_edge("explain_fix", "create_github_pr")
    graph.add_edge("create_github_pr", "compile_report")
    graph.add_edge("compile_report", END)

    return graph.compile()


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
