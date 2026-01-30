import { proxyActivities } from "@temporalio/workflow";

const activities = proxyActivities({
  startToCloseTimeout: "30 seconds",
});

export async function farewellWorkflow(name) {
  return await activities.farewell(name);
}