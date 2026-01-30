import userController from '../controllers/userController.js';

/**
 * User route configuration
 * @param {Object} app - Express app instance
 * @param {Object} temporalClient - Temporal client manager
 */
function userRoutes(app, temporalClient) {
  const basePath = '/api/users';
  const taskQueue = process.env.DEFAULT_TASK_QUEUE || 'default_queue';
  
  // POST /api/users/register - Register new user
  app.post(`${basePath}/register`, async (req, res) => {
    await userController.registerUser(req, res, temporalClient, taskQueue);
  });
  
  // GET /api/users/:id - Get user details
  app.get(`${basePath}/:id`, async (req, res) => {
    await userController.getUserStatus(req, res, temporalClient);
  });
  
  // GET /api/users - List users
  app.get(basePath, async (req, res) => {
    await userController.listUsers(req, res, temporalClient);
  });
  
  // POST /api/users/:id/suspend - Suspend user
  app.post(`${basePath}/:id/suspend`, async (req, res) => {
    await userController.suspendUser(req, res, temporalClient);
  });
  
  console.log(`[Routes] User routes registered: ${basePath}`);
}

export default userRoutes;
