"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (data.token) {
        localStorage.setItem("devmind_token", data.token);
        localStorage.setItem("devmind_user", JSON.stringify(data.user));
        router.push("/");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch {
      setError("Connection failed. Is the API running?");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "rgba(0, 255, 255, 0.05)",
    border: "1px solid rgba(0, 255, 255, 0.2)",
    color: "#00ffff",
    fontFamily: "monospace",
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden relative">
      {/* Grid background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(#00ffff 1px, transparent 1px), linear-gradient(90deg, #00ffff 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full opacity-5"
          style={{
            background: "radial-gradient(circle, #00ffff, transparent)",
          }}
        />
        <div
          className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full opacity-5"
          style={{
            background: "radial-gradient(circle, #ff0080, transparent)",
          }}
        />
      </div>

      {/* Scanlines */}
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
        {[
          "top-0 left-0 border-t-2 border-l-2",
          "top-0 right-0 border-t-2 border-r-2",
          "bottom-0 left-0 border-b-2 border-l-2",
          "bottom-0 right-0 border-b-2 border-r-2",
        ].map((pos, i) => (
          <div
            key={i}
            className={`absolute w-6 h-6 ${pos}`}
            style={{ borderColor: "#00ffff" }}
          />
        ))}

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
            Create Operator Account
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
          NEW OPERATOR REGISTRATION — FILL ALL FIELDS
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          {[
            {
              label: "Operator Name",
              value: name,
              setter: setName,
              type: "text",
              placeholder: "John Doe",
            },
            {
              label: "Access ID",
              value: email,
              setter: setEmail,
              type: "email",
              placeholder: "operator@devmind.io",
            },
            {
              label: "Auth Key",
              value: password,
              setter: setPassword,
              type: "password",
              placeholder: "••••••••••••",
            },
          ].map(({ label, value, setter, type, placeholder }) => (
            <div key={label}>
              <label
                className="block text-xs mb-2 tracking-widest uppercase"
                style={{
                  color: "rgba(0, 255, 255, 0.6)",
                  fontFamily: "monospace",
                }}
              >
                {label}
              </label>
              <input
                type={type}
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder={placeholder}
                required
                className="w-full px-4 py-3 text-sm outline-none transition-all"
                style={inputStyle}
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
          ))}

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
                e.currentTarget.style.background = "rgba(0, 255, 255, 0.8)";
                e.currentTarget.style.boxShadow =
                  "0 0 20px rgba(0, 255, 255, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = "#00ffff";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          >
            {loading ? "CREATING ACCOUNT..." : "CREATE OPERATOR ACCOUNT"}
          </button>
        </form>

        {/* Login link */}
        <p
          className="text-center mt-5 text-xs"
          style={{ color: "rgba(0, 255, 255, 0.4)", fontFamily: "monospace" }}
        >
          ALREADY AN OPERATOR?{" "}
          <a
            href="/login"
            style={{ color: "#00ffff" }}
            className="hover:underline"
          >
            SIGN IN
          </a>
        </p>
      </div>
    </div>
  );
}
