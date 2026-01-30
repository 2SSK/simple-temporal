import logger from "../../utils/logger.js";

async function farewell(name) {
  logger.info(`Saying farewell to ${name}`);
  return `Goodbye, ${name}!`;
}

export { farewell };