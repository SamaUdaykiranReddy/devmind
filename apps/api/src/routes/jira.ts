import { Router, Request, Response } from "express";
import { pool } from "../db";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "devmind-secret-key";

const JIRA_DOMAIN = process.env.JIRA_DOMAIN;
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY || "SCRUM";

// Base64 encode credentials
const getAuthHeader = () => {
  const credentials = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString(
    "base64",
  );
  return `Basic ${credentials}`;
};

// POST /api/jira/create-issue — create Jira bug from error
router.post("/create-issue", async (req: Request, res: Response) => {
  try {
    const { analysis_id } = req.body;

    // Get analysis from database
    const result = await pool.query("SELECT * FROM analyses WHERE id = $1", [
      analysis_id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    const analysis = result.rows[0];

    // Create Jira issue
    const issueData = {
      fields: {
        project: { key: JIRA_PROJECT_KEY },
        summary: `[DevMind] ${analysis.error_text?.substring(0, 100)}`,
        description: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: `🤖 Auto-detected by DevMind\n\n`,
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: `Error: ${analysis.error_text}`,
                },
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
                {
                  type: "text",
                  text: `Root Cause: ${analysis.root_cause}`,
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: `Fix: ${analysis.fix?.substring(0, 500)}`,
                },
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

    const jiraRes = await fetch(`https://${JIRA_DOMAIN}/rest/api/3/issue`, {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(issueData),
    });

    const jiraIssue = (await jiraRes.json()) as any;

    if (!jiraRes.ok) {
      return res.status(400).json({ error: jiraIssue });
    }

    // Save Jira issue key to database
    await pool.query("UPDATE analyses SET jira_issue_key = $1 WHERE id = $2", [
      jiraIssue.key,
      analysis_id,
    ]);

    res.json({
      success: true,
      jira_key: jiraIssue.key,
      jira_url: `https://${JIRA_DOMAIN}/browse/${jiraIssue.key}`,
    });
  } catch (err: any) {
    console.error("Jira error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/jira/issues — get all Jira issues linked to analyses
router.get("/issues", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT id, error_text, severity, jira_issue_key, created_at FROM analyses WHERE jira_issue_key IS NOT NULL",
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/jira/comment — add comment to Jira issue
router.post("/comment", async (req: Request, res: Response) => {
  try {
    const { issue_key, comment } = req.body;

    const jiraRes = await fetch(
      `https://${JIRA_DOMAIN}/rest/api/3/issue/${issue_key}/comment`,
      {
        method: "POST",
        headers: {
          Authorization: getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: {
            type: "doc",
            version: 1,
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: comment }],
              },
            ],
          },
        }),
      },
    );

    const data = await jiraRes.json();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
