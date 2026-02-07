import { Connection, Client } from "@temporalio/client";
import Config from "../config/config.js";
import { logError, logInfo } from "../utils/logger.js";

let client;

export async function getTemporalClient() {
  if (client) return client;

  try {
    const connection = await Connection.connect({
      address: Config.temporal.ADDRESS,
    });

    client = new Client({
      connection,
      namespace: Config.temporal.namespace,
    });

    logInfo("Temporal client connected successfully", {
      address: Config.temporal.ADDRESS,
      namespace: Config.temporal.namespace,
    });

    return client;
  } catch (error) {
    logError("Temporal client connection failed", {
      error: error.message,
      address: Config.temporal.ADDRESS,
    });

    throw error;
  }
}
