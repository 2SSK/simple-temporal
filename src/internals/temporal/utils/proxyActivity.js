import { proxyActivities } from "@temporalio/workflow";

const DEFAULT_RETRY_POLICY = {
  initialInterval: "10s",
  maximumInterval: "2m",
  backoffCoefficient: 1.5,
  maximumAttempts: 10,
};

const DEFAULT_TIMEOUT = "10s";

export async function executeActivity(activityName, args = [], options = {}) {
  const {
    timeout = DEFAULT_TIMEOUT,
    retry = DEFAULT_RETRY_POLICY,
    errorHandlerActivity,
    errorContext = {},
  } = options;

  const activities = proxyActivities({
    startToCloseTimeout: timeout,
    retry,
  });

  try {
    // Ensure args is an array for spreading
    const argsArray = Array.isArray(args) ? args : [args];
    return await activities[activityName](...argsArray);
  } catch (error) {
    if (errorHandlerActivity) {
      await activities[errorHandlerActivity]({
        activityName,
        args,
        error: error.message,
        ...errorContext,
      }).catch(() => {});
    }
    throw error;
  }
}
