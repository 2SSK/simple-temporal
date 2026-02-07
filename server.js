import app from "./src/index.js";
import Config from "./src/internals/config/config.js";
import { logInfo } from "./src/internals/utils/logger.js";

function startServer() {
  try {
    const port = Config.server.PORT;

    // Start HTTP server
    const httpServer = app.listen(port, () => {
      logInfo("Server is running");
      logInfo(`ENV: ${Config.server.NODE_ENV}`);
      logInfo(`Listening on port ${port}`);
    });

    const gracefulshutdown = (signal) => {
      logInfo(`Recieved ${signal}. Shutting down gracefully...`);

      httpServer.close(async () => {
        logInfo("HTTP server closed.");

        // When server has stopped accepting connections
        // exit the process with exit status 0
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logError("Force shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulshutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulshutdown("SIGINT"));
  } catch (error) {
    logError("Failed to start server");
    logError("error: ", error.message);
    logError("stack: ", error.stack);
    process.exit(1);
  }
}

startServer();
