import { proxyActivities } from "@temporalio/workflow";
const activities = proxyActivities({
  startToCloseTimeout: "30 seconds",
});
export async function GreetWorkflow({ name }) {
  return await activities.greet({ name });
}
