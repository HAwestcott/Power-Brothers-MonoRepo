import { ProvisioningConfig } from "../../config/loadConfig";

export type DesignRequest = {
  projectNumber?: string;
  projectName?: string;
  clientOrSite?: string;
  projectType: string;
  dueDate?: string;
  distributor?: string;
};

export type ProjectPlan = {
  projectFolderName: string;
  folders: string[];
  templates: Array<{
    templateKey: string;
    source: {
      sitePath: string;
      library: string;
      path: string;
    };
    targetPath: string;
  }>;
};

export function buildProjectPlan(request: DesignRequest, config: ProvisioningConfig): ProjectPlan {
  const projectType = config.projectTypes[request.projectType];

  if (!projectType) {
    throw new Error(`Unknown project type: ${request.projectType}`);
  }

  const folderStructure = config.folderStructures[projectType.folderStructure];

  if (!folderStructure) {
    throw new Error(`Unknown folder structure: ${projectType.folderStructure}`);
  }

  const templateSet = config.templateSets[projectType.templateSet];

  if (!templateSet) {
    throw new Error(`Unknown template set: ${projectType.templateSet}`);
  }

  return {
    projectFolderName: resolveProjectFolderName(request),
    folders: folderStructure.folders.map((folder) => folder.path),
    templates: templateSet.templates.map((template) => {
      const source = config.templates[template.templateKey];

      if (!source) {
        throw new Error(`Unknown template key: ${template.templateKey}`);
      }

      return {
        templateKey: template.templateKey,
        source,
        targetPath: template.targetPath,
      };
    }),
  };
}

function resolveProjectFolderName(request: DesignRequest): string {
  if (request.projectNumber && request.projectName) {
    return `${request.projectNumber} - ${request.projectName}`;
  }

  if (request.projectNumber) {
    return request.projectNumber;
  }

  throw new Error("Project folder naming convention is TBC and needs at least a project number for now.");
}
