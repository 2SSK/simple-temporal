import { defineSignal, setHandler, condition } from "@temporalio/workflow";
import { 
  validatePayment, 
  processPayment, 
  updateInventory, 
  sendOrderConfirmation 
} from "../activities/order.activity.js";

/**
 * Signal to cancel the order
 */
export const cancelOrderSignal = defineSignal("cancelOrder");

/**
 * Order Processing Workflow
 * Handles the complete order lifecycle from creation to completion
 */
export async function OrderProcessingWorkflow({ orderId, customerId, items, paymentMethod }) {
  let paymentResult = null;
  let orderStatus = "processing";
  let cancellationReason = null;

  // Handle cancellation signal
  setHandler(cancelOrderSignal, (reason) => {
    cancellationReason = reason;
    orderStatus = "cancelled";
  });

  try {
    // Step 1: Validate payment method
    await validatePayment(paymentMethod);
    
    // Step 2: Update inventory (reserve items)
    await updateInventory(items);
    orderStatus = "inventory_reserved";
    
    // Step 3: Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Step 4: Process payment
    paymentResult = await processPayment(paymentMethod, totalAmount);
    orderStatus = "payment_processed";
    
    // Step 5: Send order confirmation
    await sendOrderConfirmation({
      orderId,
      customerId,
      items,
      paymentMethod,
      totalAmount,
      paymentTransactionId: paymentResult.transactionId,
    });
    
    orderStatus = "completed";
    
    // Return final order status
    return {
      orderId,
      customerId,
      items,
      paymentResult,
      status: orderStatus,
      totalAmount,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      cancellationReason: null,
    };
    
  } catch (error) {
    orderStatus = "failed";
    
    return {
      orderId,
      customerId,
      items,
      paymentResult,
      status: orderStatus,
      error: error.message,
      failedAt: new Date().toISOString(),
      cancellationReason: cancellationReason,
    };
  }
}

/**
 * Order Cancellation Workflow
 * Handles order cancellation and inventory restoration
 */
export async function OrderCancellationWorkflow({ orderId, items, reason }) {
  try {
    // Import here to avoid circular dependency
    const { cancelOrder } = await import("../activities/order.activity.js");
    
    // Cancel the order and restore inventory
    const result = await cancelOrderActivity({ orderId, items }, reason);
    
    return {
      orderId,
      cancelled: true,
      reason,
      inventoryRestored: result.inventoryRestored,
      cancelledAt: new Date().toISOString(),
    };
    
  } catch (error) {
    return {
      orderId,
      cancelled: false,
      error: error.message,
      failedAt: new Date().toISOString(),
    };
  }
}