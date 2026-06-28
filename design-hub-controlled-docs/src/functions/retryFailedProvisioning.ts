import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getLogger } from "../telemetry/logger";

export async function retryFailedProvisioning(_request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const logger = getLogger(context);

  logger.warn("Retry endpoint is a placeholder until provisioning status storage is implemented.");

  return {
    status: 501,
    jsonBody: {
      message: "Retry provisioning is not implemented yet.",
    },
  };
}

app.http("retryFailedProvisioning", {
  methods: ["POST"],
  authLevel: "function",
  handler: retryFailedProvisioning,
});
