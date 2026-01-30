import express from "express";
import dotenv from "dotenv";
import { Client, Connection } from "@temporalio/client";
dotenv.config();

const app = express();
app.use(express.json());

let temporalClient;
async function getTemporalClient() {
  if (!temporalClient) {
    const connection = await Connection.connect({
      address: process.env.TEMPORAL_ADDRESS || "localhost:7233",
    });
    temporalClient = new Client({
      connection,
      namespace: process.env.TEMPORAL_NAMESPACE || "default",
    });
  }
  return temporalClient;
}

app.get("/", (req, res) => {
  res.json({ status: "Server is running" });
});

app.post("/greet", async (req, res) => {
  const { name } = req.body || req.query;
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }
  try {
    const client = await getTemporalClient();
    const workflow = await client.workflow.start("GreetWorkflow", {
      workflowId: `greet-${Date.now()}`,
      taskQueue: process.env.GREET_QUEUE || "greet_queue",
      args: [{ name }],
    });
    const result = await workflow.result();
    res.json({ greeting: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
