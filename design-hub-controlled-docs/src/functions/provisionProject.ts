import { app, InvocationContext } from "@azure/functions";
import { buildProjectPlan, DesignRequest } from "../domain/provisioning/buildProjectPlan";
import { loadProvisioningConfig } from "../config/loadConfig";
import { updateProvisionedProjectFolder, getDesignSiteId } from "../sharepoint/designRequests";
import { copyFileFromDrivePath } from "../sharepoint/files";
import { ensureFolderPath } from "../sharepoint/folders";
import { resolveTemplateDrive } from "../sharepoint/imsTemplates";
import { resolveDriveByName } from "../sharepoint/libraries";
import { getLogger } from "../telemetry/logger";

type ProvisioningQueueItem = DesignRequest & {
  listItemId?: string;
};

export async function provisionProject(queueItem: ProvisioningQueueItem, context: InvocationContext): Promise<void> {
  const logger = getLogger(context);
  const config = loadProvisioningConfig();
  const plan = buildProjectPlan(queueItem, config);
  const siteId = await getDesignSiteId();
  const targetLibraryName = process.env.TARGET_LIBRARY_NAME ?? "Documents";
  const projectsFolderPath = process.env.PROJECTS_FOLDER_PATH ?? "01 Projects";
  const targetDrive = await resolveDriveByName(siteId, targetLibraryName);
  const projectRootPath = `${projectsFolderPath}/${plan.projectFolderName}`;
  const projectFolder = await ensureFolderPath(targetDrive.id, projectRootPath);

  logger.info("Built project provisioning plan", {
    projectType: queueItem.projectType,
    distributor: queueItem.distributor ?? "default",
    folderCount: plan.folders.length,
    templateCount: plan.templates.length,
  });

  for (const folder of plan.folders) {
    await ensureFolderPath(targetDrive.id, `${projectRootPath}/${folder}`);
  }

  for (const template of plan.templates.filter((item) => isResolvedTemplate(item.source))) {
    const sourceDriveId = await resolveTemplateDrive(template.source.sitePath, template.source.library);

    await copyFileFromDrivePath({
      sourceDriveId,
      sourcePath: template.source.path,
      targetDriveId: targetDrive.id,
      targetPath: `${projectRootPath}/${template.targetPath}`,
    });
  }

  if (queueItem.listItemId) {
    try {
      await updateProvisionedProjectFolder(queueItem.listItemId, projectFolder.webUrl);
    } catch (error) {
      logger.warn("Project folder was provisioned, but updating ProjectFolder failed", { error: String(error) });
    }
  }

  logger.info("Project provisioning completed", {
    projectFolderName: plan.projectFolderName,
    projectFolderUrl: projectFolder.webUrl,
  });
}

function isResolvedTemplate(source: { library: string; path: string }): boolean {
  return source.library !== "TBC" && !source.path.startsWith("TBC/");
}

app.storageQueue("provisionProject", {
  queueName: process.env.PROVISIONING_QUEUE_NAME ?? "project-provisioning",
  connection: "AzureWebJobsStorage",
  handler: provisionProject,
});
