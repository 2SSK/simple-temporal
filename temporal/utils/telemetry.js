import { Runtime, makeTelemetryFilterString } from "@temporalio/worker";

/**
 * Configuration defaults for Temporal telemetry
 */
const DEFAULTS = {
  PROMETHEUS_PORT: 9464,
  PROMETHEUS_BIND_ADDRESS: "0.0.0.0",
  LOG_LEVEL_CORE: "INFO",
  LOG_LEVEL_OTHER: "INFO",
};

/**
 * Initialize Temporal Runtime with Prometheus telemetry
 *
 * Environment variables:
 * - PROMETHEUS_PORT: Port to expose Prometheus metrics (default: 9464)
 * - PROMETHEUS_BIND_ADDRESS: Address to bind Prometheus endpoint (default: 0.0.0.0)
 * - TEMPORAL_LOG_LEVEL_CORE: Log level for Temporal core (default: INFO)
 * - TEMPORAL_LOG_LEVEL_OTHER: Log level for other components (default: INFO)
 */
export function initTelemetry() {
  const prometheusPort = parseInt(
    process.env.PROMETHEUS_PORT || String(DEFAULTS.PROMETHEUS_PORT),
    10,
  );

  const prometheusBindAddress =
    process.env.PROMETHEUS_BIND_ADDRESS || DEFAULTS.PROMETHEUS_BIND_ADDRESS;

  const logLevelCore =
    process.env.TEMPORAL_LOG_LEVEL_CORE || DEFAULTS.LOG_LEVEL_CORE;

  const logLevelOther =
    process.env.TEMPORAL_LOG_LEVEL_OTHER || DEFAULTS.LOG_LEVEL_OTHER;

  // Validate port
  if (isNaN(prometheusPort) || prometheusPort < 1 || prometheusPort > 65535) {
    console.warn(
      `Invalid PROMETHEUS_PORT. Using default: ${DEFAULTS.PROMETHEUS_PORT}`,
    );
  }

  const validPort =
    isNaN(prometheusPort) || prometheusPort < 1 || prometheusPort > 65535
      ? DEFAULTS.PROMETHEUS_PORT
      : prometheusPort;

  const telemetryConfig = {
    logging: {
      forward: {},
      filter: makeTelemetryFilterString({
        core: logLevelCore,
        other: logLevelOther,
      }),
    },
    metrics: {
      prometheus: {
        bindAddress: `${prometheusBindAddress}:${validPort}`,
      },
    },
  };

  Runtime.install({
    telemetryOptions: telemetryConfig,
  });

  console.log(`[Telemetry] Prometheus metrics enabled`);
  console.log(
    `  Endpoint: http://${prometheusBindAddress}:${validPort}/metrics`,
  );
  console.log(`  Log levels: core=${logLevelCore}, other=${logLevelOther}`);
}

// Export as default as well for flexibility
export default initTelemetry;
