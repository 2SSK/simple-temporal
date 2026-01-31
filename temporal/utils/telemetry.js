import { Runtime, makeTelemetryFilterString } from "@temporalio/worker";
import { prometheus, logging } from "./config.js";

export function initTelemetry() {
  const prometheusPort = prometheus.port;
  const prometheusBindAddress = prometheus.bindAddress;
  const logLevelCore = logging.coreLevel;
  const logLevelOther = logging.otherLevel;

  // Validate port
  if (isNaN(prometheusPort) || prometheusPort < 1 || prometheusPort > 65535) {
    console.warn(`Invalid PROMETHEUS_PORT. Using default: 9464`);
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

  console.log(`[Telemetry] Prometheus metrics enabled`);
  console.log(
    `  Endpoint: http://${prometheusBindAddress}:${validPort}/metrics`,
  );
  console.log(`  Log levels: core=${logLevelCore}, other=${logLevelOther}`);
}

// Export as default as well for flexibility
export default initTelemetry;
