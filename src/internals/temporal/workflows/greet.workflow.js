import { executeActivity } from "../utils/proxyActivity.js";

export async function greetWorkflow(args) {
  const { name, traceId } = args;
  return await executeActivity("greetActivity", [{ name, traceId }]);
}
