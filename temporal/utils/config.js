import dotenv from "dotenv";
dotenv.config();

export const temporal = {
  address: process.env.TEMPORAL_ADDRESS || "localhost:7233",
  namespace: process.env.TEMPORAL_NAMESPACE || "default",
  taskQueue: process.env.TASK_QUEUE || "default",
};

export const prometheus = {
  port: parseInt(process.env.PROMETHEUS_PORT || "9464", 10),
  bindAddress: process.env.PROMETHEUS_BIND_ADDRESS || "0.0.0.0",
};

export const logging = {
  level: process.env.LOG_LEVEL || "info",
  coreLevel: process.env.TEMPORAL_LOG_LEVEL_CORE || "INFO",
  otherLevel: process.env.TEMPORAL_LOG_LEVEL_OTHER || "INFO",
};
