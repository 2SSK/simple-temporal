import { greetRepository } from "./greet.repository.js";
import { logDbQuery, logError, logInfo } from "../../utils/logger.js";
import { getTemporalClient } from "../../temporal/client.js";
import Config from "../../config/config.js";

export const greetService = async (name = "Guest", traceId) => {
  const client = await getTemporalClient();

  logInfo("Starting greet workflow", { traceId, name });

  const handle = await client.workflow.start("greetWorkflow", {
    taskQueue: Config.temporal.taskQueue,
    workflowId: `greet-workflow-${traceId}-${Date.now()}`,
    args: [{ name, traceId }],
  });

  const result = await handle.result();

  logInfo("Greet workflow completed", { traceId, result });

  return result;
};

greetService.getAllGreetings = async (traceId) => {
  try {
    const start = Date.now();

    const results = await greetRepository.findAll();

    const duration = Date.now() - start;

    // Log database operations at DEBUG level
    logDbQuery("SELECT", "greeting", duration, traceId);

    return results;
  } catch (error) {
    // Log actual errors
    logError("Failed to fetch greetings", {
      traceId,
      error: error.message,
      service: "greet-service",
    });
    throw error;
  }
};
