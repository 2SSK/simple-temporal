import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Auto-load all route files from routes directory
 * @param {Object} app - Express app instance
 * @param {Object} temporalClient - Temporal client manager
 */
async function loadRoutes(app, temporalClient) {
  const routesPath = __dirname;
  
  // Read all files in routes directory
  const routeFiles = fs.readdirSync(routesPath).filter(file => {
    return file.endsWith('.js') && file !== 'index.js';
  });
  
  console.log(`[Routes] Found ${routeFiles.length} route files`);
  
  // Load all routes and wait for them to complete
  const routePromises = routeFiles.map(async (file) => {
    const routeName = file.replace('.js', '');
    const routePath = path.join(routesPath, file);
    
    try {
      // Use dynamic import for ES modules
      const moduleUrl = `file://${routePath}`;
      const routeModule = await import(moduleUrl);
      
      if (routeModule.default && typeof routeModule.default === 'function') {
        routeModule.default(app, temporalClient);
        console.log(`[Routes] Loaded (default export): /api/${routeName}`);
      } else {
        console.warn(`[Routes] ${file} does not export a default function`);
      }
    } catch (error) {
      console.error(`[Routes] Failed to load ${file}:`, error.message);
    }
  });
  
  // Wait for all routes to be loaded
  await Promise.all(routePromises);
  
  console.log(`[Routes] Total routes loaded: ${routeFiles.length}`);
}

export { loadRoutes };
