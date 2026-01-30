import { NativeConnection, Worker } from "@temporalio/worker";
async function run() {
  const connection = await NativeConnection.connect({
    address: process.env.TEMPORAL_ADDRESS || "localhost:7233",
  });
  const worker = await Worker.create({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE || "default",
    taskQueue: process.env.GREET_QUEUE || "greet_queue",
    workflowsPath: require.resolve("./temporal/src/greet/workflow.js"),
    activities: require("./temporal/src/greet/activities.js"),
  });
  console.log("Worker started");
  await worker.run();
}
run().catch((err) => {
  console.error(err);
  process.exit(1);
});
