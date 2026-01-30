/**
 * Controller for user operations
 */
const userController = {
  /**
   * Register a new user
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Object} temporalClient - Temporal client manager
   * @param {string} taskQueue - Task queue for the workflow
   */
  async registerUser(req, res, temporalClient, taskQueue) {
    try {
      const { email, password, name, preferences } = req.body;
      
      // Validate required fields
      if (!email) {
        return res.status(400).json({
          error: 'Email is required',
          message: 'Please provide an email in the request body',
          example: {
            method: 'POST',
            body: {
              email: 'user@example.com',
              password: 'securepassword123',
              name: 'John Doe',
              preferences: { language: 'en', theme: 'dark' }
            },
            url: '/api/users/register'
          }
        });
      }
      
      if (!password) {
        return res.status(400).json({
          error: 'Password is required',
          message: 'Please provide a password in the request body'
        });
      }
      
      if (!name) {
        return res.status(400).json({
          error: 'Name is required',
          message: 'Please provide a name in the request body'
        });
      }
      
      console.log(`[UserController] Registering user: ${email}`);
      
      const workflowClient = await temporalClient.getWorkflowClient(
        'UserRegistrationWorkflow',
        taskQueue
      );
      
      // Start workflow without waiting for result
      const workflow = await workflowClient.start({
        email,
        password,
        name,
        preferences
      });
      
      res.status(202).json({
        success: true,
        message: 'User registration workflow started',
        data: {
          workflowId: workflow.workflowId,
          runId: workflow.runId,
          status: 'started'
        },
        warning: 'API key will be available when workflow completes. Poll the workflow status to retrieve it.'
      });
    } catch (error) {
      console.error('[UserController] Error in registerUser:', error);
      res.status(500).json({
        error: 'Failed to register user',
        message: error.message
      });
    }
  },
  
  /**
   * Get user status
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Object} temporalClient - Temporal client manager
   */
  async getUserStatus(req, res, temporalClient) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          error: 'User ID is required',
          message: 'Please provide a user ID in the URL'
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
      console.error('[UserController] Error in getUserStatus:', error);
      res.status(404).json({
        error: 'User workflow not found',
        message: error.message
      });
    }
  },
  
  /**
   * List users
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Object} temporalClient - Temporal client manager
   */
  async listUsers(req, res, temporalClient) {
    try {
      const pageSize = parseInt(req.query.pageSize) || 10;
      const workflows = await temporalClient.listWorkflows(
        `WorkflowType = "UserRegistrationWorkflow"`,
        pageSize
      );
      
      res.json({
        count: workflows.length,
        users: workflows.map(wf => ({
          workflowId: wf.workflowId,
          status: wf.status,
          startTime: wf.startTime,
          runId: wf.runId
        }))
      });
    } catch (error) {
      console.error('[UserController] Error in listUsers:', error);
      res.status(500).json({
        error: 'Failed to list users',
        message: error.message
      });
    }
  },
  
  /**
   * Suspend user
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Object} temporalClient - Temporal client manager
   */
  async suspendUser(req, res, temporalClient) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      if (!id) {
        return res.status(400).json({
          error: 'User ID is required',
          message: 'Please provide a user ID in the URL'
        });
      }
      
      // For now, just return success
      res.json({
        success: true,
        message: 'User suspension requested',
        userId: id,
        reason: reason || 'Not specified',
        note: 'This would trigger user deactivation workflow'
      });
    } catch (error) {
      console.error('[UserController] Error in suspendUser:', error);
      res.status(500).json({
        error: 'Failed to suspend user',
        message: error.message
      });
    }
  }
};

export default userController;
