import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Auto-load all controller files from controllers directory
 * @returns {Object} Object with all loaded controllers
 */
async function loadControllers() {
  const controllersPath = __dirname;
  
  const controllers = {};
  
  const controllerFiles = fs.readdirSync(controllersPath).filter(file => {
    return file.endsWith('.js') && file !== 'index.js';
  });
  
  for (const file of controllerFiles) {
    const controllerName = file.replace('.js', '').replace('Controller', '').toLowerCase();
    const controllerPath = path.join(controllersPath, file);
    
    try {
      // Use dynamic import for ES modules
      const moduleUrl = `file://${controllerPath}`;
      const controllerModule = await import(moduleUrl);
      
      // Handle default exports
      if (controllerModule && controllerModule.default) {
        controllers[controllerName] = controllerModule.default;
      } else {
        controllers[controllerName] = controllerModule;
      }
      
      console.log(`[Controllers] Loaded: ${controllerName}`);
    } catch (error) {
      console.error(`[Controllers] Failed to load ${file}:`, error.message);
    }
  }
  
  console.log(`[Controllers] Total controllers loaded: ${Object.keys(controllers).length}`);
  return controllers;
}

export { loadControllers };
