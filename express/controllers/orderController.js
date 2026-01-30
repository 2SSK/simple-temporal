/**
 * Controller for order operations
 */
const orderController = {
  /**
   * Create a new order
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Object} temporalClient - Temporal client manager
   * @param {string} taskQueue - Task queue for the workflow
   */
  async createOrder(req, res, temporalClient, taskQueue) {
    try {
      const { customerId, items, paymentMethod } = req.body;
      
      // Validate required fields
      if (!customerId) {
        return res.status(400).json({
          error: 'Customer ID is required',
          message: 'Please provide a customerId in the request body',
          example: {
            method: 'POST',
            body: {
              customerId: 'cust_123',
              items: [
                { productId: 'prod_001', quantity: 2, price: 29.99 }
              ],
              paymentMethod: { type: 'credit_card', last4: '4242' }
            },
            url: '/api/orders'
          }
        });
      }
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          error: 'Items are required',
          message: 'Please provide items array in the request body'
        });
      }
      
      // Validate each item
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item.productId || !item.quantity || !item.price) {
          return res.status(400).json({
            error: 'Invalid item format',
            message: `Item at index ${i} must have productId, quantity, and price`
          });
        }
      }
      
      const orderId = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`[OrderController] Creating order: ${orderId}`);
      
      const workflowClient = await temporalClient.getWorkflowClient(
        'OrderProcessingWorkflow',
        taskQueue
      );
      
      const result = await workflowClient.execute({
        orderId,
        customerId,
        items,
        paymentMethod
      });
      
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          orderId: result.orderId,
          status: result.status,
          total: result.totals?.total,
          transactionId: result.payment?.transactionId,
          ...(result.status === 'completed' && {
            shipments: result.fulfillment?.shipments
          })
        }
      });
    } catch (error) {
      console.error('[OrderController] Error in createOrder:', error);
      res.status(500).json({
        error: 'Failed to create order',
        message: error.message
      });
    }
  },
  
  /**
   * Get order status
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Object} temporalClient - Temporal client manager
   */
  async getOrderStatus(req, res, temporalClient) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          error: 'Order ID is required',
          message: 'Please provide an order ID in the URL'
        });
      }
      
      const handle = await temporalClient.getWorkflowHandle(id);
      const description = await handle.describe();
      
      res.json({
        workflowId: id,
        status: description.status,
        startTime: description.startTime,
        runId: description.runId,
        workflowType: description.workflowType?.name
      });
    } catch (error) {
      console.error('[OrderController] Error in getOrderStatus:', error);
      res.status(404).json({
        error: 'Order not found',
        message: error.message
      });
    }
  },
  
  /**
   * List orders
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Object} temporalClient - Temporal client manager
   */
  async listOrders(req, res, temporalClient) {
    try {
      const pageSize = parseInt(req.query.pageSize) || 10;
      const workflows = await temporalClient.listWorkflows(
        `WorkflowType = "OrderProcessingWorkflow"`,
        pageSize
      );
      
      res.json({
        count: workflows.length,
        orders: workflows.map(wf => ({
          orderId: wf.workflowId,
          status: wf.status,
          startTime: wf.startTime,
          runId: wf.runId
        }))
      });
    } catch (error) {
      console.error('[OrderController] Error in listOrders:', error);
      res.status(500).json({
        error: 'Failed to list orders',
        message: error.message
      });
    }
  },
  
  /**
   * Cancel order
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Object} temporalClient - Temporal client manager
   */
  async cancelOrder(req, res, temporalClient) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      if (!id) {
        return res.status(400).json({
          error: 'Order ID is required',
          message: 'Please provide an order ID in the URL'
        });
      }
      
      // Get workflow handle and send cancellation signal
      const handle = await temporalClient.getWorkflowHandle(id);
      await handle.signal('cancelOrder', reason || 'User requested cancellation');
      
      res.json({
        success: true,
        message: 'Order cancellation requested',
        orderId: id,
        reason: reason || 'Not specified'
      });
    } catch (error) {
      console.error('[OrderController] Error in cancelOrder:', error);
      res.status(500).json({
        error: 'Failed to cancel order',
        message: error.message
      });
    }
  }
};

module.exports = orderController;
