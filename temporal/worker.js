import { Worker } from "@temporalio/worker";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import * as activities from "./src/activities/index.js";
import { temporal } from "../utils/config.js";
import { temporalLogger } from "../utils/logger.js";
import initTelemetry from "./utils/telemetry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function run() {
  // Initialize telemetry first
  initTelemetry();

  const worker = await Worker.create({
    workflowsPath: join(__dirname, "src/workflows"),
    activities,
    taskQueue: temporal.taskQueue,
    namespace: temporal.namespace,
    bundlerOptions: {
      ignoreModules: ["crypto", "buffer", "string_decoder", "zlib", "fs", "path", "os", "http", "https", "events"],
    },
  });

  temporalLogger("worker").info("Temporal worker started");
  await worker.run();
}

run().catch((err) => {
  temporalLogger("worker").error("Worker failed:", err);
  process.exit(1);
});
