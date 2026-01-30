const { proxyActivities, defineSignal, setHandler } = require('@temporalio/workflow');

// Get activities from the auto-loaded module
const activities = require('../../activities').orderActivities;

/**
 * Configuration for workflow timeouts
 */
const WORKFLOW_CONFIG = {
  startToCloseTimeout: '2 minutes',
  executionTimeout: '5 minutes',
};

/**
 * Proxy activities with configuration
 */
const proxiedActivities = proxyActivities({
  startToCloseTimeout: WORKFLOW_CONFIG.startToCloseTimeout,
}, activities);

// Signals for interactive workflows
const cancelOrder = defineSignal('cancelOrder');
const updateStatus = defineSignal('updateStatus');

/**
 * OrderProcessingWorkflow - Complete order processing pipeline
 * @param {Object} input - Workflow input
 * @param {string} input.orderId - Unique order identifier
 * @param {string} input.customerId - Customer ID
 * @param {Array} input.items - Order items with productId, quantity, price
 * @param {Object} input.paymentMethod - Payment information
 * @returns {Promise<Object>} Complete order result
 */
async function OrderProcessingWorkflow({ orderId, customerId, items, paymentMethod }) {
  console.log(`[OrderWorkflow] Starting for order: ${orderId}`);
  
  let currentStatus = 'pending';
  let cancellationReason = null;
  
  // Handle cancellation signal
  setHandler(cancelOrder, (reason) => {
    console.log(`[OrderWorkflow] Cancellation requested for ${orderId}: ${reason}`);
    cancellationReason = reason;
    currentStatus = 'cancelled';
  });
  
  // Handle status update signal
  setHandler(updateStatus, (status) => {
    console.log(`[OrderWorkflow] Status update for ${orderId}: ${status}`);
    currentStatus = status;
  });
  
  try {
    // Step 1: Validate Order
    console.log(`[OrderWorkflow] Step 1: Validating order ${orderId}`);
    const validation = await proxiedActivities.validateOrder({
      orderId,
      items,
      customerId
    });
    
    if (!validation.isValid) {
      throw new Error('Order validation failed');
    }
    
    // Step 2: Check Inventory
    console.log(`[OrderWorkflow] Step 2: Checking inventory for ${orderId}`);
    const inventory = await proxiedActivities.checkInventory({ items });
    
    if (!inventory.success) {
      throw new Error(`Inventory unavailable: ${inventory.outOfStock.join(', ')}`);
    }
    
    // Step 3: Process Payment
    console.log(`[OrderWorkflow] Step 3: Processing payment for ${orderId}`);
    const payment = await proxiedActivities.processPayment({
      orderId,
      amount: validation.total,
      paymentMethod
    });
    
    // Step 4: Fulfill Order
    console.log(`[OrderWorkflow] Step 4: Fulfilling order ${orderId}`);
    const fulfillment = await proxiedActivities.fulfillOrder({
      orderId,
      items
    });
    
    // Step 5: Send Confirmation
    console.log(`[OrderWorkflow] Step 5: Sending confirmation for ${orderId}`);
    const notification = await proxiedActivities.sendConfirmation({
      orderId,
      customerId,
      orderDetails: { shipments: fulfillment.shipments }
    });
    
    const result = {
      orderId,
      customerId,
      status: 'completed',
      items: items.length,
      totals: {
        subtotal: validation.subtotal,
        tax: validation.tax,
        shipping: validation.shipping,
        total: validation.total
      },
      payment: {
        transactionId: payment.transactionId,
        amount: payment.amount,
        status: payment.status
      },
      fulfillment: {
        shipments: fulfillment.shipments,
        status: fulfillment.status
      },
      confirmation: {
        notificationId: notification.notificationId,
        status: notification.status
      },
      timeline: {
        validatedAt: validation.validatedAt,
        inventoryCheckedAt: inventory.checkedAt,
        paidAt: payment.processedAt,
        fulfilledAt: fulfillment.fulfilledAt,
        confirmedAt: notification.sentAt,
        completedAt: new Date().toISOString()
      }
    };
    
    console.log(`[OrderWorkflow] Completed order ${orderId}`);
    return result;
    
  } catch (error) {
    console.error(`[OrderWorkflow] Failed order ${orderId}:`, error.message);
    
    return {
      orderId,
      customerId,
      status: 'failed',
      error: error.message,
      failedAt: new Date().toISOString()
    };
  }
}

module.exports = { OrderProcessingWorkflow };
