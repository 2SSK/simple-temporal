import { Runtime, makeTelemetryFilterString } from "@temporalio/worker";
import Config from "../../config/config.js";
import { logInfo, logError, logWarn, logDebug } from "../../utils/logger.js";

class TelemetryManager {
  constructor() {
    this.isInitialized = false;
    this.config = Config.otel;
  }

  /**
   * Validate OTEL configuration
   * @returns {Object} Validation result with status and errors
   */
  validateConfig() {
    const errors = [];

    if (!this.config.enabled) {
      return { valid: true, disabled: true };
    }

    if (!this.config.endpoint) {
      errors.push(
        "OTEL_EXPORTER_OTLP_ENDPOINT is required when OTEL is enabled",
      );
    }

    if (this.config.metricsExportIntervalMs < 100) {
      errors.push("OTEL_METRICS_EXPORT_INTERVAL_MS must be at least 100ms");
    }

    if (this.config.metricsExportIntervalMs > 60000) {
      logWarn("OTEL metrics export interval is very high (>60s)", {
        intervalMs: this.config.metricsExportIntervalMs,
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      disabled: false,
    };
  }

  /**
   * Parse and validate OTLP headers
   * @returns {Object} Parsed headers or empty object
   */
  parseHeaders() {
    if (!this.config.headers) {
      return {};
    }

    try {
      const parsed = JSON.parse(this.config.headers);

      if (typeof parsed !== "object" || parsed === null) {
        logWarn("OTEL_EXPORTER_OTLP_HEADERS must be a valid JSON object");
        return {};
      }

      logDebug("OTLP headers parsed successfully", {
        headerCount: Object.keys(parsed).length,
      });

      return parsed;
    } catch (error) {
      logError("Failed to parse OTEL_EXPORTER_OTLP_HEADERS", {
        error: error.message,
        headers: this.config.headers,
      });
      return {};
    }
  }

  /**
   * Normalize endpoint URL for gRPC
   * @returns {string} Normalized endpoint
   */
  normalizeEndpoint() {
    let endpoint = this.config.endpoint;

    // Remove any existing protocol prefix
    endpoint = endpoint.replace(/^(https?|grpc|grpcs):\/\//, "");

    // Validate endpoint format (host:port)
    if (!endpoint.includes(":")) {
      logWarn("OTLP endpoint missing port, appending default gRPC port :4317", {
        endpoint,
      });
      endpoint = `${endpoint}:4317`;
    }

    return endpoint;
  }

  /**
   * Build telemetry configuration for Temporal Runtime
   * @returns {Object} Telemetry configuration object
   */
  buildTelemetryConfig() {
    const telemetryConfig = {
      logging: {
        forward: {},
        filter: makeTelemetryFilterString({
          core: this.config.logLevelCore,
          other: this.config.logLevelOther,
        }),
      },
    };

    if (!this.config.enabled) {
      logInfo("OTEL telemetry is disabled");
      return telemetryConfig;
    }

    const validation = this.validateConfig();
    if (!validation.valid) {
      throw new Error(
        `OTEL configuration invalid: ${validation.errors.join(", ")}`,
      );
    }

    const normalizedEndpoint = this.normalizeEndpoint();
    const headers = this.parseHeaders();

    telemetryConfig.metrics = {
      otel: {
        url: `grpc://${normalizedEndpoint}`,
        headers,
        temporality: this.config.metricsTemporality,
        metricsExportInterval: this.config.metricsExportIntervalMs,
      },
    };

    logInfo("OTEL metrics configuration built", {
      endpoint: `grpc://${normalizedEndpoint}`,
      protocol: this.config.protocol,
      temporality: this.config.metricsTemporality,
      exportIntervalMs: this.config.metricsExportIntervalMs,
      logLevelCore: this.config.logLevelCore,
      logLevelOther: this.config.logLevelOther,
      headerCount: Object.keys(headers).length,
    });

    return telemetryConfig;
  }

  /**
   * Initialize the Temporal Runtime with telemetry
   * @throws {Error} If initialization fails
   */
  initialize() {
    try {
      if (this.isInitialized) {
        logWarn("Telemetry already initialized, skipping");
        return;
      }

      logInfo("Initializing Temporal telemetry");

      const telemetryConfig = this.buildTelemetryConfig();

      Runtime.install({
        telemetryOptions: telemetryConfig,
      });

      this.isInitialized = true;

      if (this.config.enabled) {
        logInfo(
          "Temporal telemetry initialized successfully with OTEL metrics export",
          {
            endpoint: this.config.endpoint,
            serviceName: this.config.serviceName,
            serviceVersion: this.config.serviceVersion,
          },
        );
      } else {
        logInfo("Temporal telemetry initialized (OTEL disabled)");
      }
    } catch (error) {
      logError("Failed to initialize Temporal telemetry", {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Get telemetry status
   * @returns {Object} Current telemetry status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isEnabled: this.config.enabled,
      endpoint: this.config.enabled ? this.config.endpoint : null,
      serviceName: this.config.serviceName,
      serviceVersion: this.config.serviceVersion,
    };
  }
}

// Singleton instance
let telemetryManager = null;

/**
 * Get or create the telemetry manager singleton
 * @returns {TelemetryManager} Telemetry manager instance
 */
export function getTelemetryManager() {
  if (!telemetryManager) {
    telemetryManager = new TelemetryManager();
  }
  return telemetryManager;
}

/**
 * Initialize Temporal telemetry
 * This function should be called before creating any workers
 */
export function initializeTelemetry() {
  const manager = getTelemetryManager();
  manager.initialize();
}

/**
 * Get current telemetry status
 * @returns {Object} Telemetry status
 */
export function getTelemetryStatus() {
  const manager = getTelemetryManager();
  return manager.getStatus();
}

export default {
  initialize: initializeTelemetry,
  getStatus: getTelemetryStatus,
  getManager: getTelemetryManager,
};
