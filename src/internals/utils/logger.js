import winston from "winston";

const NODE_ENV = process.env.NODE_ENV || "development";

const { combine, timestamp, printf, errors, colorize, json } = winston.format;

// Custom log format for development (human-readable)
const devLogFormat = printf(
  ({ level, message, timestamp, stack, traceId, service, ...meta }) => {
    // For error logs with stack traces
    if (stack) {
      const trace = traceId ? `[${traceId}]` : "";
      const svc = service ? `[${service}]` : "";
      return `${timestamp} [${level}]${svc}${trace}: ${message}\n${stack}`;
    }

    // HTTP access logs (from request logger middleware)
    if (meta.method && meta.path && meta.statusCode) {
      const method = meta.method.toUpperCase().padEnd(6);
      const status = meta.statusCode;
      const statusColor = status >= 500 ? "🔴" : status >= 400 ? "🟡" : "🟢";
      const path = meta.path;
      const trace = traceId || "no-trace";
      const duration = meta.durationMs ? `${meta.durationMs}ms` : "";

      let logLine = `${timestamp} ${statusColor} ${status} ${method} ${path} | ${duration} | trace: ${trace}`;

      // Add request body for non-GET requests (only in development)
      if (meta.requestBody && Object.keys(meta.requestBody).length > 0) {
        logLine += ` | body: ${JSON.stringify(meta.requestBody)}`;
      }

      // Add response body for errors
      if (meta.responseBody && status >= 400) {
        logLine += ` | error: ${JSON.stringify(meta.responseBody)}`;
      }

      // Add user info if available
      if (meta.userId) {
        logLine += ` | user: ${meta.userId}`;
      }

      return logLine;
    }

    // Application logs (from controllers/services)
    const trace = traceId ? `[${traceId}]` : "";
    const svc = service ? `[${service}]` : "";
    const metaStr = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : "";
    
    return `${timestamp} [${level}]${svc}${trace}: ${message}${metaStr}`;
  },
);

// Custom timestamp format (IST for development)
const customTimestamp = timestamp({
  format: () => {
    const d = new Date();
    const istOffset = 5.5 * 60; // IST is UTC +5:30
    const istTime = new Date(d.getTime() + istOffset * 60 * 1000);
    return istTime.toISOString().replace("T", " ").split(".")[0] + " IST";
  },
});

// Development format (colored, human-readable)
const devFormat = combine(
  colorize({ all: true }),
  customTimestamp,
  errors({ stack: true }),
  devLogFormat,
);

// Production format (structured JSON for log aggregation)
const prodFormat = combine(
  timestamp(), // ISO 8601 timestamp
  errors({ stack: true }),
  json(),
);

// Create logger instance
export const logger = winston.createLogger({
  level: NODE_ENV === "production" ? "info" : "debug",
  format: NODE_ENV === "production" ? prodFormat : devFormat,
  defaultMeta: { 
    service: "api-service",
    environment: NODE_ENV 
  },
  transports: [
    new winston.transports.Console(),
  ],
});

// Production: Add file transports for persistence
if (NODE_ENV === "production") {
  logger.add(new winston.transports.File({ 
    filename: "logs/error.log", 
    level: "error",
    maxsize: 10485760, // 10MB
    maxFiles: 5,
  }));
  
  logger.add(new winston.transports.File({ 
    filename: "logs/combined.log",
    maxsize: 10485760, // 10MB
    maxFiles: 5,
  }));
}

/**
 * Helper functions for structured logging
 * 
 * Best Practices:
 * - Use DEBUG for detailed debugging information
 * - Use INFO for important business logic events
 * - Use WARN for recoverable errors or degraded functionality
 * - Use ERROR for actual errors that need attention
 * 
 * Always include context (traceId, userId, etc.) in meta object
 */

export const logDebug = (message, meta = {}) => {
  logger.debug(message, meta);
};

export const logInfo = (message, meta = {}) => {
  logger.info(message, meta);
};

export const logWarn = (message, meta = {}) => {
  logger.warn(message, meta);
};

export const logError = (message, meta = {}) => {
  logger.error(message, meta);
};

/**
 * Structured logging helpers for specific scenarios
 */

// Business logic events (use sparingly, only for important events)
export const logBusinessEvent = (eventName, data = {}, traceId) => {
  logger.info(`Business Event: ${eventName}`, {
    event: eventName,
    traceId,
    ...data,
  });
};

// External API calls
export const logExternalCall = (service, method, endpoint, duration, status, traceId) => {
  const meta = {
    externalService: service,
    method,
    endpoint,
    durationMs: duration,
    statusCode: status,
    traceId,
  };

  if (status >= 400) {
    logger.warn(`External API Error: ${service} ${method} ${endpoint}`, meta);
  } else {
    logger.debug(`External API Call: ${service} ${method} ${endpoint}`, meta);
  }
};

// Database operations (use debug level)
export const logDbQuery = (operation, table, duration, traceId) => {
  logger.debug(`DB Query: ${operation} on ${table}`, {
    operation,
    table,
    durationMs: duration,
    traceId,
  });
};

// Security events (authentication, authorization)
export const logSecurityEvent = (event, userId, details, traceId) => {
  logger.warn(`Security Event: ${event}`, {
    securityEvent: event,
    userId,
    traceId,
    ...details,
  });
};
