import { Runtime, makeTelemetryFilterString } from "@temporalio/worker";
import { prometheus, logging } from "../../utils/config.js";
import { temporalLogger } from "../../utils/logger.js";

/**
 * Initialize Temporal Runtime with Prometheus telemetry
 *
 * Configuration is loaded from @utils/config.js which reads:
 * - PROMETHEUS_PORT: Port to expose Prometheus metrics (default: 9464)
 * - PROMETHEUS_BIND_ADDRESS: Address to bind Prometheus endpoint (default: 0.0.0.0)
 * - TEMPORAL_LOG_LEVEL_CORE: Log level for Temporal core (default: INFO)
 * - TEMPORAL_LOG_LEVEL_OTHER: Log level for other components (default: INFO)
 */
export function initTelemetry() {
  const telemetryLogger = temporalLogger("telemetry");
  const prometheusPort = prometheus.port;
  const prometheusBindAddress = prometheus.bindAddress;
  const logLevelCore = logging.coreLevel;
  const logLevelOther = logging.otherLevel;

  // Validate port
  if (isNaN(prometheusPort) || prometheusPort < 1 || prometheusPort > 65535) {
    telemetryLogger.warn(`Invalid PROMETHEUS_PORT. Using default: 9464`);
  }

  const validPort =
    isNaN(prometheusPort) || prometheusPort < 1 || prometheusPort > 65535
      ? 9464
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

  telemetryLogger.info("Prometheus metrics enabled", {
    endpoint: `http://${prometheusBindAddress}:${validPort}/metrics`,
    logLevels: { core: logLevelCore, other: logLevelOther },
  });
}

// Export as default as well for flexibility
export default initTelemetry;