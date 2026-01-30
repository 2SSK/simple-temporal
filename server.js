import { config } from "dotenv";
import createApp from "./express/app";
import temporalClient, { connect, disconnect } from "./temporal/client";

config();

async function startServer() {
  try {
    // Connect to Temporal
    console.log("[Server] Starting...");
    await connect();
    console.log("[Server] Temporal connection established");

    // Create Express app
    const app = createApp(temporalClient);

    // Start server
    const port = process.env.PORT || 3000;
    const host = process.env.HOST || "localhost";

    const server = app.listen(port, host, () => {
      console.log(`[Server] Running at http://${host}:${port}`);
      console.log("[Server] Available endpoints:");
      console.log("  - GET  /health");
      console.log("  - GET  /api");
      console.log("  - POST /api/greet");
      console.log("  - GET  /api/greet/:id");
      console.log("  - GET  /api/greet");
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);

      server.close(async () => {
        console.log("[Server] HTTP server closed");

        await disconnect();
        console.log("[Server] Temporal client disconnected");

        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error("[Server] Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("[Server] Failed to start:", error);
    process.exit(1);
  }
}

startServer();
