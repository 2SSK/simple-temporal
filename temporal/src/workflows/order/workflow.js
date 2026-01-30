import {
  proxyActivities,
  defineSignal,
  setHandler,
} from "@temporalio/workflow";

import orderActivities from "../../activities/index.js";

const WORKFLOW_CONFIG = {
  startToCloseTimeout: "2 minutes",
  executionTimeout: "5 minutes",
};

const proxiedActivities = proxyActivities(
  {
    startToCloseTimeout: WORKFLOW_CONFIG.startToCloseTimeout,
  },
  orderActivities,
);

const cancelOrder = defineSignal("cancelOrder");
const updateStatus = defineSignal("updateStatus");

async function OrderProcessingWorkflow({
  orderId,
  customerId,
  items,
  paymentMethod,
}) {
  console.log(`[OrderWorkflow] Starting for order: ${orderId}`);

  let currentStatus = "pending";
  let cancellationReason = null;

  setHandler(cancelOrder, (reason) => {
    console.log(
      `[OrderWorkflow] Cancellation requested for ${orderId}: ${reason}`,
    );
    cancellationReason = reason;
    currentStatus = "cancelled";
  });

  setHandler(updateStatus, (status) => {
    console.log(`[OrderWorkflow] Status update for ${orderId}: ${status}`);
    currentStatus = status;
  });

  try {
    console.log(`[OrderWorkflow] Step 1: Validating order ${orderId}`);
    const validation = await proxiedActivities.validateOrder({
      orderId,
      items,
      customerId,
    });

    if (!validation.isValid) {
      throw new Error("Order validation failed");
    }

    console.log(`[OrderWorkflow] Step 2: Checking inventory for ${orderId}`);
    const inventory = await proxiedActivities.checkInventory({ items });

    if (!inventory.success) {
      throw new Error(
        `Inventory unavailable: ${inventory.outOfStock.join(", ")}`,
      );
    }

    console.log(`[OrderWorkflow] Step 3: Processing payment for ${orderId}`);
    const payment = await proxiedActivities.processPayment({
      orderId,
      amount: validation.total,
      paymentMethod,
    });

    console.log(`[OrderWorkflow] Step 4: Fulfilling order ${orderId}`);
    const fulfillment = await proxiedActivities.fulfillOrder({
      orderId,
      items,
    });

    console.log(`[OrderWorkflow] Step 5: Sending confirmation for ${orderId}`);
    const notification = await proxiedActivities.sendConfirmation({
      orderId,
      customerId,
      orderDetails: { shipments: fulfillment.shipments },
    });

    const result = {
      orderId,
      customerId,
      status: "completed",
      items: items.length,
      totals: {
        subtotal: validation.subtotal,
        tax: validation.tax,
        shipping: validation.shipping,
        total: validation.total,
      },
      payment: {
        transactionId: payment.transactionId,
        amount: payment.amount,
        status: payment.status,
      },
      fulfillment: {
        shipments: fulfillment.shipments,
        status: fulfillment.status,
      },
      confirmation: {
        notificationId: notification.notificationId,
        status: notification.status,
      },
      timeline: {
        validatedAt: validation.validatedAt,
        inventoryCheckedAt: inventory.checkedAt,
        paidAt: payment.processedAt,
        fulfilledAt: fulfillment.fulfilledAt,
        confirmedAt: notification.sentAt,
        completedAt: new Date().toISOString(),
      },
    };

    console.log(`[OrderWorkflow] Completed order ${orderId}`);
    return result;
  } catch (error) {
    console.error(`[OrderWorkflow] Failed order ${orderId}:`, error.message);

    return {
      orderId,
      customerId,
      status: "failed",
      error: error.message,
      failedAt: new Date().toISOString(),
    };
  }
}

export { OrderProcessingWorkflow };
