import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(__dirname, "../.env") });

import express from "express";
import cors from "cors";
import { initDB } from "./db";
import analyzeRouter from "./routes/analyze";
import errorsRouter from "./routes/errors";
import authRouter from "./routes/auth";
import githubRouter from "./routes/github";

const app = express();
const PORT = process.env.PORT || 3001;
// Debug — list all routes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
app.use(cors());
app.use(express.json());

// Routes
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "devmind-api" });
});

app.use("/api/auth", authRouter);
app.use("/api/analyze", analyzeRouter);
app.use("/api/errors", errorsRouter);
app.use("/api/github", githubRouter);

async function start() {
  await initDB();
  app.listen(PORT, () => {
    console.log(`✅ DevMind API running on port ${PORT}`);
  });
}

start();
