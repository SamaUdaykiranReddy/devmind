/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface Analysis {
  id: number;
  service: string;
  route: string;
  error_text: string;
  stack_trace: string;
  error_file: string;
  error_line: number;
  error_column: number;
  anomaly_type: string;
  severity: string;
  root_cause: string;
  fix: string;
  tests: string;
  bdd_tests: string;
  explanation: string;
  status: string;
  github_pr_url: string;
  jira_issue_key: string;
  occurrence_count: number;
  created_at: string;
}

const severityConfig: Record<
  string,
  { color: string; bg: string; border: string; glow: string; label: string }
> = {
  critical: {
    color: "#ff003c",
    bg: "rgba(255,0,60,0.06)",
    border: "rgba(255,0,60,0.45)",
    glow: "0 0 25px rgba(255,0,60,0.25)",
    label: "💀 CRITICAL",
  },
  high: {
    color: "#ff6600",
    bg: "rgba(255,102,0,0.06)",
    border: "rgba(255,102,0,0.45)",
    glow: "0 0 18px rgba(255,102,0,0.2)",
    label: "🔴 HIGH",
  },
  medium: {
    color: "#ffcc00",
    bg: "rgba(255,204,0,0.06)",
    border: "rgba(255,204,0,0.35)",
    glow: "0 0 12px rgba(255,204,0,0.12)",
    label: "🟡 MEDIUM",
  },
  low: {
    color: "#00ff88",
    bg: "rgba(0,255,136,0.06)",
    border: "rgba(0,255,136,0.3)",
    glow: "none",
    label: "🟢 LOW",
  },
  unknown: {
    color: "#888888",
    bg: "rgba(136,136,136,0.06)",
    border: "rgba(136,136,136,0.25)",
    glow: "none",
    label: "⚪ UNKNOWN",
  },
};

type TabType = "cause" | "fix" | "tests" | "bdd" | "explanation" | "stack";

const tabs: { key: TabType; emoji: string; label: string; color: string }[] = [
  { key: "cause", emoji: "🔍", label: "ROOT CAUSE", color: "#00ffff" },
  { key: "fix", emoji: "🔧", label: "FIX", color: "#00ff88" },
  { key: "tests", emoji: "🧪", label: "UNIT TESTS", color: "#ff9944" },
  { key: "bdd", emoji: "📋", label: "BDD TESTS", color: "#44aaff" },
  { key: "explanation", emoji: "💡", label: "EXPLAIN", color: "#ffdd44" },
  { key: "stack", emoji: "📚", label: "STACK", color: "#aaaaaa" },
];

