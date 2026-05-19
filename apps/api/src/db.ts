import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(__dirname, "../.env") });

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function initDB() {
  // Users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      api_key VARCHAR(255) UNIQUE NOT NULL,
      github_token TEXT,
      github_username VARCHAR(255),
      connected_repo VARCHAR(255),
      connected_repo_owner VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Analyses table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS analyses (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      service VARCHAR(255),
      route VARCHAR(255),
      error_text TEXT,
      stack_trace TEXT,
      error_file VARCHAR(500),
      error_line INTEGER,
      error_column INTEGER,
      anomaly_type VARCHAR(100),
      severity VARCHAR(50),
      root_cause TEXT,
      fix TEXT,
      tests TEXT,
      bdd_tests TEXT,
      explanation TEXT,
      status VARCHAR(50) DEFAULT 'open',
      github_pr_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Add new columns if they don't exist
  await pool
    .query(
      `
    ALTER TABLE analyses
    ADD COLUMN IF NOT EXISTS user_id INTEGER,
    ADD COLUMN IF NOT EXISTS stack_trace TEXT,
    ADD COLUMN IF NOT EXISTS error_file VARCHAR(500),
    ADD COLUMN IF NOT EXISTS error_line INTEGER,
    ADD COLUMN IF NOT EXISTS error_column INTEGER,
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'open',
    ADD COLUMN IF NOT EXISTS explanation TEXT,
    ADD COLUMN IF NOT EXISTS github_pr_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS bdd_tests TEXT
  `,
    )
    .catch(() => {});

  // Add GitHub columns to users
  await pool
    .query(
      `
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS github_token TEXT,
    ADD COLUMN IF NOT EXISTS github_username VARCHAR(255),
    ADD COLUMN IF NOT EXISTS connected_repo VARCHAR(255),
    ADD COLUMN IF NOT EXISTS connected_repo_owner VARCHAR(255)
  `,
    )
    .catch(() => {});

  console.log("✅ Database initialized");
}
