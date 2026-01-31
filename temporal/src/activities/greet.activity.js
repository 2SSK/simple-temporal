import { createContextLogger } from "../../../utils/logger.js";

const logger = createContextLogger("greetActivity");

async function greet(name) {
  logger.info(`Greeting ${name}`);
  return `Hello, ${name}!`;
}

export { greet };
