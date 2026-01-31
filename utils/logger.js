import { createLogger, format, transports } from "winston";
import { logging } from "./config.js";

// Create custom format for console output
const consoleFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.errors({ stack: true }),
  format.colorize(),
  format.printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    // Add stack trace if available
    if (stack) {
      log += `\n${stack}`;
    }
    
    // Add metadata if available
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    return log;
  })
);

// JSON format for file logs (if needed in future)
const jsonFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.json()
);

const logger = createLogger({
  level: logging.level.toLowerCase(),
  defaultMeta: { service: "simple-temporal" },
  transports: [
    new transports.Console({
      format: consoleFormat,
    }),
  ],
});

// Add file transport in production
if (process.env.NODE_ENV === "production") {
  logger.add(
    new transports.File({
      filename: "logs/error.log",
      level: "error",
      format: jsonFormat,
    })
  );
  
  logger.add(
    new transports.File({
      filename: "logs/combined.log",
      format: jsonFormat,
    })
  );
}

// Create child loggers with context
export const createContextLogger = (context) => {
  return logger.child({ context });
};

// Express middleware logger
export const expressLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  logger.info("HTTP Request", {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    
    logger.info("HTTP Response", {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
    
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Workflow logger
export const workflowLogger = (workflowId, action) => {
  return logger.child({ 
    context: "workflow", 
    workflowId, 
    action 
  });
};

// Temporal logger
export const temporalLogger = (component) => {
  return logger.child({ 
    context: "temporal", 
    component 
  });
};

export default logger;