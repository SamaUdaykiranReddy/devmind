import { Router, Request, Response } from "express";
import { pool } from "../db";
import jwt from "jsonwebtoken";

const router = Router();

async function getUserIdFromRequest(req: Request): Promise<number | null> {
  const token = req.headers.authorization?.split(" ")[1];
  const apiKey = req.headers["x-api-key"] as string;

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "devmind-secret-key",
      ) as any;
      return decoded.userId;
    } catch {}
  }

  if (apiKey) {
    const result = await pool.query("SELECT id FROM users WHERE api_key = $1", [
      apiKey,
    ]);
    if (result.rows.length > 0) return result.rows[0].id;
  }

  return null;
}

// GET /api/errors
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);

    const result = userId
      ? await pool.query(
          "SELECT * FROM analyses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
          [userId],
        )
      : await pool.query(
          "SELECT * FROM analyses WHERE user_id IS NULL ORDER BY created_at DESC LIMIT 50",
        );

    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/errors/search
router.get("/search", async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const userId = await getUserIdFromRequest(req);

    const result = userId
      ? await pool.query(
          `SELECT * FROM analyses 
           WHERE user_id = $1 AND (
             error_text ILIKE $2 OR root_cause ILIKE $2 OR
             service ILIKE $2 OR route ILIKE $2 OR anomaly_type ILIKE $2
           ) ORDER BY created_at DESC LIMIT 20`,
          [userId, `%${q.toString()}%`],
        )
      : await pool.query(
          `SELECT * FROM analyses 
           WHERE error_text ILIKE $1 OR root_cause ILIKE $1
           OR service ILIKE $1 OR route ILIKE $1
           ORDER BY created_at DESC LIMIT 20`,
          [`%${q.toString()}%`],
        );

    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/errors/stats
router.get("/stats", async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);

    let totalResult,
      severityResult,
      serviceResult,
      recentResult,
      topErrorsResult;

    if (userId) {
      [
        totalResult,
        severityResult,
        serviceResult,
        recentResult,
        topErrorsResult,
      ] = await Promise.all([
        pool.query(
          "SELECT COUNT(*) as total FROM analyses WHERE user_id = $1",
          [userId],
        ),
        pool.query(
          "SELECT severity, COUNT(*) as count FROM analyses WHERE user_id = $1 GROUP BY severity",
          [userId],
        ),
        pool.query(
          "SELECT service, COUNT(*) as count FROM analyses WHERE user_id = $1 GROUP BY service ORDER BY count DESC",
          [userId],
        ),
        pool.query(
          "SELECT COUNT(*) as count FROM analyses WHERE user_id = $1 AND created_at > NOW() - INTERVAL '24 hours'",
          [userId],
        ),
        pool.query(
          "SELECT error_text, occurrence_count, service, route, severity FROM analyses WHERE user_id = $1 ORDER BY occurrence_count DESC LIMIT 5",
          [userId],
        ),
      ]);
    } else {
      [
        totalResult,
        severityResult,
        serviceResult,
        recentResult,
        topErrorsResult,
      ] = await Promise.all([
        pool.query(
          "SELECT COUNT(*) as total FROM analyses WHERE user_id IS NULL",
        ),
        pool.query(
          "SELECT severity, COUNT(*) as count FROM analyses WHERE user_id IS NULL GROUP BY severity",
        ),
        pool.query(
          "SELECT service, COUNT(*) as count FROM analyses WHERE user_id IS NULL GROUP BY service ORDER BY count DESC",
        ),
        pool.query(
          "SELECT COUNT(*) as count FROM analyses WHERE user_id IS NULL AND created_at > NOW() - INTERVAL '24 hours'",
        ),
        pool.query(
          "SELECT error_text, occurrence_count, service, route, severity FROM analyses WHERE user_id IS NULL ORDER BY occurrence_count DESC LIMIT 5",
        ),
      ]);
    }

    res.json({
      total: parseInt(totalResult.rows[0].total),
      last_24_hours: parseInt(recentResult.rows[0].count),
      by_severity: severityResult.rows,
      by_service: serviceResult.rows,
      top_recurring: topErrorsResult.rows,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/errors/predict
router.post("/predict", async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);

    const recentErrors = userId
      ? await pool.query(
          `SELECT error_text, service, route, severity, occurrence_count
           FROM analyses WHERE user_id = $1
           AND created_at > NOW() - INTERVAL '24 hours'
           ORDER BY occurrence_count DESC LIMIT 10`,
          [userId],
        )
      : await pool.query(
          `SELECT error_text, service, route, severity, occurrence_count
           FROM analyses WHERE user_id IS NULL
           AND created_at > NOW() - INTERVAL '24 hours'
           ORDER BY occurrence_count DESC LIMIT 10`,
        );

    if (recentErrors.rows.length === 0) {
      return res.json({ has_pattern: false, message: "Not enough data" });
    }

    const agentRes = await fetch(`${process.env.AGENT_URL}/detect-patterns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ errors: recentErrors.rows }),
    });

    const prediction = await agentRes.json();
    res.json(prediction);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/errors/:id — MUST BE LAST!
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM analyses WHERE id = $1", [
      req.params.id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
