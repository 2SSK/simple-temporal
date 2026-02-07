export const serviceTemplate = `
import { customTimestamp } from "../../utils/logger.js";

export const __MODULE_NAME__Service = async () => {
  return {
    message: "__MODULE_NAME__ service executed successfully",
    timestamp: customTimestamp(),
  };
}
`;
