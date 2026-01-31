import { createContextLogger } from "../../utils/logger.js";
import temporalClient from "../../temporal/client.js";

const logger = createContextLogger("userHandler");

export async function registerUserHandler(req, res) {
  try {
    const { email, password, name, preferences } = req.body;
    
    logger.info("Registering user", { email });
    
    // Basic validation
    if (!email || !password || !name) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["email", "password", "name"],
      });
    }

    // Start Temporal workflow
    const workflowClient = await temporalClient.getWorkflowClient(
      "UserRegistrationWorkflow",
      process.env.TASK_QUEUE || "default_queue",
    );

    const workflow = await workflowClient.start({
      email,
      password,
      name,
      preferences,
    });

    logger.info("User registration workflow started", { 
      email, 
      workflowId: workflow.workflowId 
    });

    res.status(202).json({
      success: true,
      message: "User registration workflow started",
      data: {
        workflowId: workflow.workflowId,
        runId: workflow.runId,
        status: "started"
      },
      warning: "API key will be available when workflow completes. Poll workflow status to retrieve it."
    });
  } catch (error) {
    logger.error("Failed to register user", { email: req.body.email, error: error.message });
    res.status(500).json({
      success: false,
      error: "Failed to register user",
      message: error.message,
    });
  }
}

export async function getUserStatusHandler(req, res) {
  try {
    const { id } = req.params;
    
    logger.info("Getting user status", { userId: id });
    
    const handle = await temporalClient.getWorkflowHandle(id);
    const description = await handle.describe();

    res.json({
      workflowId: id,
      status: description.status,
      startTime: description.startTime,
      runId: description.runId,
      workflowType: description.workflowType?.name,
    });
  } catch (error) {
    logger.error("Failed to get user status", { 
      userId: req.params.id, 
      error: error.message 
    });
    res.status(404).json({
      success: false,
      error: "User workflow not found",
      message: error.message,
    });
  }
}

export async function listUsersHandler(req, res) {
  try {
    logger.info("Listing users");
    
    const result = await temporalClient.listWorkflows(
      `WorkflowType = "UserRegistrationWorkflow"`,
      parseInt(req.query.pageSize) || 10,
    );

    const workflows = result.intoHistories || result.executions || result || [];
    const workflowArray = Array.isArray(workflows) ? workflows : [];

    res.json({
      count: workflowArray.length,
      users: workflowArray.map((wf) => ({
        workflowId: wf.workflowId || wf.execution?.workflowId,
        status: wf.status || wf.workflowExecutionInfo?.status,
        startTime: wf.startTime || wf.workflowExecutionInfo?.startTime,
        runId: wf.runId || wf.execution?.runId,
      })),
    });
  } catch (error) {
    logger.error("Failed to list users", { error: error.message });
    res.status(500).json({
      success: false,
      error: "Failed to list users",
      message: error.message,
    });
  }
}

export async function suspendUserHandler(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    logger.info("Suspending user", { userId: id, reason });
    
    // For now, just return success (implementation would trigger suspension workflow)
    res.json({
      success: true,
      message: "User suspension requested",
      userId: id,
      reason: reason || "Not specified",
      note: "This would trigger user deactivation workflow"
    });
  } catch (error) {
    logger.error("Failed to suspend user", { 
      userId: req.params.id, 
      error: error.message 
    });
    res.status(500).json({
      success: false,
      error: "Failed to suspend user",
      message: error.message,
    });
  }
}
