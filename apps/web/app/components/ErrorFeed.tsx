/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import ErrorCard from "./ErrorCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function ErrorFeed() {
  const [errors, setErrors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("all");
  const [search, setSearch] = useState("");

  // Single fetch function used everywhere — always sends auth token
  const fetchErrors = async () => {
    try {
      const token = localStorage.getItem("devmind_token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${API_URL}/api/errors`, { headers });
      const data = await res.json();
      setErrors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch errors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("devmind_token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      try {
        const res = await fetch(`${API_URL}/api/errors`, { headers });
        const data = await res.json();
        setErrors(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch errors:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const filtered = errors.filter((e) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "open"
          ? e.status !== "resolved"
          : e.status === "resolved";

    const matchesSearch =
      search === ""
        ? true
        : e.error_text?.toLowerCase().includes(search.toLowerCase()) ||
          e.service?.toLowerCase().includes(search.toLowerCase()) ||
          e.route?.toLowerCase().includes(search.toLowerCase()) ||
          e.root_cause?.toLowerCase().includes(search.toLowerCase()) ||
          e.anomaly_type?.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div
        className="text-center py-20"
        style={{ color: "rgba(0,255,255,0.3)", fontFamily: "monospace" }}
      >
        LOADING ERRORS...
      </div>
    );
  }

  return (
    <div>
      {/* Search Box */}
      <input
        type="text"
        placeholder="🔍 Search errors... (e.g. 'null errors', 'database', 'high')"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-3 mb-4 text-xs outline-none transition-all"
        style={{
          background: "rgba(0,255,255,0.03)",
          border: "1px solid rgba(0,255,255,0.15)",
          color: "#00ffff",
          fontFamily: "monospace",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "rgba(0,255,255,0.5)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "rgba(0,255,255,0.15)";
        }}
      />

      {/* Filter buttons */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(["all", "open", "resolved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 text-xs tracking-widest uppercase transition-all"
            style={{
              background: filter === f ? "rgba(0,255,255,0.15)" : "transparent",
              border: `1px solid ${filter === f ? "rgba(0,255,255,0.5)" : "rgba(0,255,255,0.15)"}`,
              color: filter === f ? "#00ffff" : "rgba(0,255,255,0.4)",
              fontFamily: "monospace",
            }}
          >
            {f} (
            {
              errors.filter((e) =>
                f === "all"
                  ? true
                  : f === "open"
                    ? e.status !== "resolved"
                    : e.status === "resolved",
              ).length
            }
            )
          </button>
        ))}

        {search && (
          <span
            className="ml-auto text-xs self-center"
            style={{ color: "rgba(0,255,255,0.4)", fontFamily: "monospace" }}
          >
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for
            &quot;{search}&quot;
          </span>
        )}
      </div>

      {filtered.length === 0 ? (
        <div
          className="text-center py-20"
          style={{
            border: "1px dashed rgba(0,255,255,0.1)",
            color: "rgba(0,255,255,0.3)",
            fontFamily: "monospace",
          }}
        >
          {search ? (
            <div>
              <p>NO ERRORS FOUND FOR &quot;{search.toUpperCase()}&quot;</p>
              <button
                onClick={() => setSearch("")}
                className="text-xs mt-3 px-3 py-1 transition-all"
                style={{
                  border: "1px solid rgba(0,255,255,0.2)",
                  color: "rgba(0,255,255,0.5)",
                }}
              >
                CLEAR SEARCH
              </button>
            </div>
          ) : (
            <div>
              <p className="text-lg mb-2">✅</p>
              <p>NO ERRORS — SYSTEM HEALTHY</p>
            </div>
          )}
        </div>
      ) : (
        filtered.map((error) => (
          <ErrorCard
            key={error.id}
            analysis={error}
            onStatusChange={fetchErrors}
          />
        ))
      )}
    </div>
  );
}
