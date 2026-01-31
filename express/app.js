import express from "express";
import { temporal, server } from "../utils/config.js";
import logger from "../utils/logger.js";
import apiRouter from "./router.js";

async function createApp(temporalClient) {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint (standalone for simple health checks)
  app.get("/health", (req, res) => {
    logger.info("Health check requested");
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      server: {
        port: server.port,
        host: server.host,
        env: server.env,
      },
      temporal: {
        address: temporal.address,
        namespace: temporal.namespace,
        taskQueue: temporal.taskQueue,
      },
    });
  });

  // Mount API router for all other endpoints
  app.use("/api", apiRouter);

  // Error handling middleware
  app.use((err, req, res, next) => {
    logger.error("Express error handler", {
      error: err.message,
      stack: err.stack,
      method: req.method,
      url: req.url,
    });

    res.status(500).json({
      success: false,
      error: {
        type: "internal_server_error",
        message: "Internal server error",
        ...(server.env === "development" && {
          message: err.message,
          stack: err.stack,
        }),
      },
      timestamp: new Date().toISOString(),
    });
  });

  // 404 handler
  app.use((req, res) => {
    logger.warn("Route not found", {
      method: req.method,
      url: req.url,
    });

    res.status(404).json({
      success: false,
      error: {
        type: "not_found",
        message: `Route ${req.method} ${req.path} not found`,
        availableRoutes: ["/health", "/api", "/api/orders", "/api/users"],
      },
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}

export default createApp;
