const activities = require('./activities');
const workflows = require('./workflows');

module.exports = {
  activities,
  workflows,
  
  // Helper to get workflow by name
  getWorkflow(workflowName) {
    return workflows[workflowName];
  },
  
  // Helper to get activity by name
  getActivity(activityName) {
    return activities[activityName];
  },
  
  // Get all registered workflow names
  getWorkflowNames() {
    return Object.keys(workflows);
  },
  
  // Get all registered activity names
  getActivityNames() {
    return Object.keys(activities);
  }
};
