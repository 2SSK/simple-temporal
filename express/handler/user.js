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
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const workflow = await temporalClient.workflow.start(
      "UserRegistrationWorkflow",
      {
        taskId: process.env.TASK_QUEUE || "default_queue",
        workflowId: userId,
        args: [email, password, name, preferences],
      },
    );

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
    
    const handle = temporalClient.workflow.getHandle(id, process.env.TASK_QUEUE || "default_queue");
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
    
    // For now, return a mock response since listWorkflows is complex
    res.json({
      count: 0,
      users: [],
      message: "User listing feature coming soon",
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
    
    // Trigger suspension workflow
    const suspendUserId = `suspend_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const suspendWorkflow = await temporalClient.workflow.start(
      "UserSuspensionWorkflow",
      {
        taskId: process.env.TASK_QUEUE || "default_queue",
        workflowId: suspendUserId,
        args: [id, reason],
      },
    );
    
    res.json({
      success: true,
      message: "User suspension workflow started",
      userId: id,
      reason: reason || "Not specified",
      workflowId: suspendWorkflow.workflowId,
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
