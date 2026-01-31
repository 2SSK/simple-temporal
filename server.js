import createApp from "./express/app.js";
import { server } from "./utils/config.js";
import { createContextLogger } from "./utils/logger.js";
import temporalClient from "./temporal/client.js";

const logger = createContextLogger("server");

async function startServer() {
  try {
    logger.info("Starting server...");

    // Create Express app (async)
    const app = await createApp(temporalClient);

    // Start server
    const httpServer = app.listen(server.port, server.host, () => {
      logger.info(`Server running at http://${server.host}:${server.port}`);
      logger.info("Available endpoints:");
      logger.info("  - GET  /health");
      logger.info("  - GET  /api");
      logger.info("  - POST /api/orders");
      logger.info("  - GET  /api/orders/:id");
      logger.info("  - GET  /api/orders");
      logger.info("  - POST /api/users/register");
      logger.info("  - GET  /api/users/:id");
      logger.info("  - GET  /api/users");
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);

      httpServer.close(async () => {
        logger.info("HTTP server closed");
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    logger.error("Failed to start server", { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

startServer();
