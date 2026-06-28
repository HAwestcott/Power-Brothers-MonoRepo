import path from "node:path";
import { createGraphClient, encodeDrivePath } from "./graphClient";
import { ensureFolderPath } from "./folders";

export async function copyFileFromDrivePath(options: {
  sourceDriveId: string;
  sourcePath: string;
  targetDriveId: string;
  targetPath: string;
}): Promise<void> {
  const graph = createGraphClient();
  const targetFolderPath = path.posix.dirname(options.targetPath);
  const targetFileName = path.posix.basename(options.targetPath);
  const targetFolder = await ensureFolderPath(options.targetDriveId, targetFolderPath);
  const content = await graph.getContent(
    `/drives/${options.sourceDriveId}/root:/${encodeDrivePath(options.sourcePath)}:/content`,
  );

  await graph.putContent(
    `/drives/${options.targetDriveId}/items/${targetFolder.id}:/${encodeURIComponent(targetFileName)}:/content`,
    content,
  );
}
