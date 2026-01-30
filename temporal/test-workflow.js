import { getTemporalClient } from "./client.js";

async function testGreetWorkflow() {
  try {
    const client = await getTemporalClient();
    
    const result = await client.workflow.start({
      workflowId: `greet-workflow-${Date.now()}`,
      taskQueue: "default",
      workflowName: "greetWorkflow",
      args: ["Temporal User"]
    });
    
    console.log("Workflow started with ID:", result.workflowId);
    console.log("Waiting for result...");
    
    const workflowResult = await result.result();
    console.log("Workflow result:", workflowResult);
    
  } catch (error) {
    console.error("Error executing workflow:", error);
  }
}

testGreetWorkflow();