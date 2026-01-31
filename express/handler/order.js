import { createContextLogger } from "../../utils/logger.js";
import temporalClient from "../../temporal/client.js";

const logger = createContextLogger("orderHandler");

export async function createOrderHandler(req, res) {
  try {
    const { customerId, items, paymentMethod } = req.body;

    logger.info("Creating order", { customerId });

    // Basic validation
    if (!customerId || !items) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["customerId", "items"],
      });
    }

    // Start Temporal workflow
    const workflowClient = await temporalClient.getWorkflowClient(
      "OrderProcessingWorkflow",
      process.env.TASK_QUEUE || "default_queue",
    );

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const workflow = await workflowClient.start({
      orderId,
      customerId,
      items,
      paymentMethod,
    });

    logger.info("Order workflow started", {
      orderId,
      workflowId: workflow.workflowId,
    });

    res.status(202).json({
      success: true,
      message: "Order workflow started",
      data: {
        orderId,
        workflowId: workflow.workflowId,
        runId: workflow.runId,
        status: "started",
      },
    });
  } catch (error) {
    logger.error("Failed to create order", { error: error.message });
    res.status(500).json({
      success: false,
      error: "Failed to create order",
      message: error.message,
    });
  }
}

export async function getOrderStatusHandler(req, res) {
  try {
    const { id } = req.params;

    logger.info("Getting order status", { orderId: id });

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
    logger.error("Failed to get order status", {
      orderId: req.params.id,
      error: error.message,
    });
    res.status(404).json({
      success: false,
      error: "Order not found",
      message: error.message,
    });
  }
}

export async function listOrdersHandler(req, res) {
  try {
    logger.info("Listing orders");

    const result = await temporalClient.listWorkflows(
      `WorkflowType = "OrderProcessingWorkflow"`,
      parseInt(req.query.pageSize) || 10,
    );

    const workflows = result.intoHistories || result.executions || result || [];
    const workflowArray = Array.isArray(workflows) ? workflows : [];

    res.json({
      count: workflowArray.length,
      orders: workflowArray.map((wf) => ({
        orderId: wf.workflowId || wf.execution?.workflowId,
        status: wf.status || wf.workflowExecutionInfo?.status,
        startTime: wf.startTime || wf.workflowExecutionInfo?.startTime,
        runId: wf.runId || wf.execution?.runId,
      })),
    });
  } catch (error) {
    logger.error("Failed to list orders", { error: error.message });
    res.status(500).json({
      success: false,
      error: "Failed to list orders",
      message: error.message,
    });
  }
}

export async function cancelOrderHandler(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    logger.info("Cancelling order", { orderId: id, reason });

    const handle = await temporalClient.getWorkflowHandle(id);
    await handle.signal("cancelOrder", reason || "User requested cancellation");

    res.json({
      success: true,
      message: "Order cancellation requested",
      orderId: id,
      reason: reason || "Not specified",
    });
  } catch (error) {
    logger.error("Failed to cancel order", {
      orderId: req.params.id,
      error: error.message,
    });
    res.status(500).json({
      success: false,
      error: "Failed to cancel order",
      message: error.message,
    });
  }
}

