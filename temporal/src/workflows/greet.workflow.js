import { proxyActivities } from "@temporalio/workflow";

const activities = proxyActivities({
  startToCloseTimeout: "30 seconds",
});

export async function greetWorkflow(name) {
  return await activities.greet(name);
}
