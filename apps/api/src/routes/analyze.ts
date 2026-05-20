import { Router, Request, Response } from "express";
import { pool } from "../db";
import { sendAlerts } from "../lib/notifications";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const router = Router();
const AGENT_URL = process.env.AGENT_URL || "http://localhost:8000";
const JIRA_DOMAIN = process.env.JIRA_DOMAIN;
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY || "SCRUM";

// Get user from API key or JWT token
async function getUserFromRequest(req: Request): Promise<any> {
  const apiKey = req.headers["x-api-key"] as string;
  if (apiKey) {
    console.log(`🔑 API key received: ${apiKey}`); 
    const result = await pool.query("SELECT * FROM users WHERE api_key = $1", [
      apiKey,
    ]);
    if (result.rows.length > 0) return result.rows[0];
  }

  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "devmind-secret-key",
      ) as any;
      const result = await pool.query("SELECT * FROM users WHERE id = $1", [
        decoded.userId,
      ]);
      if (result.rows.length > 0) return result.rows[0];
    } catch {}
  }

  return null;
}

function hashError(error: string, route: string, service: string): string {
  return crypto
    .createHash("sha256")
    .update(`${error}:${route}:${service}`)
    .digest("hex")
    .substring(0, 16);
}

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

async function createJiraIssue(analysis: any, analysisId: number, user?: any) {
  try {
    const jiraDomain = user?.jira_domain || JIRA_DOMAIN;
    const jiraEmail = user?.jira_email || JIRA_EMAIL;
    const jiraToken = user?.jira_api_token || JIRA_API_TOKEN;
    const jiraProject = user?.jira_project_key || JIRA_PROJECT_KEY;

    if (!jiraDomain || !jiraEmail || !jiraToken) return null;

    const credentials = Buffer.from(`${jiraEmail}:${jiraToken}`).toString(
      "base64",
    );

    const issueData = {
      fields: {
        project: { key: jiraProject },
        summary: `[DevMind] ${analysis.error_text?.substring(0, 100)}`,
        description: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "🤖 Auto-detected by DevMind" }],
            },
            {
              type: "paragraph",
              content: [
                { type: "text", text: `Error: ${analysis.error_text}` },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: `Service: ${analysis.service} → ${analysis.route}`,
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                { type: "text", text: `Root Cause: ${analysis.root_cause}` },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: `GitHub PR: ${analysis.github_pr_url || "Not created yet"}`,
                },
              ],
            },
          ],
        },
        issuetype: { name: "Bug" },
        priority: {
          name:
            analysis.severity === "critical"
              ? "Highest"
              : analysis.severity === "high"
                ? "High"
                : analysis.severity === "medium"
                  ? "Medium"
                  : "Low",
        },
        labels: ["devmind", "auto-detected"],
      },
    };

    const jiraRes = await fetch(`https://${jiraDomain}/rest/api/3/issue`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(issueData),
    });

    const jiraIssue = (await jiraRes.json()) as any;

    if (jiraRes.ok) {
      await pool.query(
        "UPDATE analyses SET jira_issue_key = $1 WHERE id = $2",
        [jiraIssue.key, analysisId],
      );
      console.log(`✅ Jira issue created: ${jiraIssue.key}`);
      return jiraIssue.key;
    }
  } catch (err) {
    console.log("Jira creation failed (non-critical):", err);
  }
  return null;
}

// POST /api/analyze
router.post("/", async (req: Request, res: Response) => {
  try {
    const { error, stack, route, service } = req.body;

    // Identify user
    const user = await getUserFromRequest(req);
    const userId = user?.id || null;

    const { file, line, column } = parseStackTrace(stack || "");

    // Use user's GitHub credentials if available
    const githubToken = user?.github_token || process.env.GITHUB_TOKEN;
    const githubOwner = user?.connected_repo_owner || process.env.GITHUB_OWNER;
    const githubRepo = user?.connected_repo || process.env.GITHUB_REPO;

    // Call Python agent service
    const agentRes = await fetch(`${AGENT_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error,
        stack,
        route,
        service,
        file,
        line,
        github_token: githubToken,
        github_owner: githubOwner,
        github_repo: githubRepo,
        user_namespace: `user_${userId || "default"}`,
      }),
    });

    const result = (await agentRes.json()) as any;

    // Error grouping hash
    const errorHash = hashError(error, route || "", service || "");

    const existing = await pool.query(
      "SELECT id, occurrence_count FROM analyses WHERE error_hash = $1 AND (user_id = $2 OR ($2::integer IS NULL AND user_id IS NULL)) ORDER BY created_at DESC LIMIT 1",
      [errorHash, userId],
    );

    let analysisId: number;

    if (existing.rows.length > 0) {
      await pool.query(
        "UPDATE analyses SET occurrence_count = occurrence_count + 1, last_seen = NOW() WHERE id = $1",
        [existing.rows[0].id],
      );
      analysisId = existing.rows[0].id;
      console.log(
        `📊 Error seen ${existing.rows[0].occurrence_count + 1} times`,
      );
    } else {
      const insertResult = await pool.query(
        `INSERT INTO analyses 
          (user_id, service, route, error_text, stack_trace, error_file, error_line,
           error_column, anomaly_type, severity, root_cause, fix, tests,
           bdd_tests, explanation, github_pr_url, status, error_hash,
           occurrence_count, first_seen, last_seen)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'open',$17,1,NOW(),NOW())
         RETURNING id`,
        [
          userId,
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
          errorHash,
        ],
      );
      analysisId = insertResult.rows[0].id;
    }

    // Auto-create Jira issue
    const jiraKey = await createJiraIssue(
      {
        error_text: error,
        service,
        route,
        root_cause: result.root_cause,
        github_pr_url: result.github_pr_url,
        severity: result.anomaly?.severity,
      },
      analysisId,
      user,
    );

    // Send alerts
    await sendAlerts({
      service,
      route,
      error,
      severity: result.anomaly?.severity || "unknown",
      file: file || undefined,
      line: line || undefined,
      jira_key: jiraKey || undefined,
      github_pr_url: result.github_pr_url || undefined,
      dashboard_url: "http://localhost:3002",
    });

    res.json({ success: true, result, jira_key: jiraKey });
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
