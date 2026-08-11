import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./lib/prisma";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "github-knowledge-assistant-api",
  });
});

app.get("/api/health/db", async (_req, res) => {
  try {
    const repositoryCount = await prisma.repository.count();

    res.json({
      status: "ok",
      database: "connected",
      repositories: repositoryCount,
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(500).json({
      status: "error",
      database: "disconnected",
    });
  }
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});