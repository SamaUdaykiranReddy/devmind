import { Router, Request, Response } from "express";
import { pool } from "../db";
import jwt from "jsonwebtoken";

const router = Router();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3002";
const JWT_SECRET = process.env.JWT_SECRET || "devmind-secret-key";

// Step 1 — Redirect to GitHub OAuth
router.get("/connect", (req: Request, res: Response) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo,workflow&redirect_uri=${GITHUB_CALLBACK_URL}`;
  res.redirect(githubAuthUrl);
});

// Step 2 — GitHub redirects back here with code
router.get("/callback", async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect(`${FRONTEND_URL}?error=no_code`);
    }

    // Exchange code for access token
    const tokenRes = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
        }),
      },
    );

    const tokenData = (await tokenRes.json()) as any;
    const githubToken = tokenData.access_token;

    if (!githubToken) {
      return res.redirect(`${FRONTEND_URL}?error=no_token`);
    }

    // Get GitHub user info
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/json",
      },
    });

    const githubUser = (await userRes.json()) as any;

    // Check if user exists in our DB
    let user = await pool.query("SELECT * FROM users WHERE email = $1", [
      githubUser.email || `${githubUser.login}@github.com`,
    ]);

    if (user.rows.length === 0) {
      // Create new user
      const { v4: uuidv4 } = require("uuid");
      const apiKey = `dm_live_${uuidv4().replace(/-/g, "")}`;

      const result = await pool.query(
        `INSERT INTO users (name, email, password, api_key, github_token, github_username)
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [
          githubUser.name || githubUser.login,
          githubUser.email || `${githubUser.login}@github.com`,
          "github_oauth",
          apiKey,
          githubToken,
          githubUser.login,
        ],
      );
      user = result;
    } else {
      // Update existing user's GitHub token
      await pool.query(
        "UPDATE users SET github_token = $1, github_username = $2 WHERE id = $3",
        [githubToken, githubUser.login, user.rows[0].id],
      );
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.rows[0].id, email: user.rows[0].email },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    // Redirect to frontend with token
    res.redirect(`${FRONTEND_URL}?token=${token}&github=connected`);
  } catch (err: any) {
    console.error("GitHub OAuth error:", err);
    res.redirect(`${FRONTEND_URL}?error=oauth_failed`);
  }
});

// GET /api/github/repos — get user's repos
router.get("/repos", async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await pool.query(
      "SELECT github_token FROM users WHERE id = $1",
      [decoded.userId],
    );

    if (!user.rows[0]?.github_token) {
      return res.status(400).json({ error: "GitHub not connected" });
    }

    const reposRes = await fetch(
      "https://api.github.com/user/repos?sort=updated&per_page=20",
      {
        headers: {
          Authorization: `Bearer ${user.rows[0].github_token}`,
        },
      },
    );

    const repos = await reposRes.json();
    res.json(repos);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/github/connect-repo — user selects repo to monitor
router.post("/connect-repo", async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const { repo_name, repo_owner } = req.body;

    await pool.query(
      "UPDATE users SET connected_repo = $1, connected_repo_owner = $2 WHERE id = $3",
      [repo_name, repo_owner, decoded.userId],
    );

    res.json({
      success: true,
      message: `Connected to ${repo_owner}/${repo_name}`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
// POST /api/github/index-repo
router.post("/index-repo", async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await pool.query(
      "SELECT github_token, connected_repo, connected_repo_owner FROM users WHERE id = $1",
      [decoded.userId],
    );

    const { github_token, connected_repo, connected_repo_owner } = user.rows[0];

    if (!connected_repo) {
      return res.status(400).json({ error: "No repo connected" });
    }

    const agentRes = await fetch(`${process.env.AGENT_URL}/index-repo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        github_token,
        repo_owner: connected_repo_owner,
        repo_name: connected_repo,
        user_id: decoded.userId,
      }),
    });

    const result = await agentRes.json();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
