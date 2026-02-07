import { v4 as uuidv4 } from "uuid";

export const traceIdMiddleware = (req, res, next) => {
  // Generate a new traceId for each request
  req.traceId = uuidv4();

  // Add traceId to response hearders for client correlation
  res.setHeader("X-Trace-Id", req.traceId);

  next();
};
