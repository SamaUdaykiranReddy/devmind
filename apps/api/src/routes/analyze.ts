import { Router, Request, Response } from "express";
import { pool } from "../db";

const router = Router();
const AGENT_URL = process.env.AGENT_URL || "http://localhost:8000";

// Parse stack trace to extract file, line, column
function parseStackTrace(stack: string) {
  if (!stack) return { file: null, line: null, column: null };
  const match = stack.match(/at .+ \((.+):(\d+):(\d+)\)/);
  if (match) {
    return {
      file: match[1].replace(/\\/g, "/"),
      line: parseInt(match[2]),
      column: parseInt(match[3]),
    };
  }
  return { file: null, line: null, column: null };
}

// POST /api/analyze
router.post("/", async (req: Request, res: Response) => {
  try {
    const { error, stack, route, service } = req.body;

    // Parse stack trace
    const { file, line, column } = parseStackTrace(stack || "");

    // Call Python agent service
    const agentRes = await fetch(`${AGENT_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error, stack, route, service, file, line }),
    });

    const result = (await agentRes.json()) as any;

    // Save to PostgreSQL
    await pool.query(
      `INSERT INTO analyses 
        (service, route, error_text, stack_trace, error_file, error_line, 
         error_column, anomaly_type, severity, root_cause, fix, tests,
         bdd_tests, explanation, github_pr_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'open')`,
      [
        service,
        route,
        error,
        stack || null,
        file,
        line,
        column,
        result.anomaly?.type || "unknown",
        result.anomaly?.severity || "unknown",
        result.root_cause,
        result.fix,
        result.tests,
        result.bdd_tests,
        result.explanation,
        result.github_pr_url,
      ],
    );

    res.json({ success: true, result });
  } catch (err: any) {
    console.error("Analyze error:", err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/analyze/:id/status
router.patch("/:id/status", async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    await pool.query("UPDATE analyses SET status = $1 WHERE id = $2", [
      status,
      req.params.id,
    ]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
