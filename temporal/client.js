import { Connection, Client } from "@temporalio/client";
import { temporal } from "./utils/config";

let client = null;

async function getTemporalClient() {
  if (!client) {
    const connection = await Connection.connect({
      address: temporal.address,
    });
    client = new Client({ connection });
  }
  return client;
}

export default { getTemporalClient };
