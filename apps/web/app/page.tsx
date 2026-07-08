"use client";
import { useEffect, useState } from "react";
import ErrorFeed from "./components/ErrorFeed";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://devmind-production-f6bb.up.railway.app";

interface Stats {
  total: number;
  last_24_hours: number;
  by_severity: { severity: string; count: string }[];
  by_service: { service: string; count: string }[];
  top_recurring: {
    error_text: string;
    occurrence_count: number;
    service: string;
  }[];
}

interface User {
  id: number;
  name: string;
  email: string;
  api_key: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);

  useEffect(() => {
    const loadUser = () => {
      const stored = localStorage.getItem("devmind_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser({ ...parsed, api_key: parsed.api_key || parsed.apiKey });
        } catch {}
      }
    };
    loadUser();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTime(new Date());

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("devmind_token");
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`${API_URL}/api/errors/stats`, { headers });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };

    fetchStats();
    const statsInterval = setInterval(fetchStats, 10000);
    const timeInterval = setInterval(() => setTime(new Date()), 1000);

    return () => {
      clearInterval(statsInterval);
      clearInterval(timeInterval);
    };
  }, []);

  const apiKey = user?.api_key || "dm_live_••••••••••••••••••••••••••••••••";

  const copyApiKey = () => {
    if (user?.api_key) {
      navigator.clipboard.writeText(user.api_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("devmind_token");
    localStorage.removeItem("devmind_user");
    setUser(null);
  };

  const getSeverityCount = (sev: string) => {
    if (!stats) return 0;
    const found = stats.by_severity.find((s) => s.severity === sev);
    return found ? parseInt(found.count) : 0;
  };

  const panelStyle = {
    background: "rgba(0, 0, 0, 0.6)",
    border: "1px solid rgba(0, 255, 255, 0.2)",
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "#000", color: "#00ffff", fontFamily: "monospace" }}
    >
      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#00ffff 1px, transparent 1px), linear-gradient(90deg, #00ffff 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)",
          }}
        />
      </div>

      {/* Header */}
      <header
        className="z-10 px-6 py-4 flex items-center justify-between sticky top-0"
        style={{
          borderBottom: "1px solid rgba(0, 255, 255, 0.15)",
          background: "rgba(0, 0, 0, 0.95)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-9 h-9 flex items-center justify-center text-black font-black text-sm"
            style={{ background: "#00ffff" }}
          >
            DM
          </div>
          <div>
            <div
              className="text-xl font-black tracking-widest"
              style={{ textShadow: "0 0 15px rgba(0, 255, 255, 0.6)" }}
            >
              DEVMIND
            </div>
            <div className="text-xs opacity-50 tracking-widest">
              AUTONOMOUS DEBUGGING PLATFORM
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "#00ff88" }}
          />
          <span className="text-xs tracking-widest opacity-70">
            LIVE MONITORING
          </span>
          <span
            className="text-xs px-3 py-1"
            style={{
              border: "1px solid rgba(0, 255, 255, 0.2)",
              color: "rgba(0, 255, 255, 0.5)",
            }}
          >
            {time ? time.toLocaleTimeString() : "--:--:--"}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="text-xs opacity-60">
                OPERATOR:{" "}
                <span style={{ color: "#00ffff" }}>
                  {user.name?.toUpperCase()}
                </span>
              </div>
              <a
                href="/settings"
                className="text-xs tracking-widest px-3 py-2 transition-all"
                style={{
                  border: "1px solid rgba(0,255,255,0.2)",
                  color: "rgba(0,255,255,0.6)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(0,255,255,0.5)";
                  e.currentTarget.style.color = "#00ffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(0,255,255,0.2)";
                  e.currentTarget.style.color = "rgba(0,255,255,0.6)";
                }}
              >
                ⚙️ SETTINGS
              </a>
              <button
                onClick={handleLogout}
                className="text-xs tracking-widest px-4 py-2 transition-all"
                style={{
                  border: "1px solid rgba(255, 0, 60, 0.3)",
                  color: "rgba(255, 0, 60, 0.7)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255, 0, 60, 0.7)";
                  e.currentTarget.style.color = "#ff003c";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255, 0, 60, 0.3)";
                  e.currentTarget.style.color = "rgba(255, 0, 60, 0.7)";
                }}
              >
                LOGOUT
              </button>
            </>
          ) : (
            <>
              <a
                href="/login"
                className="text-xs tracking-widest px-4 py-2 transition-all"
                style={{
                  border: "1px solid rgba(0, 255, 255, 0.3)",
                  color: "rgba(0, 255, 255, 0.7)",
                }}
              >
                SIGN IN
              </a>
              <a
                href="/register"
                className="text-xs tracking-widest px-4 py-2 text-black font-bold"
                style={{ background: "#00ffff" }}
              >
                REGISTER
              </a>
            </>
          )}
        </div>
      </header>

      <div className="relative z-10 px-6 py-6 max-w-7xl mx-auto">
        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            {
              label: "TOTAL ERRORS",
              value: stats?.total || 0,
              color: "#00ffff",
            },
            {
              label: "LAST 24H",
              value: stats?.last_24_hours || 0,
              color: "#00ffff",
            },
            {
              label: "CRITICAL",
              value: getSeverityCount("critical"),
              color: "#ff003c",
            },
            {
              label: "HIGH",
              value: getSeverityCount("high"),
              color: "#ff6600",
            },
            {
              label: "MEDIUM",
              value: getSeverityCount("medium"),
              color: "#ffcc00",
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="px-4 py-3 relative overflow-hidden"
              style={panelStyle}
            >
              <div className="text-xs opacity-50 tracking-widest mb-1">
                {label}
              </div>
              <div
                className="text-3xl font-black"
                style={{ color, textShadow: `0 0 15px ${color}50` }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Error Feed */}
          <div className="lg:col-span-2">
            <div
              className="px-4 py-3 mb-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid rgba(0, 255, 255, 0.15)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: "#00ff88" }}
                />
                <span className="text-sm tracking-widest">RECENT ERRORS</span>
              </div>
              <span className="text-xs opacity-40">AUTO-REFRESH 5s</span>
            </div>
            <ErrorFeed />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Connect Your App */}
            <div className="p-4" style={panelStyle}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs tracking-widest opacity-70">
                  CONNECT YOUR APP
                </div>
                <button
                  onClick={() => setShowConnectModal(true)}
                  className="text-xs px-2 py-1 transition-all"
                  style={{
                    background: "rgba(0, 255, 255, 0.1)",
                    border: "1px solid rgba(0, 255, 255, 0.3)",
                    color: "#00ffff",
                  }}
                >
                  SETUP GUIDE
                </button>
              </div>

              <div
                className="text-xs p-3 mb-3 leading-relaxed"
                style={{
                  background: "rgba(0, 255, 255, 0.05)",
                  border: "1px solid rgba(0, 255, 255, 0.1)",
                  color: "rgba(0, 255, 255, 0.8)",
                }}
              >
                <span className="opacity-40"># 1. Install</span>
                <br />
                <span style={{ color: "#00ff88" }}>
                  npm install devmind-sdk
                </span>
                <br />
                <br />
                <span className="opacity-40"># 2. Initialize</span>
                <br />
                <span style={{ color: "#ffcc00" }}>const</span> DevMind ={" "}
                <span style={{ color: "#ff6600" }}>require</span>
                <span style={{ color: "#ffffff" }}>(</span>
                <span style={{ color: "#00ff88" }}>
                  &apos;devmind-sdk&apos;
                </span>
                <span style={{ color: "#ffffff" }}>)</span>
                <br />
                DevMind.<span style={{ color: "#ff6600" }}>init</span>
                <span style={{ color: "#ffffff" }}>({"{"}</span>
                <br />
                &nbsp;&nbsp;service:{" "}
                <span style={{ color: "#00ff88" }}>&apos;my-app&apos;</span>,
                <br />
                &nbsp;&nbsp;apiKey:{" "}
                <span style={{ color: "#00ff88" }}>&apos;YOUR_KEY&apos;</span>
                <br />
                <span style={{ color: "#ffffff" }}>{"})"}</span>
              </div>

              {user ? (
                <>
                  <div className="text-xs opacity-50 mb-2 tracking-widest">
                    YOUR API KEY
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex-1 px-3 py-2 text-xs truncate"
                      style={{
                        background: "rgba(0, 255, 0, 0.05)",
                        border: "1px solid rgba(0, 255, 0, 0.2)",
                        color: "#00ff88",
                      }}
                    >
                      {apiKey}
                    </div>
                    <button
                      onClick={copyApiKey}
                      className="px-3 py-2 text-xs transition-all shrink-0"
                      style={{
                        background: copied
                          ? "#00ff88"
                          : "rgba(0, 255, 255, 0.1)",
                        border: "1px solid rgba(0, 255, 255, 0.3)",
                        color: copied ? "#000" : "#00ffff",
                      }}
                    >
                      {copied ? "✓ COPIED" : "COPY"}
                    </button>
                  </div>
                </>
              ) : (
                <a
                  href="/login"
                  className="block text-center py-2 text-xs tracking-widest transition-all"
                  style={{
                    background: "rgba(0, 255, 255, 0.05)",
                    border: "1px solid rgba(0, 255, 255, 0.2)",
                    color: "#00ffff",
                  }}
                >
                  SIGN IN TO GET API KEY →
                </a>
              )}
            </div>

            {/* Top Recurring */}
            <div className="p-4" style={panelStyle}>
              <div className="text-xs tracking-widest mb-3 opacity-70">
                TOP RECURRING ERRORS
              </div>
              {stats?.top_recurring?.length ? (
                stats.top_recurring.slice(0, 4).map((err, i) => (
                  <div
                    key={i}
                    className="py-2 flex items-start gap-3"
                    style={{
                      borderBottom:
                        i < 3 ? "1px solid rgba(0, 255, 255, 0.08)" : "none",
                    }}
                  >
                    <div
                      className="text-xs px-2 py-1 font-bold shrink-0"
                      style={{
                        background: "rgba(255, 102, 0, 0.2)",
                        color: "#ff6600",
                        border: "1px solid rgba(255, 102, 0, 0.3)",
                      }}
                    >
                      {err.occurrence_count}x
                    </div>
                    <div>
                      <div
                        className="text-xs leading-tight"
                        style={{ color: "rgba(0, 255, 255, 0.8)" }}
                      >
                        {err.error_text?.substring(0, 45)}...
                      </div>
                      <div className="text-xs opacity-40 mt-1">
                        {err.service}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs opacity-30">No data yet</div>
              )}
            </div>

            {/* Monitored Services */}
            <div className="p-4" style={panelStyle}>
              <div className="text-xs tracking-widest mb-3 opacity-70">
                MONITORED SERVICES
              </div>
              {stats?.by_service?.length ? (
                stats.by_service.map((svc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2"
                    style={{
                      borderBottom:
                        i < stats.by_service.length - 1
                          ? "1px solid rgba(0, 255, 255, 0.08)"
                          : "none",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: "#00ff88" }}
                      />
                      <span
                        className="text-xs"
                        style={{ color: "rgba(0, 255, 255, 0.8)" }}
                      >
                        {svc.service}
                      </span>
                    </div>
                    <div
                      className="text-xs px-2 py-1"
                      style={{
                        background: "rgba(0, 255, 255, 0.08)",
                        color: "#00ffff",
                        border: "1px solid rgba(0, 255, 255, 0.15)",
                      }}
                    >
                      {svc.count} errors
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs opacity-30">No services yet</div>
              )}
            </div>

            {/* GitHub Connect */}
            <a
              href={`${API_URL}/api/github/connect`}
              className="block p-4 transition-all"
              style={panelStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(0, 255, 255, 0.5)";
                e.currentTarget.style.background = "rgba(0, 255, 255, 0.03)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(0, 255, 255, 0.2)";
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.6)";
              }}
            >
              <div className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#00ffff">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <div>
                  <div className="text-xs tracking-widest">
                    CONNECT GITHUB REPO
                  </div>
                  <div className="text-xs opacity-40 mt-1">
                    Auto-index codebase into RAG
                  </div>
                </div>
                <div className="ml-auto text-xs opacity-40">→</div>
              </div>
            </a>

            {/* Predict Patterns */}
            <button
              onClick={async () => {
                const token = localStorage.getItem("devmind_token");
                const headers: Record<string, string> = {
                  "Content-Type": "application/json",
                };
                if (token) headers["Authorization"] = `Bearer ${token}`;
                const res = await fetch(`${API_URL}/api/errors/predict`, {
                  method: "POST",
                  headers,
                });
                const data = await res.json();
                alert(
                  data.has_pattern
                    ? `⚠️ Pattern detected!\n\n${data.pattern_description}\n\nRisk: ${data.risk_level}\n\nRecommendation: ${data.recommendation}`
                    : "✅ No patterns detected. System looks healthy!",
                );
              }}
              className="w-full p-4 text-left transition-all"
              style={panelStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 204, 0, 0.5)";
                e.currentTarget.style.background = "rgba(255, 204, 0, 0.03)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(0, 255, 255, 0.2)";
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.6)";
              }}
            >
              <div className="flex items-center gap-3">
                <div className="text-lg" style={{ color: "#ffcc00" }}>
                  ⚡
                </div>
                <div>
                  <div
                    className="text-xs tracking-widest"
                    style={{ color: "#ffcc00" }}
                  >
                    RUN PATTERN DETECTION
                  </div>
                  <div className="text-xs opacity-40 mt-1">
                    AI predicts potential outages
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Setup Guide Modal */}
      {showConnectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0, 0, 0, 0.85)" }}
          onClick={() => setShowConnectModal(false)}
        >
          <div
            className="w-full max-w-lg p-6 relative"
            style={{
              background: "#000",
              border: "1px solid rgba(0, 255, 255, 0.4)",
              boxShadow: "0 0 40px rgba(0, 255, 255, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {[
              "top-0 left-0 border-t-2 border-l-2",
              "top-0 right-0 border-t-2 border-r-2",
              "bottom-0 left-0 border-b-2 border-l-2",
              "bottom-0 right-0 border-b-2 border-r-2",
            ].map((pos, i) => (
              <div
                key={i}
                className={`absolute w-4 h-4 ${pos}`}
                style={{ borderColor: "#00ffff" }}
              />
            ))}
            <div className="flex items-center justify-between mb-4">
              <div
                className="text-sm tracking-widest font-bold"
                style={{ textShadow: "0 0 10px rgba(0,255,255,0.5)" }}
              >
                SETUP GUIDE
              </div>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-xs opacity-50 hover:opacity-100 px-2 py-1"
                style={{ border: "1px solid rgba(0,255,255,0.2)" }}
              >
                CLOSE
              </button>
            </div>
            <div className="space-y-4 text-xs">
              {[
                {
                  step: "01",
                  title: "INSTALL SDK",
                  code: "npm install devmind-sdk",
                  color: "#00ff88",
                },
                {
                  step: "02",
                  title: "INITIALIZE",
                  code: `const DevMind = require('devmind-sdk')\nDevMind.init({\n  service: 'my-app',\n  apiKey: '${user?.api_key || "YOUR_API_KEY"}',\n  apiUrl: '${API_URL}'\n})`,
                  color: "#00ffff",
                },
                {
                  step: "03",
                  title: "OPTIONAL — EXPRESS MIDDLEWARE",
                  code: "app.use(DevMind.middleware())",
                  color: "#ffcc00",
                },
                {
                  step: "04",
                  title: "TRIGGER TEST ERROR",
                  code: `curl ${API_URL}/api/analyze`,
                  color: "#ff6600",
                },
              ].map(({ step, title, code, color }) => (
                <div
                  key={step}
                  className="p-3"
                  style={{
                    background: "rgba(0,255,255,0.03)",
                    border: "1px solid rgba(0,255,255,0.1)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-xs font-bold px-2 py-0.5"
                      style={{ background: color, color: "#000" }}
                    >
                      {step}
                    </span>
                    <span
                      className="tracking-widest opacity-70"
                      style={{ color }}
                    >
                      {title}
                    </span>
                  </div>
                  <pre
                    className="text-xs leading-relaxed"
                    style={{ color: "rgba(0,255,255,0.7)" }}
                  >
                    {code}
                  </pre>
                </div>
              ))}
            </div>
            <div
              className="mt-4 p-3 text-xs"
              style={{
                background: "rgba(0,255,0,0.05)",
                border: "1px solid rgba(0,255,0,0.2)",
                color: "#00ff88",
              }}
            >
              ✓ After setup — errors auto-create GitHub PRs, Jira tickets, and
              Slack alerts
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
