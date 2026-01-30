const path = require('path');
const { autoLoadModules } = require('../utils/autoLoader');

// Auto-load all workflows from subdirectories
const workflowsDir = path.join(__dirname, 'workflows');

const allWorkflows = autoLoadModules(__dirname, 'workflows', /\.js$/);

// Export workflows object for Temporal worker
module.exports = allWorkflows;

// Also export individual workflows for direct access
Object.keys(allWorkflows).forEach(key => {
  module.exports[key] = allWorkflows[key];
});

console.log(`[Workflows] Total workflows loaded: ${Object.keys(allWorkflows).length}`);
