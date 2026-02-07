import { greetService } from "./greet.service.js";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware.js";
import { logDebug } from "../../utils/logger.js";

export const greetController = asyncHandler(async (req, res) => {
  const name = req.body.name || "Guest";
  const traceId = req.traceId;

  logDebug("Greet controller invoked", {
    traceId,
    name,
    service: "greet-service",
  });

  const result = await greetService(name, traceId);

  res.success(result, `Greeted ${name} successfully`);
});

export const greetGetAllController = asyncHandler(async (req, res) => {
  const traceId = req.traceId;

  logDebug("Greet get all controller invoked", {
    traceId,
    service: "greet-service",
  });

  const result = await greetService.getAllGreetings(traceId);

  res.success(result, `Fetched all greetings successfully`);
});
