import "dotenv/config";
import { z } from "zod";
import { logError } from "../utils/logger.js";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["production", "development", "test"])
    .default("development"),
  PORT: z.string().default("3000"),

  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.string().default("5432"),
  DB_NAME: z.string().default("database"),
  DB_USER: z.string().default("user"),
  DB_PASSWORD: z.string().default("password"),
  DB_SCHEMA: z.string().default("public"),

  DB_CONNECTION_TIMEOUT: z.string().default("5000"),
  DB_IDLE_TIMEOUT: z.string().default("10000"),
  DB_MAX_POOL: z.string().default("10"),
  DB_SSL: z.string().default("false"),

  TEMPORAL_HOST: z.string().default("localhost"),
  TEMPORAL_PORT: z.string().default("7233"),
  TEMPORAL_NAMESPACE: z.string().default("default"),
  TEMPORAL_TASK_QUEUE: z.string().default("default-queue"),
  TEMPORAL_ACTIVITY_TIMEOUT: z.string().default("10"), // in seconds
  TEMPORAL_WORKFLOW_TIMEOUT: z.string().default("30"), // in seconds

  // OTEL Configuration
  OTEL_ENABLED: z.string().default("true"),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().default("localhost:4317"),
  OTEL_EXPORTER_OTLP_PROTOCOL: z.enum(["grpc", "http"]).default("grpc"),
  OTEL_EXPORTER_OTLP_HEADERS: z.string().optional(),
  OTEL_METRICS_EXPORT_INTERVAL_MS: z.string().default("5000"),
  OTEL_METRICS_TEMPORALITY: z.enum(["cumulative", "delta"]).default("cumulative"),
  OTEL_SERVICE_NAME: z.string().default("temporal-worker"),
  OTEL_SERVICE_VERSION: z.string().default("1.0.0"),
  OTEL_LOG_LEVEL_CORE: z.enum(["DEBUG", "INFO", "WARN", "ERROR"]).default("INFO"),
  OTEL_LOG_LEVEL_OTHER: z.enum(["DEBUG", "INFO", "WARN", "ERROR"]).default("INFO"),
  OTEL_METRICS_PORT: z.string().default("9464"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  logError("Invalid environment variables:");
  logError(parsed.error.flatten());
  process.exit(1);
}

export const env = parsed.data;
