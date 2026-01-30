const fs = require('fs');
const path = require('path');

/**
 * Auto-load all route files from routes directory
 * @param {Object} app - Express app instance
 * @param {Object} temporalClient - Temporal client manager
 */
function loadRoutes(app, temporalClient) {
  const routesPath = __dirname;
  
  // Read all files in routes directory
  const routeFiles = fs.readdirSync(routesPath).filter(file => {
    return file.endsWith('.js') && file !== 'index.js';
  });
  
  console.log(`[Routes] Found ${routeFiles.length} route files`);
  
  for (const file of routeFiles) {
    const routeName = file.replace('.js', '');
    const routePath = path.join(routesPath, file);
    
    try {
      const routeModule = require(routePath);
      
      if (typeof routeModule === 'function') {
        // Route module is a function that sets up routes
        routeModule(app, temporalClient);
        console.log(`[Routes] Loaded: /api/${routeName}`);
      } else if (routeModule.default && typeof routeModule.default === 'function') {
        routeModule.default(app, temporalClient);
        console.log(`[Routes] Loaded (default export): /api/${routeName}`);
      } else {
        console.warn(`[Routes] ${file} does not export a function`);
      }
    } catch (error) {
      console.error(`[Routes] Failed to load ${file}:`, error.message);
    }
  }
  
  console.log(`[Routes] Total routes loaded: ${routeFiles.length}`);
}

module.exports = { loadRoutes };
