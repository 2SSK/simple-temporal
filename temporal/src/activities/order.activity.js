import { createContextLogger } from "../../../utils/logger.js";

const logger = createContextLogger("orderActivity");

/**
 * Validate payment information
 * @param {Object} paymentMethod - Payment method details
 * @returns {boolean} - Whether payment is valid
 */
export async function validatePayment(paymentMethod) {
  logger.info("Validating payment", { type: paymentMethod?.type });
  
  // Simulate payment validation
  if (!paymentMethod || !paymentMethod.type) {
    throw new Error("Payment method is required");
  }
  
  const validTypes = ["credit_card", "debit_card", "paypal", "bank_transfer"];
  if (!validTypes.includes(paymentMethod.type)) {
    throw new Error(`Invalid payment type: ${paymentMethod.type}`);
  }
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  logger.info("Payment validated successfully");
  return true;
}

/**
 * Process payment with external payment gateway
 * @param {Object} paymentMethod - Payment method details
 * @param {number} amount - Payment amount
 * @returns {Object} - Payment result
 */
export async function processPayment(paymentMethod, amount) {
  logger.info("Processing payment", { type: paymentMethod.type, amount });
  
  // Simulate payment processing
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simulate 95% success rate
  const success = Math.random() > 0.05;
  
  if (!success) {
    throw new Error("Payment declined by bank");
  }
  
  const paymentResult = {
    transactionId: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    amount,
    status: "completed",
    timestamp: new Date().toISOString(),
  };
  
  logger.info("Payment processed successfully", { transactionId: paymentResult.transactionId });
  return paymentResult;
}

/**
 * Update inventory for ordered items
 * @param {Array} items - Array of order items
 * @returns {Object} - Inventory update result
 */
export async function updateInventory(items) {
  logger.info("Updating inventory", { itemCount: items.length });
  
  // Simulate inventory update
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const inventoryUpdates = items.map(item => ({
    productId: item.productId,
    quantity: item.quantity,
    reserved: true,
    timestamp: new Date().toISOString(),
  }));
  
  logger.info("Inventory updated successfully", { itemsReserved: inventoryUpdates.length });
  return { updated: inventoryUpdates };
}

/**
 * Send order confirmation email
 * @param {Object} orderDetails - Order information
 * @returns {Object} - Email result
 */
export async function sendOrderConfirmation(orderDetails) {
  logger.info("Sending order confirmation", { 
    orderId: orderDetails.orderId, 
    customerId: orderDetails.customerId 
  });
  
  // Simulate email sending
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const emailResult = {
    to: orderDetails.customerEmail,
    subject: `Order Confirmation #${orderDetails.orderId}`,
    sent: true,
    timestamp: new Date().toISOString(),
  };
  
  logger.info("Order confirmation sent successfully", { 
    orderId: orderDetails.orderId,
    emailId: emailResult.sent ? "sent" : "failed"
  });
  return emailResult;
}

/**
 * Cancel order and restore inventory
 * @param {Object} orderDetails - Order information
 * @param {string} reason - Cancellation reason
 * @returns {Object} - Cancellation result
 */
export async function cancelOrder(orderDetails, reason) {
  logger.info("Cancelling order", { 
    orderId: orderDetails.orderId, 
    reason 
  });
  
  // Simulate cancellation process
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Restore inventory
  const inventoryRestored = orderDetails.items.map(item => ({
    productId: item.productId,
    quantity: item.quantity,
    reserved: false,
    timestamp: new Date().toISOString(),
  }));
  
  const cancelResult = {
    orderId: orderDetails.orderId,
    cancelled: true,
    reason,
    inventoryRestored: inventoryRestored,
    refundProcessed: false, // Refund would be separate workflow
    timestamp: new Date().toISOString(),
  };
  
  logger.info("Order cancelled successfully", { 
    orderId: orderDetails.orderId,
    inventoryRestored: inventoryRestored.length
  });
  return cancelResult;
}