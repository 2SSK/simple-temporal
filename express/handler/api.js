import { createContextLogger } from "../../utils/logger.js";

const logger = createContextLogger("apiHandler");

export async function apiHandler(req, res) {
  try {
    logger.info("API information requested");

    res.json({
      name: "Express + Temporal API",
      version: "1.0.0",
      status: "running",
      endpoints: {
        health: "GET /health",
        api: "GET /api",
        orders: {
          create: "POST /api/orders",
          get: "GET /api/orders/:id",
          list: "GET /api/orders",
          cancel: "POST /api/orders/:id/cancel",
        },
        users: {
          register: "POST /api/users/register",
          get: "GET /api/users/:id",
          list: "GET /api/users",
          suspend: "POST /api/users/:id/suspend",
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Failed to get API info", { error: error.message });
    res.status(500).json({
      success: false,
      error: "Failed to get API information",
      message: error.message,
    });
  }
}

