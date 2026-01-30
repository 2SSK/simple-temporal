import { NativeConnection, Worker } from "@temporalio/worker";
import path from "path";
import {
  activities,
  getWorkflowNames,
  getActivityNames,
} from "./src/index.js";
import { initializeRuntime, getMetricsConfig } from "./runtime.js";
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  try {
    initializeRuntime();
    const metricsConfig = getMetricsConfig();
    console.log(`[Worker] Metrics available at: ${metricsConfig.url}`);

    const address = process.env.TEMPORAL_ADDRESS || "localhost:7233";
    console.log(`[Worker] Connecting to Temporal at ${address}...`);

    const connection = await NativeConnection.connect({
      address: address,
    });

    const namespace = process.env.TEMPORAL_NAMESPACE || "default";
    const defaultTaskQueue = process.env.DEFAULT_TASK_QUEUE || "default_queue";
    const orderTaskQueue = process.env.ORDER_QUEUE || "order_queue";
    const userTaskQueue = process.env.USER_QUEUE || "user_queue";

    const taskQueues = [defaultTaskQueue, orderTaskQueue, userTaskQueue];

    const workflowsPath = path.join(__dirname, "src", "workflows");

    console.log("[Worker] Available workflows:", getWorkflowNames());
    console.log("[Worker] Available activities:", getActivityNames());
    console.log(`[Worker] Task Queues: ${taskQueues.join(", ")}`);
    console.log(`[Worker] Namespace: ${namespace}`);

    const worker = await Worker.create({
      connection,
      namespace: namespace,
      taskQueue: defaultTaskQueue,
      workflowsPath: workflowsPath,
      activities: activities,
      bundlerOptions: {
        ignoreModules: ['crypto'],
      },
    });

    console.log("[Worker] Started successfully");
    console.log("[Worker] Waiting for tasks...");

    await worker.run();
  } catch (error) {
    console.error("[Worker] Failed to start:", error);
    process.exit(1);
  }
}

run().catch((error) => {
  console.error("[Worker] Unhandled error:", error);
  process.exit(1);
});
