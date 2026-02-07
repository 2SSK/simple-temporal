module.exports = {
  apps: [
    // =========================
    // EXPRESS API SERVER
    // =========================
    {
      name: "express-api-server",
      script: "./server.js",
      //
      // Process mode
      exec_mode: "fork",
      instances: 1,

      // Restart & stability
      autorestart: true,
      max_memory_restart: "400M",
      restart_delay: 3000,
      min_uptime: "10s",
      max_restarts: 10,

      // Environment variables
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },

      // Logging
      log_data_format: "YYYY-MM-DD HH:mm:ss",
      out_file: "./logs/api.out.log",
      error_file: "./logs/api.error.log",
      merge_logs: true,

      // Performance & safety
      watch: false,
      kill_timeout: 5000,
      listen_timeout: 5000,

      // Advanced monitoring
      node_args: "--max-old-space-size=512",

      // Graceful shutdown support
      shutdown_with_message: true,
    },

    // =========================
    // TEMPORAL WORKER
    // =========================
    {
      name: "temporal-worker",
      script: "src/internals/temporal/worker.js",
      exec_mode: "fork",
      instances: 1,

      // Restart & stability
      autorestart: true,
      max_memory_restart: "512M",
      restart_delay: 5000,
      min_uptime: "10s",
      max_restarts: 10,

      // Environment variables
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },

      // Logging
      log_data_format: "YYYY-MM-DD HH:mm:ss",
      out_file: "./logs/worker.out.log",
      error_file: "./logs/worker.error.log",
      merge_logs: true,

      // Performance & safety
      watch: false,
      kill_timeout: 10000,
      listen_timeout: 10000,

      // Advanced monitoring
      node_args: "--max-old-space-size=1024",

      // Graceful shutdown support
      shutdown_with_message: true,
    },
  ],
};