export default function ErrorCard({
  analysis,
  onStatusChange,
}: {
  analysis: Analysis;
  onStatusChange: () => void;
}) {
  const [tab, setTab] = useState<TabType>("cause");
  const [status, setStatus] = useState(analysis.status || "open");

  const sev = severityConfig[analysis.severity] || severityConfig.unknown;
  const isResolved = status === "resolved";
  const isCritical = analysis.severity === "critical" && !isResolved;

  const updateStatus = async (newStatus: string) => {
    await fetch(`http://localhost:3001/api/analyze/${analysis.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setStatus(newStatus);
    onStatusChange();
  };

  return (
    <div
      className="mb-4 relative overflow-hidden"
      style={{
        background: isResolved
          ? "rgba(0,15,0,0.4)"
          : `linear-gradient(135deg, rgba(0,0,0,0.85) 0%, ${sev.bg} 100%)`,
        border: `1px solid ${isResolved ? "rgba(0,255,136,0.2)" : sev.border}`,
        boxShadow: isResolved ? "none" : sev.glow,
        opacity: isResolved ? 0.65 : 1,
        transition: "all 0.3s ease",
        animation: isCritical ? "critical-pulse 2.5s infinite" : "none",
      }}
    >
      {/* Top gradient accent line */}
      <div
        style={{
          height: "2px",
          background: isResolved
            ? "linear-gradient(90deg, transparent, #00ff88 50%, transparent)"
            : `linear-gradient(90deg, transparent, ${sev.color} 50%, transparent)`,
        }}
      />

      {/* Left severity glow bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{
          background: isResolved ? "#00ff88" : sev.color,
          boxShadow: isResolved
            ? "0 0 8px #00ff88"
            : `0 0 14px ${sev.color}, 0 0 4px ${sev.color}`,
        }}
      />

      <div className="pl-5 pr-4 pt-3 pb-4">
        {/* HEADER */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            {/* Badge row */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span
                className="text-xs font-black tracking-widest px-2 py-0.5"
                style={{
                  background: sev.bg,
                  color: sev.color,
                  border: `1px solid ${sev.border}`,
                  textShadow: `0 0 8px ${sev.color}70`,
                }}
              >
                {sev.label}
              </span>
              <span
                className="text-xs tracking-widest px-2 py-0.5"
                style={{
                  background: "rgba(0,255,255,0.06)",
                  color: "rgba(0,255,255,0.7)",
                  border: "1px solid rgba(0,255,255,0.2)",
                }}
              >
                {analysis.anomaly_type?.replace(/_/g, " ").toUpperCase()}
              </span>
              <span
                className="text-xs"
                style={{
                  color: "rgba(0,255,255,0.6)",
                  fontFamily: "monospace",
                }}
              >
                {analysis.service}
                <span style={{ color: "rgba(0,255,255,0.3)" }}> ▸ </span>
                {analysis.route}
              </span>
              {(analysis.occurrence_count || 0) > 1 && (
                <span
                  className="text-xs font-black px-2 py-0.5"
                  style={{
                    background: "rgba(255,102,0,0.15)",
                    color: "#ff6600",
                    border: "1px solid rgba(255,102,0,0.4)",
                  }}
                >
                  🔁 {analysis.occurrence_count}×
                </span>
              )}
              <span
                className="text-xs tracking-widest px-2 py-0.5"
                style={{
                  background: isResolved
                    ? "rgba(0,255,136,0.1)"
                    : status === "in_progress"
                      ? "rgba(255,204,0,0.1)"
                      : "rgba(255,0,60,0.1)",
                  color: isResolved
                    ? "#00ff88"
                    : status === "in_progress"
                      ? "#ffcc00"
                      : "#ff4466",
                  border: `1px solid ${isResolved ? "rgba(0,255,136,0.35)" : status === "in_progress" ? "rgba(255,204,0,0.35)" : "rgba(255,0,60,0.35)"}`,
                }}
              >
                {isResolved
                  ? "✓ RESOLVED"
                  : status === "in_progress"
                    ? "⟳ IN PROGRESS"
                    : "● OPEN"}
              </span>
            </div>

            {/* Error text */}
            <div
              className="text-sm font-bold mb-2 leading-snug"
              style={{
                color: isResolved ? "rgba(0,255,136,0.7)" : "#ff7777",
                fontFamily: "monospace",
                textShadow: isResolved
                  ? "none"
                  : "0 0 10px rgba(255,80,80,0.35)",
              }}
            >
              ⚠ {analysis.error_text}
            </div>

            {/* File location */}
            {analysis.error_file && (
              <div
                className="inline-flex items-center gap-2 text-xs px-2 py-1 mb-2"
                style={{
                  background: "rgba(255,204,0,0.06)",
                  border: "1px solid rgba(255,204,0,0.2)",
                  color: "#ffcc00",
                  fontFamily: "monospace",
                }}
              >
                📍 {analysis.error_file}
                {analysis.error_line && (
                  <span className="font-bold" style={{ color: "#ff9900" }}>
                    :{analysis.error_line}
                    {analysis.error_column ? `:${analysis.error_column}` : ""}
                  </span>
                )}
              </div>
            )}

            {/* Action links */}
            <div className="flex items-center gap-2 flex-wrap">
              {analysis.github_pr_url && (
                <a
                  href={analysis.github_pr_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 font-bold transition-all"
                  style={{
                    background: "rgba(138,43,226,0.15)",
                    border: "1px solid rgba(168,85,247,0.5)",
                    color: "#c084fc",
                    textShadow: "0 0 8px rgba(192,132,252,0.4)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(138,43,226,0.3)";
                    e.currentTarget.style.boxShadow =
                      "0 0 15px rgba(138,43,226,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(138,43,226,0.15)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  🔀 AUTO FIX PR READY →
                </a>
              )}
              {analysis.jira_issue_key && (
                <a
                  href={`https://udaykiran333381.atlassian.net/browse/${analysis.jira_issue_key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 transition-all"
                  style={{
                    background: "rgba(0,82,204,0.15)",
                    border: "1px solid rgba(59,130,246,0.4)",
                    color: "#60a5fa",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(0,82,204,0.28)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(0,82,204,0.15)";
                  }}
                >
                  🎯 {analysis.jira_issue_key}
                </a>
              )}
            </div>
          </div>

          {/* Right — time + actions */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span
              className="text-xs"
              style={{ color: "rgba(0,255,255,0.45)", fontFamily: "monospace" }}
            >
              {formatDistanceToNow(new Date(analysis.created_at), {
                addSuffix: true,
              })}
            </span>
            <div className="flex gap-1.5">
              {!isResolved ? (
                <>
                  {status === "open" && (
                    <button
                      onClick={() => updateStatus("in_progress")}
                      className="text-xs px-2 py-1 transition-all"
                      style={{
                        background: "rgba(255,204,0,0.1)",
                        border: "1px solid rgba(255,204,0,0.4)",
                        color: "#ffcc00",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255,204,0,0.22)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255,204,0,0.1)";
                      }}
                    >
                      ⟳ WIP
                    </button>
                  )}
                  <button
                    onClick={() => updateStatus("resolved")}
                    className="text-xs px-2 py-1 font-bold transition-all"
                    style={{
                      background: "rgba(0,255,136,0.1)",
                      border: "1px solid rgba(0,255,136,0.4)",
                      color: "#00ff88",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(0,255,136,0.22)";
                      e.currentTarget.style.boxShadow =
                        "0 0 10px rgba(0,255,136,0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(0,255,136,0.1)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    ✓ RESOLVE
                  </button>
                </>
              ) : (
                <button
                  onClick={() => updateStatus("open")}
                  className="text-xs px-2 py-1 transition-all"
                  style={{
                    background: "rgba(150,150,150,0.1)",
                    border: "1px solid rgba(150,150,150,0.35)",
                    color: "#aaa",
                  }}
                >
                  ↩ REOPEN
                </button>
              )}
            </div>
          </div>
        </div>

        {/* TABS */}
        <div
          className="flex overflow-x-auto"
          style={{ borderBottom: "1px solid rgba(0,255,255,0.12)" }}
        >
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs tracking-widest transition-all whitespace-nowrap"
              style={{
                color: tab === t.key ? t.color : "rgba(0,255,255,0.6)",
                borderBottom:
                  tab === t.key
                    ? `2px solid ${t.color}`
                    : "2px solid transparent",
                background: tab === t.key ? `${t.color}0d` : "transparent",
                textShadow: tab === t.key ? `0 0 8px ${t.color}60` : "none",
                fontWeight: tab === t.key ? "700" : "400",
              }}
            >
              <span>{t.emoji}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <div
          className="p-3 text-xs leading-relaxed"
          style={{
            background: "rgba(0,0,0,0.5)",
            border: "1px solid rgba(0,255,255,0.08)",
            borderTop: "none",
            minHeight: "90px",
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          {tab === "cause" && (
            <p style={{ color: "rgba(0,255,255,0.85)", lineHeight: 1.8 }}>
              {analysis.root_cause || "No root cause analysis available"}
            </p>
          )}
          {tab === "fix" && (
            <pre
              className="whitespace-pre-wrap"
              style={{
                color: "#00ff88",
                fontFamily: "monospace",
                lineHeight: 1.7,
              }}
            >
              {analysis.fix || "No fix available"}
            </pre>
          )}
          {tab === "tests" && (
            <pre
              className="whitespace-pre-wrap"
              style={{
                color: "#ff9944",
                fontFamily: "monospace",
                lineHeight: 1.7,
              }}
            >
              {analysis.tests || "No unit tests available"}
            </pre>
          )}
          {tab === "bdd" && (
            <pre
              className="whitespace-pre-wrap"
              style={{
                color: "#44aaff",
                fontFamily: "monospace",
                lineHeight: 1.7,
              }}
            >
              {analysis.bdd_tests ||
                "No BDD tests — trigger a new error to generate Gherkin tests"}
            </pre>
          )}
          {tab === "explanation" && (
            <div
              className="whitespace-pre-wrap"
              style={{ color: "#ffdd66", lineHeight: 1.8 }}
            >
              {analysis.explanation || "No explanation available"}
            </div>
          )}
          {tab === "stack" &&
            (analysis.stack_trace ? (
              <pre style={{ fontFamily: "monospace", lineHeight: 1.7 }}>
                {analysis.stack_trace.split("\n").map((line, i) => (
                  <div
                    key={i}
                    style={{
                      color:
                        line.includes("sample-app") || line.includes("/app/")
                          ? "#ffdd44"
                          : "rgba(0,255,255,0.5)",
                      fontWeight: line.includes("sample-app") ? "700" : "400",
                    }}
                  >
                    {line}
                  </div>
                ))}
              </pre>
            ) : (
              <span style={{ color: "rgba(0,255,255,0.5)" }}>
                No stack trace available
              </span>
            ))}
        </div>
      </div>

      <style>{`
        @keyframes critical-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(255,0,60,0.25); }
          50% { box-shadow: 0 0 40px rgba(255,0,60,0.55), 0 0 80px rgba(255,0,60,0.15); }
        }
      `}</style>
    </div>
  );
}
