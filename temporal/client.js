import { Connection, Client } from "@temporalio/client";

class TemporalClientManager {
  constructor() {
    this.client = null;
    this.connection = null;
    this.connected = false;
  }

  async connect() {
    if (this.client && this.connected) {
      return this.client;
    }

    try {
      const address = process.env.TEMPORAL_ADDRESS || "localhost:7233";
      console.log(`[TemporalClient] Connecting to ${address}...`);

      this.connection = await Connection.connect({
        address: address,
      });

      const namespace = process.env.TEMPORAL_NAMESPACE || "default";
      this.client = new Client({
        connection: this.connection,
        namespace: namespace,
      });

      this.connected = true;
      console.log(
        `[TemporalClient] Connected successfully to namespace: ${namespace}`,
      );

      return this.client;
    } catch (error) {
      console.error("[TemporalClient] Failed to connect:", error.message);
      this.connected = false;
      throw error;
    }
  }

  async getClient() {
    if (!this.client || !this.connected) {
      await this.connect();
    }
    return this.client;
  }

  async getWorkflowClient(workflowName, taskQueue = null, options = {}) {
    const client = await this.getClient();

    const defaultOptions = {
      workflowId: `${workflowName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      taskQueue: taskQueue || process.env.DEFAULT_TASK_QUEUE || "default_queue",
      ...options,
    };

    return {
      client,
      workflowName,

      async start(args) {
        const workflow = await client.workflow.start(workflowName, {
          ...defaultOptions,
          args: [args],
        });
        return workflow;
      },

      async execute(args) {
        const workflow = await client.workflow.start(workflowName, {
          ...defaultOptions,
          args: [args],
        });
        return await workflow.result();
      },

      async startWithId(workflowId, args) {
        const workflow = await client.workflow.start(workflowName, {
          workflowId: workflowId,
          taskQueue: defaultOptions.taskQueue,
          args: [args],
        });
        return workflow;
      },

      async executeWithId(workflowId, args) {
        const workflow = await client.workflow.start(workflowName, {
          workflowId: workflowId,
          taskQueue: defaultOptions.taskQueue,
          args: [args],
        });
        return await workflow.result();
      },
    };
  }

  async getWorkflowHandle(workflowId) {
    const client = await this.getClient();
    return client.workflow.getHandle(workflowId);
  }

  async listWorkflows(query = "", pageSize = 20) {
    const client = await this.getClient();
    const workflows = await client.workflow.list({
      query: query || `ExecutionStatus = "Running"`,
      pageSize: pageSize,
    });
    return workflows;
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
      this.client = null;
      this.connected = false;
      console.log("[TemporalClient] Disconnected");
    }
  }

  isConnected() {
    return this.connected && this.client !== null;
  }
}

// Singleton instance
const temporalClientManager = new TemporalClientManager();

// Helper functions for convenience
export const connect = () => temporalClientManager.connect();
export const disconnect = () => temporalClientManager.disconnect();

export default temporalClientManager;
