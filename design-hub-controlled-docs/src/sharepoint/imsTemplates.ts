import { createGraphClient } from "./graphClient";
import { resolveDriveByName } from "./libraries";

export async function resolveTemplateDrive(sitePath: string, libraryName: string): Promise<string> {
  const graph = createGraphClient();
  const hostName = "wellsfordau.sharepoint.com";
  const site = sitePath === "/"
    ? await graph.get<{ id: string }>(`/sites/${hostName}:/`)
    : await graph.get<{ id: string }>(`/sites/${hostName}:${sitePath}`);
  const drive = await resolveDriveByName(site.id, libraryName);

  return drive.id;
}
