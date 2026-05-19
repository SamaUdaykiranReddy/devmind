import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { pool } from "../db";

const JWT_SECRET = process.env.JWT_SECRET || "devmind-secret-key";

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // Check JWT token first
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      (req as any).userId = decoded.userId;
      return next();
    }

    // Check API key
    const apiKey = req.headers["x-api-key"] as string;
    if (apiKey) {
      const result = await pool.query(
        "SELECT id FROM users WHERE api_key = $1",
        [apiKey],
      );
      if (result.rows.length > 0) {
        (req as any).userId = result.rows[0].id;
        return next();
      }
    }

    res.status(401).json({ error: "Unauthorized" });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}
