import { app, InvocationContext } from "@azure/functions";
import { buildProjectPlan, DesignRequest } from "../domain/provisioning/buildProjectPlan";
import { loadProvisioningConfig } from "../config/loadConfig";
import { getLogger } from "../telemetry/logger";

export async function provisionProject(queueItem: DesignRequest, context: InvocationContext): Promise<void> {
  const logger = getLogger(context);
  const config = loadProvisioningConfig();
  const plan = buildProjectPlan(queueItem, config);

  logger.info("Built project provisioning plan", {
    projectType: queueItem.projectType,
    distributor: queueItem.distributor ?? "default",
    folderCount: plan.folders.length,
    templateCount: plan.templates.length,
  });

  logger.warn("SharePoint folder creation and IMS template copy are not implemented yet.");
}

app.storageQueue("provisionProject", {
  queueName: process.env.PROVISIONING_QUEUE_NAME ?? "project-provisioning",
  connection: "AzureWebJobsStorage",
  handler: provisionProject,
});
