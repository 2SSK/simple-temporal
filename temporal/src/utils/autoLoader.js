/**
 * Auto-load utility for discovering and loading modules
 * @param {string} basePath - Base directory path
 * @param {string} subDir - Subdirectory to scan
 * @param {string} filePattern - File pattern to match
 * @returns {Object} Object with all loaded modules
 */
import path from "path";
import fs from "fs";

export async function autoLoadModules(basePath, subDir, filePattern = /\.js$/) {
  const modules = {};
  const fullPath = path.join(basePath, subDir);

  if (!fs.existsSync(fullPath)) {
    console.warn(`[AutoLoader] Directory not found: ${fullPath}`);
    return modules;
  }

  const entries = fs.readdirSync(fullPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullEntryPath = path.join(fullPath, entry.name);

    if (entry.isDirectory()) {
      // Recursively load from subdirectories
      const subModules = await autoLoadModules(fullPath, entry.name, filePattern);
      Object.assign(modules, subModules);
    } else if (entry.isFile() && filePattern.test(entry.name)) {
      // Skip index files in auto-loading
      if (entry.name === "index.js") continue;

      // Load module
      const moduleName = entry.name.replace(".js", "");

      try {
        // Use dynamic import for ES modules
        const moduleUrl = `file://${fullEntryPath}`;
        const module = await import(moduleUrl);

        // Handle default exports
        if (module && module.default) {
          modules[moduleName] = module.default;
        } else {
          modules[moduleName] = module;
        }

        console.log(`[AutoLoader] Loaded: ${moduleName}`);
      } catch (error) {
        console.error(
          `[AutoLoader] Failed to load ${fullEntryPath}:`,
          error.message,
        );
      }
    }
  }

  return modules;
}