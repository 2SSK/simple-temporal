import { logInfo, logError } from "../utils/logger.js";

export const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Capture the original json method to intercept response data
  const originalJson = res.json.bind(res);
  let responseBody = null;

  res.json = function (body) {
    responseBody = body;
    return originalJson(body);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      traceId: req.traceId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("user-agent") || "unknown",
    };

    // Include request body for POST/PUT/PATCH (but hide sensitive fields)
    if (["POST", "PUT", "PATCH"].includes(req.method) && req.body) {
      const sanitizedBody = { ...req.body };
      // Hide sensitive fields
      ["password", "token", "apiKey", "secret"].forEach((field) => {
        if (sanitizedBody[field]) sanitizedBody[field] = "***HIDDEN***";
      });
      logData.requestBody = sanitizedBody;
    }

    // Include response body for errors or if explicitly needed
    if (res.statusCode >= 400 && responseBody) {
      logData.responseBody = responseBody;
    }

    // Log based on status code
    if (res.statusCode >= 500) {
      logError(`${res.statusCode} ${req.method} ${req.originalUrl}`, logData);
    } else if (res.statusCode >= 400) {
      logError(`${res.statusCode} ${req.method} ${req.originalUrl}`, logData);
    } else {
      logInfo(`${res.statusCode} ${req.method} ${req.originalUrl}`, logData);
    }
  });

  next();
};
