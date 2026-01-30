const express = require('express');
const { loadRoutes } = require('./routes');

/**
 * Create and configure Express application
 * @param {Object} temporalClient - Temporal client manager
 * @returns {Object} Configured Express app
 */
function createApp(temporalClient) {
  const app = express();
  
  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.path}`);
    next();
  });
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      temporal: {
        connected: temporalClient.isConnected()
      }
    });
  });
  
  // API info endpoint
  app.get('/api', (req, res) => {
    res.json({
      name: 'Express + Temporal API',
      version: '1.0.0',
      status: 'running',
      temporal: {
        connected: temporalClient.isConnected(),
        namespace: process.env.TEMPORAL_NAMESPACE || 'default'
      },
      endpoints: {
        health: 'GET /health',
        api: 'GET /api',
        orders: {
          create: 'POST /api/orders',
          get: 'GET /api/orders/:id',
          list: 'GET /api/orders',
          cancel: 'POST /api/orders/:id/cancel'
        },
        users: {
          register: 'POST /api/users/register',
          get: 'GET /api/users/:id',
          list: 'GET /api/users',
          suspend: 'POST /api/users/:id/suspend'
        }
      }
    });
  });
  
  // Load all routes
  loadRoutes(app, temporalClient);
  
  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('[Error]', err);
    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  });
  
  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not found',
      message: `Route ${req.method} ${req.path} not found`,
      availableRoutes: ['/health', '/api', '/api/orders', '/api/users']
    });
  });
  
  return app;
}

module.exports = createApp;
