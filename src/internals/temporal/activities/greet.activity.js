import { logInfo, logError, logDbQuery } from "../../utils/logger.js";
import { greetRepository } from "../../modules/greet/greet.repository.js";

export async function greetActivity({ name, traceId }) {
  logInfo("Greet activity started", { traceId, name });
  const message = `Hello, ${name}! Welcome to our service.`;

  try {
    const start = Date.now();

    const greeting = await greetRepository.createGreeting({ name, message });
    const duration = Date.now() - start;

    logDbQuery("INSERT", "greeting", duration, traceId);

    logInfo("Greet activity completed", {
      traceId,
      name,
      greetingId: greeting.id,
    });

    return greeting;
  } catch (error) {
    logError("Failed to create greeting", {
      traceId,
      name,
      error: error.message,
      service: "greet-service",
    });
    throw error;
  }
}
