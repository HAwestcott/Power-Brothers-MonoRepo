import { createGraphClient } from "./graphClient";

export async function resolveDriveByName(siteId: string, libraryName: string): Promise<Drive> {
  const graph = createGraphClient();
  const drives = await graph.get<{ value: Drive[] }>(`/sites/${siteId}/drives`);
  const drive = drives.value.find(
    (item) =>
      item.name === libraryName ||
      item.webUrl.endsWith(`/${encodeURIComponent(libraryName)}`) ||
      item.webUrl.endsWith(`/${libraryName.split(" ").join("%20")}`),
  );

  if (!drive) {
    throw new Error(`Could not resolve document library drive: ${libraryName}`);
  }

  return drive;
}

export type Drive = {
  id: string;
  name: string;
  webUrl: string;
};
