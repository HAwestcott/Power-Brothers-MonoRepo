import { app, InvocationContext, Timer } from "@azure/functions";
import { QueueServiceClient } from "@azure/storage-queue";
import { getProvisioningCandidates } from "../sharepoint/designRequests";
import { getLogger } from "../telemetry/logger";

export async function pollDesignRequests(_timer: Timer, context: InvocationContext): Promise<void> {
  const logger = getLogger(context);
  const candidates = await getProvisioningCandidates();
  const queueName = process.env.PROVISIONING_QUEUE_NAME ?? "project-provisioning";
  const connectionString = process.env.AzureWebJobsStorage ?? "UseDevelopmentStorage=true";
  const queueClient = QueueServiceClient.fromConnectionString(connectionString).getQueueClient(queueName);

  await queueClient.createIfNotExists();

  for (const candidate of candidates) {
    await queueClient.sendMessage(Buffer.from(JSON.stringify(candidate)).toString("base64"));
  }

  logger.info("Queued Design Request provisioning candidates", { count: candidates.length });
}

app.timer("pollDesignRequests", {
  schedule: "0 */5 * * * *",
  handler: pollDesignRequests,
});
