import { app, InvocationContext, Timer } from "@azure/functions";
import { getLogger } from "../telemetry/logger";

export async function pollDesignRequests(_timer: Timer, context: InvocationContext): Promise<void> {
  const logger = getLogger(context);

  logger.info("Polling Design Request list for project provisioning candidates.");
  logger.warn("SharePoint polling is not implemented yet; open decisions must be resolved first.");
}

app.timer("pollDesignRequests", {
  schedule: "0 */5 * * * *",
  handler: pollDesignRequests,
});
