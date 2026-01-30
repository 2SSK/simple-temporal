const fs = require('fs');
const path = require('path');

/**
 * Auto-load all controller files from controllers directory
 * @returns {Object} Object with all loaded controllers
 */
function loadControllers() {
  const controllersPath = __dirname;
  
  const controllers = {};
  
  const controllerFiles = fs.readdirSync(controllersPath).filter(file => {
    return file.endsWith('.js') && file !== 'index.js';
  });
  
  for (const file of controllerFiles) {
    const controllerName = file.replace('.js', '').replace('Controller', '').toLowerCase();
    const controllerPath = path.join(controllersPath, file);
    
    try {
      const controllerModule = require(controllerPath);
      
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

module.exports = { loadControllers };
