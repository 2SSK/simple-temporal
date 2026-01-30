import logger from "../../utils/logger.js";

async function greet(name) {
  logger.info(`Greeting ${name}`);
  return `Hello, ${name}!`;
}

export { greet };
