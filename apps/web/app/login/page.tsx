"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(timer);
  }, []);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.token) {
        localStorage.setItem("devmind_token", data.token);
        localStorage.setItem("devmind_user", JSON.stringify(data.user));
        router.push("/");
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Connection failed. Is the API running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden relative">
      {/* Animated grid background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(#00ffff 1px, transparent 1px), linear-gradient(90deg, #00ffff 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        {/* Glowing orbs */}
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-5"
          style={{
            background: "radial-gradient(circle, #00ffff, transparent)",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-5"
          style={{
            background: "radial-gradient(circle, #ff0080, transparent)",
          }}
        />
      </div>

      {/* Scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)",
        }}
      />

      {/* Main card */}
      <div
        className={`relative z-10 w-full max-w-md px-8 py-10 transition-all duration-700 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        style={{
          background: "rgba(0, 0, 0, 0.8)",
          border: "1px solid rgba(0, 255, 255, 0.3)",
          boxShadow:
            "0 0 30px rgba(0, 255, 255, 0.1), inset 0 0 30px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Corner decorations */}
        <div
          className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2"
          style={{ borderColor: "#00ffff" }}
        />
        <div
          className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2"
          style={{ borderColor: "#00ffff" }}
        />
        <div
          className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2"
          style={{ borderColor: "#00ffff" }}
        />
        <div
          className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2"
          style={{ borderColor: "#00ffff" }}
        />

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div
              className="w-10 h-10 flex items-center justify-center text-black font-black text-lg"
              style={{ background: "#00ffff" }}
            >
              DM
            </div>
            <span
              className="text-3xl font-black tracking-widest"
              style={{
                color: "#00ffff",
                fontFamily: "monospace",
                textShadow: "0 0 20px rgba(0, 255, 255, 0.8)",
              }}
            >
              DEVMIND
            </span>
          </div>
          <p
            className="text-xs tracking-[0.3em] uppercase"
            style={{ color: "rgba(0, 255, 255, 0.5)" }}
          >
            Autonomous AI Debugging
          </p>
        </div>

        {/* Status bar */}
        <div
          className="flex items-center gap-2 mb-6 px-3 py-2 text-xs"
          style={{
            background: "rgba(0, 255, 255, 0.05)",
            border: "1px solid rgba(0, 255, 255, 0.15)",
            color: "rgba(0, 255, 255, 0.6)",
            fontFamily: "monospace",
          }}
        >
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "#00ff88" }}
          />
          SYSTEM ONLINE — AUTHENTICATE TO CONTINUE
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              className="block text-xs mb-2 tracking-widest uppercase"
              style={{
                color: "rgba(0, 255, 255, 0.6)",
                fontFamily: "monospace",
              }}
            >
              Access ID
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@devmind.io"
              required
              className="w-full px-4 py-3 text-sm outline-none transition-all"
              style={{
                background: "rgba(0, 255, 255, 0.05)",
                border: "1px solid rgba(0, 255, 255, 0.2)",
                color: "#00ffff",
                fontFamily: "monospace",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(0, 255, 255, 0.6)";
                e.target.style.boxShadow = "0 0 10px rgba(0, 255, 255, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(0, 255, 255, 0.2)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div>
            <label
              className="block text-xs mb-2 tracking-widest uppercase"
              style={{
                color: "rgba(0, 255, 255, 0.6)",
                fontFamily: "monospace",
              }}
            >
              Auth Key
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full px-4 py-3 text-sm outline-none transition-all"
              style={{
                background: "rgba(0, 255, 255, 0.05)",
                border: "1px solid rgba(0, 255, 255, 0.2)",
                color: "#00ffff",
                fontFamily: "monospace",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(0, 255, 255, 0.6)";
                e.target.style.boxShadow = "0 0 10px rgba(0, 255, 255, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(0, 255, 255, 0.2)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {error && (
            <div
              className="px-3 py-2 text-xs"
              style={{
                background: "rgba(255, 0, 60, 0.1)",
                border: "1px solid rgba(255, 0, 60, 0.3)",
                color: "#ff003c",
                fontFamily: "monospace",
              }}
            >
              ⚠ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-sm font-bold tracking-widest uppercase transition-all mt-2"
            style={{
              background: loading ? "rgba(0, 255, 255, 0.1)" : "#00ffff",
              color: loading ? "#00ffff" : "#000",
              fontFamily: "monospace",
              border: "1px solid #00ffff",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                (e.target as HTMLButtonElement).style.background =
                  "rgba(0, 255, 255, 0.8)";
                (e.target as HTMLButtonElement).style.boxShadow =
                  "0 0 20px rgba(0, 255, 255, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                (e.target as HTMLButtonElement).style.background = "#00ffff";
                (e.target as HTMLButtonElement).style.boxShadow = "none";
              }
            }}
          >
            {loading ? "AUTHENTICATING..." : "INITIALIZE SESSION"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div
            className="flex-1 h-px"
            style={{ background: "rgba(0, 255, 255, 0.15)" }}
          />
          <span
            className="text-xs tracking-widest"
            style={{ color: "rgba(0, 255, 255, 0.3)", fontFamily: "monospace" }}
          >
            OR
          </span>
          <div
            className="flex-1 h-px"
            style={{ background: "rgba(0, 255, 255, 0.15)" }}
          />
        </div>

        {/* GitHub OAuth */}
        <button
          onClick={() =>
            (window.location.href = "http://localhost:3001/api/github/connect")
          }
          className="w-full py-3 text-sm font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-3"
          style={{
            background: "transparent",
            color: "#00ffff",
            fontFamily: "monospace",
            border: "1px solid rgba(0, 255, 255, 0.3)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(0, 255, 255, 0.05)";
            e.currentTarget.style.borderColor = "rgba(0, 255, 255, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "rgba(0, 255, 255, 0.3)";
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          CONNECT WITH GITHUB
        </button>

        {/* Register link */}
        <p
          className="text-center mt-5 text-xs"
          style={{ color: "rgba(0, 255, 255, 0.4)", fontFamily: "monospace" }}
        >
          NEW OPERATOR?{" "}
          <a
            href="/register"
            style={{ color: "#00ffff" }}
            className="hover:underline"
          >
            CREATE ACCOUNT
          </a>
        </p>
      </div>
    </div>
  );
}
