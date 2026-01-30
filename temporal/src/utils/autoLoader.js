/**
 * Auto-load utility for discovering and loading modules
 * @param {string} basePath - Base directory path
 * @param {string} subDir - Subdirectory to scan
 * @param {string} filePattern - File pattern to match
 * @returns {Object} Object with all loaded modules
 */
function autoLoadModules(basePath, subDir, filePattern = /\.js$/) {
  const modules = {};
  const fullPath = require('path').join(basePath, subDir);
  
  const fs = require('fs');
  
  if (!fs.existsSync(fullPath)) {
    console.warn(`[AutoLoader] Directory not found: ${fullPath}`);
    return modules;
  }
  
  const entries = fs.readdirSync(fullPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullEntryPath = require('path').join(fullPath, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively load from subdirectories
      const subModules = autoLoadModules(fullPath, entry.name, filePattern);
      Object.assign(modules, subModules);
    } else if (entry.isFile() && filePattern.test(entry.name)) {
      // Skip index files in auto-loading
      if (entry.name === 'index.js') continue;
      
      // Load the module
      const moduleName = entry.name.replace('.js', '');
      const modulePath = require('path').join(subDir, entry.name);
      
      try {
        const module = require(modulePath);
        
        // Handle default exports
        if (module && module.default) {
          modules[moduleName] = module.default;
        } else {
          modules[moduleName] = module;
        }
        
        console.log(`[AutoLoader] Loaded: ${moduleName}`);
      } catch (error) {
        console.error(`[AutoLoader] Failed to load ${modulePath}:`, error.message);
      }
    }
  }
  
  return modules;
}

module.exports = { autoLoadModules };
