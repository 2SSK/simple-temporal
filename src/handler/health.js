import { createContextLogger } from "../../utils/logger.js";

const logger = createContextLogger("healthHandler");

export async function healthHandler(req, res) {
  try {
    logger.info("Health check requested");

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: "Express + Temporal API",
    });
  } catch (error) {
    logger.error("Health check failed", { error: error.message });
    res.status(500).json({
      status: "unhealthy",
      error: error.message,
    });
  }
}

