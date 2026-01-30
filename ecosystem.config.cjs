module.exports = {
  apps: [
    {
      name: 'temporal-worker',
      script: 'temporal/worker.js',
      cwd: '.',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
        TEMPORAL_ADDRESS: 'localhost:7233',
        TEMPORAL_NAMESPACE: 'default',
        DEFAULT_TASK_QUEUE: 'default_queue',
        WORKER_METRICS_PORT: 9464,
        LOG_LEVEL: 'info'
      },
      env_production: {
        NODE_ENV: 'production',
        TEMPORAL_ADDRESS: 'temporal:7233',
        TEMPORAL_NAMESPACE: 'default',
        DEFAULT_TASK_QUEUE: 'default_queue',
        WORKER_METRICS_PORT: 9464,
        LOG_LEVEL: 'warn'
      }
    }
  ]
};
