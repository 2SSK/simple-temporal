const path = require('path');
const { autoLoadModules } = require('../utils/autoLoader');

// Auto-load all activities from subdirectories
const activitiesDir = path.join(__dirname, 'activities');

const allActivities = autoLoadModules(__dirname, 'activities', /\.js$/);

// Export activities object for Temporal worker
module.exports = allActivities;

// Also export individual activities for direct access
Object.keys(allActivities).forEach(key => {
  module.exports[key] = allActivities[key];
});

console.log(`[Activities] Total activities loaded: ${Object.keys(allActivities).length}`);
