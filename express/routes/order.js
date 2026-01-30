const orderController = require('../controllers/orderController');

/**
 * Order route configuration
 * @param {Object} app - Express app instance
 * @param {Object} temporalClient - Temporal client manager
 */
function orderRoutes(app, temporalClient) {
  const basePath = '/api/orders';
  const taskQueue = process.env.ORDER_QUEUE || 'default_queue';
  
  // POST /api/orders - Create new order
  app.post(basePath, async (req, res) => {
    await orderController.createOrder(req, res, temporalClient, taskQueue);
  });
  
  // GET /api/orders/:id - Get order status
  app.get(`${basePath}/:id`, async (req, res) => {
    await orderController.getOrderStatus(req, res, temporalClient);
  });
  
  // GET /api/orders - List orders
  app.get(basePath, async (req, res) => {
    await orderController.listOrders(req, res, temporalClient);
  });
  
  // POST /api/orders/:id/cancel - Cancel order
  app.post(`${basePath}/:id/cancel`, async (req, res) => {
    await orderController.cancelOrder(req, res, temporalClient);
  });
  
  console.log(`[Routes] Order routes registered: ${basePath}`);
}

module.exports = orderRoutes;
