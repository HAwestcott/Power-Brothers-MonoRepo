export type DesignRequestListItem = {
  id: string;
  fields: Record<string, unknown>;
};

export async function getProvisioningCandidates(): Promise<DesignRequestListItem[]> {
  throw new Error("Design Request list access is not implemented yet.");
}
