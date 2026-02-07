export const controllerTemplate = `
import {__MODULE_NAME__Service} from "./__MODULE_NAME__.service.js";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware.js";
import { logInfo, logError } from "../../utils/logger.js";

export const __MODULE_NAME__Controller = asyncHandler(async (req, res) => {
  const traceId = req.traceId;

  logInfo("__MODULE_NAME__ request started", { traceId, path: req.path });
  
  try{
    const result = await __MODULE_NAME__Service();
    logInfo("__MODULE_NAME__ service executed successfully", { traceId, result });

    res.success(result, "__MODULE_NAME__ executed successfully");
  } catch (err) {
    logError("__MODULE_NAME__ service failed", { traceId, stack: err.stack });
    res.error(err);
  }
});
`;
