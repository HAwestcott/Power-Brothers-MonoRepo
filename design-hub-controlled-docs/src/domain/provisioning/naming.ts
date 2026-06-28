import { DesignRequest } from "./buildProjectPlan";

export function hasMinimumNamingInputs(request: DesignRequest): boolean {
  return Boolean(request.projectNumber);
}
