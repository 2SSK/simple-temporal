import { createContextLogger } from "../../../utils/logger.js";

const logger = createContextLogger("farewellActivity");

async function farewell(name) {
  logger.info(`Saying farewell to ${name}`);
  return `Goodbye, ${name}!`;
}

export { farewell };