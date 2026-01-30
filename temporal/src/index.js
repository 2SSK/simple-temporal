import { default as activities } from "./activities/index.js";
import workflows from "./workflows/index.js";

export {
  activities,
  workflows,
};

export function getWorkflow(workflowName) {
  return workflows[workflowName];
}

export function getActivity(activityName) {
  return activities[activityName];
}

export function getWorkflowNames() {
  return Object.keys(workflows);
}

export function getActivityNames() {
  return Object.keys(activities);
}
