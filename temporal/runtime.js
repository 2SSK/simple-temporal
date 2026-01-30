const { Runtime } = require('@temporalio/worker');
const { makeTelemetryFilterString } = require('@temporalio/worker');

// Temporal SDK Prometheus metrics port
const METRICS_PORT = process.env.WORKER_METRICS_PORT || 9464;

/**
 * Initialize Temporal Runtime with Prometheus metrics
 * Call this at the start of your worker script
 */
function initializeRuntime() {
  console.log(`[Runtime] Initializing with metrics on port ${METRICS_PORT}`);
  
  Runtime.install({
    telemetryOptions: {
      logging: {
        forward: {},
        filter: makeTelemetryFilterString({ core: 'INFO', other: 'INFO' }),
      },
      metrics: {
        prometheus: {
          bindAddress: `0.0.0.0:${METRICS_PORT}`,
        },
      },
    },
  });
  
  console.log(`[Runtime] Prometheus metrics enabled at http://0.0.0.0:${METRICS_PORT}/metrics`);
}

/**
 * Get metrics port configuration
 * @returns {Object} Metrics configuration
 */
function getMetricsConfig() {
  return {
    port: METRICS_PORT,
    bindAddress: `0.0.0.0:${METRICS_PORT}`,
    url: `http://localhost:${METRICS_PORT}/metrics`
  };
}

module.exports = {
  initializeRuntime,
  getMetricsConfig,
  METRICS_PORT
};
