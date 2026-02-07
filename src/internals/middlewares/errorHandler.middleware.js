import { AppError, ValidationError } from "../errors/index.js";
import { logError } from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Zod error handling
  if (err.name === "ZodError") {
    const errors = err.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    error = new ValidationError(errors);
  }

  // Unknown error -> convert to AppError
  if (!(error instanceof AppError)) {
    error = new AppError("Internal Server Error", 500);
  }

  // Log detailed error information (stack trace for 500 errors only)
  if (error.statusCode >= 500) {
    logError(`Internal Error: ${error.message}`, {
      traceId: req.traceId || null,
      statusCode: error.statusCode,
      path: req.originalUrl || "/",
      method: req.method || "GET",
      stack: error.stack,
    });
  }

  // Note: Request logger will also log this, but without stack trace
  // This is intentional - we want detailed error info here, general HTTP log there

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors || undefined,
    traceId: req.traceId || undefined,
  });
};
