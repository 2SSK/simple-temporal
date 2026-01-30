import { Runtime } from "@temporalio/worker";
import { makeTelemetryFilterString } from "@temporalio/worker";

const METRICS_PORT = process.env.WORKER_METRICS_PORT || 9464;

function initializeRuntime() {
  console.log(`[Runtime] Initializing with metrics on port ${METRICS_PORT}`);

  Runtime.install({
    telemetryOptions: {
      logging: {
        forward: {},
        filter: makeTelemetryFilterString({ core: "INFO", other: "INFO" }),
      },
      metrics: {
        prometheus: {
          bindAddress: `0.0.0.0:${METRICS_PORT}`,
        },
      },
    },
  });

  console.log(
    `[Runtime] Prometheus metrics enabled at http://0.0.0.0:${METRICS_PORT}/metrics`,
  );
}

function getMetricsConfig() {
  return {
    port: METRICS_PORT,
    bindAddress: `0.0.0.0:${METRICS_PORT}`,
    url: `http://localhost:${METRICS_PORT}/metrics`,
  };
}

export {
  initializeRuntime,
  getMetricsConfig,
  METRICS_PORT,
};
