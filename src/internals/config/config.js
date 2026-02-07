import { env } from "./env.js";

export const ServerConfig = {
  NODE_ENV: env.NODE_ENV,
  PORT: Number(env.PORT),
};

export const DatabaseConfig = {
  host: env.DB_HOST,
  port: Number(env.DB_PORT),
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  schema: env.DB_SCHEMA,
  connectionTimeout: Number(env.DB_CONNECTION_TIMEOUT),
  idleTimeout: Number(env.DB_IDLE_TIMEOUT),
  maxPool: Number(env.DB_MAX_POOL),
  ssl: env.DB_SSL === "true",

  // HELPER: build full DATABASE_URL for Prisma or other clients
  get DATABASE_URL() {
    const sslParam = this.ssl ? "?sslmode=require" : "";
    return `postgresql://${this.user}:${this.password}@${this.host}:${this.port}/${this.database}${sslParam}`;
  },
};

export const TemporalConfig = {
  host: env.TEMPORAL_HOST,
  port: Number(env.TEMPORAL_PORT),
  namespace: env.TEMPORAL_NAMESPACE,
  taskQueue: env.TEMPORAL_TASK_QUEUE,
  activityTimeout: Number(env.TEMPORAL_ACTIVITY_TIMEOUT), // in seconds
  workflowTimeout: Number(env.TEMPORAL_WORKFLOW_TIMEOUT), // in seconds

  // HELPER: build full Temporal address
  get ADDRESS() {
    return `${this.host}:${this.port}`;
  },
};

export const OtelConfig = {
  enabled: env.OTEL_ENABLED === "true",
  endpoint: env.OTEL_EXPORTER_OTLP_ENDPOINT,
  protocol: env.OTEL_EXPORTER_OTLP_PROTOCOL,
  headers: env.OTEL_EXPORTER_OTLP_HEADERS,
  metricsExportIntervalMs: Number(env.OTEL_METRICS_EXPORT_INTERVAL_MS),
  metricsTemporality: env.OTEL_METRICS_TEMPORALITY,
  serviceName: env.OTEL_SERVICE_NAME,
  serviceVersion: env.OTEL_SERVICE_VERSION,
  logLevelCore: env.OTEL_LOG_LEVEL_CORE,
  logLevelOther: env.OTEL_LOG_LEVEL_OTHER,
  metricsPort: Number(env.OTEL_METRICS_PORT),

  // HELPER: build full OTLP URL with protocol
  get OTLP_URL() {
    return `${this.protocol}://${this.endpoint}`;
  },

  // HELPER: parse headers from JSON string
  get PARSED_HEADERS() {
    if (!this.headers) return {};
    try {
      return JSON.parse(this.headers);
    } catch {
      return {};
    }
  },
};

const Config = {
  server: ServerConfig,
  database: DatabaseConfig,
  temporal: TemporalConfig,
  otel: OtelConfig,
};

export default Config;
