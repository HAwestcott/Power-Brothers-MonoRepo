import path from "node:path";
import { createGraphClient, encodeDrivePath } from "./graphClient";

export async function ensureFolderPath(driveId: string, folderPath: string): Promise<DriveItem> {
  const graph = createGraphClient();
  const segments = folderPath.split("/").filter(Boolean);
  let currentPath = "";
  let currentItem: DriveItem | undefined;

  for (const segment of segments) {
    const nextPath = path.posix.join(currentPath, segment);
    currentItem = await getFolderByPath(driveId, nextPath);

    if (!currentItem) {
      currentItem = await graph.post<DriveItem>(
        currentPath
          ? `/drives/${driveId}/root:/${encodeDrivePath(currentPath)}:/children`
          : `/drives/${driveId}/root/children`,
        {
          name: segment,
          folder: {},
          "@microsoft.graph.conflictBehavior": "fail",
        },
      );
    }

    currentPath = nextPath;
  }

  if (!currentItem) {
    throw new Error("Cannot ensure an empty folder path.");
  }

  return currentItem;
}

async function getFolderByPath(driveId: string, folderPath: string): Promise<DriveItem | undefined> {
  const graph = createGraphClient();

  try {
    return await graph.get<DriveItem>(`/drives/${driveId}/root:/${encodeDrivePath(folderPath)}`);
  } catch (error) {
    if (String(error).includes("404")) {
      return undefined;
    }

    throw error;
  }
}

export type DriveItem = {
  id: string;
  name: string;
  webUrl: string;
};
