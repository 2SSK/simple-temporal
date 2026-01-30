import { createLogger, format, transports } from "winston";

const logger = createLogger({
  level: process.env.LOGLEVEL || "info",
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.Console({
      format: format.simple(),
    }),
  ],
});

export default logger;
