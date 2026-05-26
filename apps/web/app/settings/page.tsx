"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface User {
  id: number;
  name: string;
  email: string;
  api_key: string;
  github_username?: string;
  connected_repo?: string;
  connected_repo_owner?: string;
  jira_domain?: string;
  jira_email?: string;
  jira_project_key?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState("");
  const [copied, setCopied] = useState(false);

  // Form states
  const [jiraDomain, setJiraDomain] = useState("");
  const [jiraEmail, setJiraEmail] = useState("");
  const [jiraToken, setJiraToken] = useState("");
  const [jiraProject, setJiraProject] = useState("SCRUM");
  const [slackWebhook, setSlackWebhook] = useState("");
  const [toEmail, setToEmail] = useState("");

  const fetchUserData = async (tok: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      const data = await res.json();
      setUser(data);
      // Pre-fill form fields
      setJiraDomain(data.jira_domain || "");
      setJiraEmail(data.jira_email || "");
      setJiraProject(data.jira_project_key || "SCRUM");
      setToEmail(data.email || "");
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  };
  useEffect(() => {
    const init = async () => {
      const storedToken = localStorage.getItem("devmind_token");
      const storedUser = localStorage.getItem("devmind_user");

      if (!storedToken) {
        router.push("/login");
        return;
      }

      setToken(storedToken);

      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser({ ...parsed, api_key: parsed.api_key || parsed.apiKey });
      }

      await fetchUserData(storedToken);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSettings = async (
    section: string,
    data: Record<string, string>,
  ) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setSaved(section);
        setTimeout(() => setSaved(""), 3000);
        // Update localStorage
        if (user) {
          const updated = { ...user, ...data };
          localStorage.setItem("devmind_user", JSON.stringify(updated));
          setUser(updated);
        }
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const copyApiKey = () => {
    if (user?.api_key) {
      navigator.clipboard.writeText(user.api_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const panelStyle = {
    background: "rgba(0,0,0,0.6)",
    border: "1px solid rgba(0,255,255,0.2)",
  };

  const inputStyle = {
    background: "rgba(0,255,255,0.04)",
    border: "1px solid rgba(0,255,255,0.2)",
    color: "#00ffff",
    fontFamily: "monospace",
    outline: "none",
    width: "100%",
    padding: "8px 12px",
    fontSize: "12px",
  };

  const labelStyle = {
    color: "rgba(0,255,255,0.6)",
    fontSize: "11px",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    marginBottom: "6px",
    display: "block",
    fontFamily: "monospace",
  };

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "#000",
          color: "#00ffff",
          fontFamily: "monospace",
        }}
      >
        LOADING...
      </div>
    );
  }

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
      </div>

      {/* Header */}
      <header
        className="z-10 px-6 py-4 flex items-center justify-between sticky top-0"
        style={{
          borderBottom: "1px solid rgba(0,255,255,0.15)",
          background: "rgba(0,0,0,0.95)",
        }}
      >
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div
              className="w-9 h-9 flex items-center justify-center text-black font-black text-sm"
              style={{ background: "#00ffff" }}
            >
              DM
            </div>
            <div
              className="text-xl font-black tracking-widest"
              style={{ textShadow: "0 0 15px rgba(0,255,255,0.6)" }}
            >
              DEVMIND
            </div>
          </Link>
          <span className="text-xs opacity-40">/ SETTINGS</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs opacity-60">
            OPERATOR:{" "}
            <span style={{ color: "#00ffff" }}>{user.name?.toUpperCase()}</span>
          </span>
          <Link
            href="/"
            className="text-xs px-4 py-2 tracking-widest transition-all"
            style={{
              border: "1px solid rgba(0,255,255,0.3)",
              color: "rgba(0,255,255,0.7)",
            }}
          >
            ← DASHBOARD
          </Link>
        </div>
      </header>

      <div className="relative z-10 px-6 py-6 max-w-3xl mx-auto space-y-6">
        {/* Page title */}
        <div>
          <h1
            className="text-2xl font-black tracking-widest mb-1"
            style={{ textShadow: "0 0 15px rgba(0,255,255,0.4)" }}
          >
            ⚙️ SETTINGS
          </h1>
          <p className="text-xs opacity-40">
            Configure your DevMind integrations
          </p>
        </div>

        {/* Profile */}
        <div className="p-5" style={panelStyle}>
          <div className="text-xs tracking-widest mb-4 opacity-70 flex items-center gap-2">
            👤 PROFILE
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Name</label>
              <div
                className="px-3 py-2 text-xs"
                style={{ ...inputStyle, color: "rgba(0,255,255,0.6)" }}
              >
                {user.name}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <div
                className="px-3 py-2 text-xs"
                style={{ ...inputStyle, color: "rgba(0,255,255,0.6)" }}
              >
                {user.email}
              </div>
            </div>
          </div>
        </div>

        {/* API Key */}
        <div className="p-5" style={panelStyle}>
          <div className="text-xs tracking-widest mb-4 opacity-70">
            🔑 API KEY
          </div>
          <p className="text-xs opacity-50 mb-3">
            Use this key in devmind-sdk to send errors to your account.
          </p>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="flex-1 px-3 py-2 text-xs font-mono truncate"
              style={{
                background: "rgba(0,255,0,0.05)",
                border: "1px solid rgba(0,255,0,0.2)",
                color: "#00ff88",
              }}
            >
              {user.api_key}
            </div>
            <button
              onClick={copyApiKey}
              className="px-3 py-2 text-xs transition-all shrink-0"
              style={{
                background: copied ? "#00ff88" : "rgba(0,255,255,0.1)",
                border: "1px solid rgba(0,255,255,0.3)",
                color: copied ? "#000" : "#00ffff",
              }}
            >
              {copied ? "✓ COPIED" : "COPY"}
            </button>
          </div>
          <div
            className="text-xs p-3"
            style={{
              background: "rgba(0,255,255,0.03)",
              border: "1px solid rgba(0,255,255,0.08)",
            }}
          >
            <span className="opacity-50"># Usage:</span>
            <br />
            DevMind.init({"{"}apiKey: &apos;{user.api_key?.substring(0, 20)}
            ...&apos;, service: &apos;my-app&apos;{"}"})
          </div>
        </div>

        {/* GitHub */}
        <div className="p-5" style={panelStyle}>
          <div className="text-xs tracking-widest mb-4 opacity-70">
            🐙 GITHUB
          </div>
          {user.github_username ? (
            <div>
              <div
                className="flex items-center gap-3 mb-3 p-3"
                style={{
                  background: "rgba(0,255,136,0.05)",
                  border: "1px solid rgba(0,255,136,0.2)",
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#00ff88" }}
                />
                <div>
                  <div className="text-xs" style={{ color: "#00ff88" }}>
                    ✓ Connected as @{user.github_username}
                  </div>
                  {user.connected_repo && (
                    <div className="text-xs opacity-50 mt-1">
                      Repo: {user.connected_repo_owner}/{user.connected_repo}
                    </div>
                  )}
                </div>
              </div>
              <a
                href={`${API_URL}/api/github/connect`}
                className="text-xs px-3 py-2 transition-all inline-block"
                style={{
                  border: "1px solid rgba(0,255,255,0.2)",
                  color: "rgba(0,255,255,0.6)",
                }}
              >
                RECONNECT GITHUB
              </a>
            </div>
          ) : (
            <div>
              <p className="text-xs opacity-50 mb-3">
                Connect GitHub to enable automatic PR creation in your repos.
              </p>
              <a
                href={`${API_URL}/api/github/connect`}
                className="inline-flex items-center gap-2 text-xs px-4 py-2 font-bold transition-all"
                style={{ background: "#00ffff", color: "#000" }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                CONNECT GITHUB
              </a>
            </div>
          )}
        </div>

        {/* Jira */}
        <div className="p-5" style={panelStyle}>
          <div className="text-xs tracking-widest mb-4 opacity-70">
            🎯 JIRA INTEGRATION
          </div>
          <p className="text-xs opacity-50 mb-4">
            Configure Jira to auto-create bug tickets for every error.
          </p>
          <div className="space-y-3">
            <div>
              <label style={labelStyle}>Jira Domain</label>
              <input
                type="text"
                value={jiraDomain}
                onChange={(e) => setJiraDomain(e.target.value)}
                placeholder="yourorg.atlassian.net"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(0,255,255,0.5)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(0,255,255,0.2)";
                }}
              />
            </div>
            <div>
              <label style={labelStyle}>Jira Email</label>
              <input
                type="email"
                value={jiraEmail}
                onChange={(e) => setJiraEmail(e.target.value)}
                placeholder="your@email.com"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(0,255,255,0.5)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(0,255,255,0.2)";
                }}
              />
            </div>
            <div>
              <label style={labelStyle}>Jira API Token</label>
              <input
                type="password"
                value={jiraToken}
                onChange={(e) => setJiraToken(e.target.value)}
                placeholder="your-jira-api-token"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(0,255,255,0.5)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(0,255,255,0.2)";
                }}
              />
              <p className="text-xs opacity-40 mt-1">
                Get from: id.atlassian.com/manage-api-tokens
              </p>
            </div>
            <div>
              <label style={labelStyle}>Project Key</label>
              <input
                type="text"
                value={jiraProject}
                onChange={(e) => setJiraProject(e.target.value)}
                placeholder="SCRUM"
                style={{ ...inputStyle, width: "120px" }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(0,255,255,0.5)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(0,255,255,0.2)";
                }}
              />
            </div>
            <button
              onClick={() =>
                saveSettings("jira", {
                  jira_domain: jiraDomain,
                  jira_email: jiraEmail,
                  jira_api_token: jiraToken,
                  jira_project_key: jiraProject,
                })
              }
              disabled={saving}
              className="text-xs px-4 py-2 font-bold tracking-widest transition-all"
              style={{
                background: saved === "jira" ? "#00ff88" : "#00ffff",
                color: "#000",
              }}
            >
              {saved === "jira"
                ? "✓ SAVED!"
                : saving
                  ? "SAVING..."
                  : "SAVE JIRA SETTINGS"}
            </button>
          </div>
        </div>

        {/* Slack */}
        <div className="p-5" style={panelStyle}>
          <div className="text-xs tracking-widest mb-4 opacity-70">
            💬 SLACK NOTIFICATIONS
          </div>
          <p className="text-xs opacity-50 mb-4">
            Get instant Slack alerts when errors are detected.
          </p>
          <div className="space-y-3">
            <div>
              <label style={labelStyle}>Slack Webhook URL</label>
              <input
                type="text"
                value={slackWebhook}
                onChange={(e) => setSlackWebhook(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(0,255,255,0.5)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(0,255,255,0.2)";
                }}
              />
              <p className="text-xs opacity-40 mt-1">
                Get from: api.slack.com/apps → Incoming Webhooks
              </p>
            </div>
            <button
              onClick={() =>
                saveSettings("slack", { slack_webhook_url: slackWebhook })
              }
              disabled={saving}
              className="text-xs px-4 py-2 font-bold tracking-widest transition-all"
              style={{
                background: saved === "slack" ? "#00ff88" : "#00ffff",
                color: "#000",
              }}
            >
              {saved === "slack"
                ? "✓ SAVED!"
                : saving
                  ? "SAVING..."
                  : "SAVE SLACK SETTINGS"}
            </button>
          </div>
        </div>

        {/* Email */}
        <div className="p-5" style={panelStyle}>
          <div className="text-xs tracking-widest mb-4 opacity-70">
            📧 EMAIL ALERTS
          </div>
          <p className="text-xs opacity-50 mb-4">
            Receive email alerts when errors are detected.
          </p>
          <div className="space-y-3">
            <div>
              <label style={labelStyle}>Alert Email</label>
              <input
                type="email"
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                placeholder="your@email.com"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(0,255,255,0.5)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(0,255,255,0.2)";
                }}
              />
            </div>
            <button
              onClick={() => saveSettings("email", { to_email: toEmail })}
              disabled={saving}
              className="text-xs px-4 py-2 font-bold tracking-widest transition-all"
              style={{
                background: saved === "email" ? "#00ff88" : "#00ffff",
                color: "#000",
              }}
            >
              {saved === "email"
                ? "✓ SAVED!"
                : saving
                  ? "SAVING..."
                  : "SAVE EMAIL SETTINGS"}
            </button>
          </div>
        </div>

        {/* Quick Setup Guide */}
        <div
          className="p-5"
          style={{ ...panelStyle, borderColor: "rgba(0,255,136,0.2)" }}
        >
          <div
            className="text-xs tracking-widest mb-4"
            style={{ color: "#00ff88" }}
          >
            🚀 QUICK SETUP GUIDE
          </div>
          <div className="space-y-3 text-xs">
            {[
              { step: "01", text: "Install SDK: npm install devmind-sdk" },
              {
                step: "02",
                text: `Initialize with your API key: ${user.api_key?.substring(0, 20)}...`,
              },
              { step: "03", text: "Connect GitHub to enable auto-PR creation" },
              { step: "04", text: "Configure Jira to auto-create bug tickets" },
              { step: "05", text: "Add Slack webhook for instant alerts" },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <span
                  className="px-2 py-0.5 text-xs font-bold shrink-0"
                  style={{ background: "#00ff88", color: "#000" }}
                >
                  {step}
                </span>
                <span style={{ color: "rgba(0,255,255,0.7)" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
