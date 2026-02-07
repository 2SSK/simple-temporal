import { Worker } from "@temporalio/worker";
import { fileURLToPath } from "url";
import path from "path";
import { activities } from "./activities/index.js";
import Config from "../config/config.js";
import { logDebug, logError, logInfo } from "../utils/logger.js";
import { initializeTelemetry } from "./utils/telemetry.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let worker;

async function runWorker() {
  try {
    // Initialize telemetry before creating the worker
    initializeTelemetry();

    const workflowsPath = path.join(__dirname, "./workflows");
    logDebug("DEBUG: Workflows path:", workflowsPath);
    logDebug(
      "DEBUG: Config.temporal:",
      JSON.stringify(Config.temporal, null, 2),
    );

    worker = await Worker.create({
      workflowsPath,
      activities,
      taskQueue: Config.temporal.taskQueue,
      maxConcurrentActivityTaskExecutions:
        Config.temporal.maxConcurrentActivityTaskExecutions || 10,
      maxConcurrentWorkflowTaskExecutions:
        Config.temporal.maxConcurrentWorkflowTaskExecutions || 10,
    });

    logInfo("Temporal worker started", {
      taskQueue: Config.temporal.taskQueue,
    });

    await worker.run();
  } catch (error) {
    logError("Temporal worker failed", { error });
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdownWorker(signal) {
  try {
    logInfo(`Received ${signal}, shutting down Temporal worker gracefully...`);

    if (worker) {
      await worker.shutdown();
    }

    process.exit(0);
  } catch (error) {
    logError("Error during Temporal worker shutdown", { error });
    process.exit(1);
  }
}

process.on("SIGINT", () => shutdownWorker("SIGINT"));
process.on("SIGTERM", () => shutdownWorker("SIGTERM"));

// Unhandled rejections
process.on("unhandledRejection", (err) => {
  logError("Unhandled Rejection in Temporal worker", { error: err });
});

// Uncaught exceptions
process.on("uncaughtException", (err) => {
  logError("Uncaught Exception in Temporal worker", { error: err });
  process.exit(1);
});

runWorker();
