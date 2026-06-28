import { DesignRequest } from "../domain/provisioning/buildProjectPlan";
import { createGraphClient } from "./graphClient";

export type DesignRequestListItem = DesignRequest & {
  id: string;
  listItemId: string;
  createdDateTime: string;
};

export async function getProvisioningCandidates(): Promise<DesignRequestListItem[]> {
  const graph = createGraphClient();
  const siteId = await getDesignSiteId();
  const listId = process.env.DESIGN_REQUEST_LIST_ID ?? "b39d089f-ae56-4812-8fd6-ed46fff42fad";
  const lookbackMinutes = Number(process.env.PROVISION_LOOKBACK_MINUTES ?? "60");
  const createdAfter = Date.now() - lookbackMinutes * 60 * 1000;
  const response = await graph.get<GraphListItemsResponse>(
    `/sites/${siteId}/lists/${listId}/items?$top=25&$orderby=createdDateTime desc&$expand=fields`,
  );

  return response.value
    .filter((item) => new Date(item.createdDateTime).getTime() >= createdAfter)
    .filter((item) => !String(item.fields.ProjectFolder ?? "").trim())
    .filter((item) => Boolean(item.fields.ProjectNumber))
    .map((item) => ({
      id: item.id,
      listItemId: item.id,
      createdDateTime: item.createdDateTime,
      projectNumber: String(item.fields.ProjectNumber),
      projectName: String(item.fields.Title ?? "").trim(),
      clientOrSite: stringOrUndefined(item.fields.SiteAddress),
      projectType: normaliseDesignType(String(item.fields.DesignType ?? "")),
      dueDate: stringOrUndefined(item.fields.DueDate),
      distributor: stringOrUndefined(item.fields.DNSP),
    }));
}

export async function updateProvisionedProjectFolder(listItemId: string, folderUrl: string): Promise<void> {
  const graph = createGraphClient();
  const siteId = await getDesignSiteId();
  const listId = process.env.DESIGN_REQUEST_LIST_ID ?? "b39d089f-ae56-4812-8fd6-ed46fff42fad";

  await graph.patch(`/sites/${siteId}/lists/${listId}/items/${listItemId}/fields`, {
    ProjectFolder: folderUrl,
  });
}

export async function getDesignSiteId(): Promise<string> {
  const graph = createGraphClient();
  const hostName = process.env.DESIGN_HUB_HOSTNAME ?? "wellsfordau.sharepoint.com";
  const sitePath = process.env.DESIGN_HUB_SITE_PATH ?? "/sites/Design";
  const site = await graph.get<{ id: string }>(`/sites/${hostName}:${sitePath}`);

  return site.id;
}

function normaliseDesignType(designType: string): string {
  const key = designType.trim().toLowerCase();
  const map: Record<string, string> = {
    "option 2 masterplan design": "urd-masterplan",
    "option 2 detailed design": "urd-stage-design",
    "option 2 public lighting": "option-2-public-lighting-design",
    "option 1 design": "option-1-design",
    urd: "urd",
    "urd masterplan": "urd-masterplan",
    "urd stage design": "urd-stage-design",
    "earthing assessment": "earthing-assessment",
  };

  return map[key] ?? key.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function stringOrUndefined(value: unknown): string | undefined {
  const text = String(value ?? "").trim();

  return text ? text : undefined;
}

type GraphListItemsResponse = {
  value: Array<{
    id: string;
    createdDateTime: string;
    fields: Record<string, unknown>;
  }>;
};
