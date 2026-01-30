import { OrderProcessingWorkflow } from "./order/workflow.js";
import { UserRegistrationWorkflow } from "./user/workflow.js";

const allWorkflows = {
  OrderProcessingWorkflow,
  UserRegistrationWorkflow,
};

export default allWorkflows;

console.log("[Workflows] Total workflows loaded:", Object.keys(allWorkflows).length);
