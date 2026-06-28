const fs = require("node:fs");
const path = require("node:path");
const { QueueServiceClient } = require("@azure/storage-queue");

const queueName = process.env.PROVISIONING_QUEUE_NAME || "project-provisioning";
const connectionString = process.env.AzureWebJobsStorage || "UseDevelopmentStorage=true";
const samplePath = path.resolve(__dirname, "..", "samples", "provision-project-message.json");
const message = fs.readFileSync(samplePath, "utf8");

async function main() {
  const queueServiceClient = QueueServiceClient.fromConnectionString(connectionString);
  const queueClient = queueServiceClient.getQueueClient(queueName);

  await queueClient.createIfNotExists();
  await queueClient.sendMessage(Buffer.from(message).toString("base64"));

  console.log(`Queued ${samplePath} to ${queueName}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
