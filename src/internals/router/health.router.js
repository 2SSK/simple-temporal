import { Router } from "express";
import Config from "../config/config.js";
import { prisma } from "../db/prisma.js";
import { logError } from "../utils/logger.js";

const healthRouter = Router();

// Basic healthcheck (liveness probe)
healthRouter.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    env: Config.server.NODE_ENV,
  });
});

// Deep healthcheck (readiness probe)
healthRouter.get("/deep", async (req, res) => {
  const checks = {
    server: "ok",
    database: "fail",
  };

  try {
    // DB check
    await prisma.$connect();
    checks.database = "ok";

    res.status(200).json({
      status: "OK",
      checks,
    });
  } catch (error) {
    logError("Healthcheck failed", { error });
    res.status(503).json({
      status: "FAIL",
      checks,
      error: error.message,
    });
  }
});

export default healthRouter;
