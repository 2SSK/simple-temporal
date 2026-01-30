const { NativeConnection, Worker } = require('@temporalio/worker');
const path = require('path');
const temporalModule = require('./src');
const { initializeRuntime, getMetricsConfig } = require('./runtime');

async function run() {
  try {
    // Initialize runtime with Prometheus metrics
    initializeRuntime();
    const metricsConfig = getMetricsConfig();
    console.log(`[Worker] Metrics available at: ${metricsConfig.url}`);
    
    const address = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
    console.log(`[Worker] Connecting to Temporal at ${address}...`);
    
    const connection = await NativeConnection.connect({
      address: address,
    });
    
    const namespace = process.env.TEMPORAL_NAMESPACE || 'default';
    const taskQueue = process.env.DEFAULT_TASK_QUEUE || 'default_queue';
    
    // Auto-discover all workflows and activities
    const workflowsPath = path.join(__dirname, 'src', 'workflows');
    const activities = temporalModule.activities;
    
    console.log('[Worker] Available workflows:', temporalModule.getWorkflowNames());
    console.log('[Worker] Available activities:', temporalModule.getActivityNames());
    console.log(`[Worker] Task Queue: ${taskQueue}`);
    console.log(`[Worker] Namespace: ${namespace}`);
    
    const worker = await Worker.create({
      connection,
      namespace: namespace,
      taskQueue: taskQueue,
      workflowsPath: workflowsPath,
      activities: activities,
    });
    
    console.log('[Worker] Started successfully');
    console.log('[Worker] Waiting for tasks...');
    
    await worker.run();
  } catch (error) {
    console.error('[Worker] Failed to start:', error);
    process.exit(1);
  }
}

run().catch((error) => {
  console.error('[Worker] Unhandled error:', error);
  process.exit(1);
});
