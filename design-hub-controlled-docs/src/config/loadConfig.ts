import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

type ProjectTypeConfig = {
  id: string;
  displayName: string;
  folderStructure: string;
  templateSet: string;
  distributorOverrides: boolean;
};

type FolderStructureConfig = {
  id: string;
  folders: Array<{ path: string }>;
};

type TemplateSetConfig = {
  id: string;
  templates: Array<{
    templateKey: string;
    targetPath: string;
  }>;
};

type TemplateManifest = {
  templates: Record<
    string,
    {
      source: {
        sitePath: string;
        library: string;
        path: string;
      };
    }
  >;
};

export type ProvisioningConfig = {
  projectTypes: Record<string, ProjectTypeConfig>;
  folderStructures: Record<string, FolderStructureConfig>;
  templateSets: Record<string, TemplateSetConfig>;
  templates: Record<string, { sitePath: string; library: string; path: string }>;
};

export function loadProvisioningConfig(configRoot = path.resolve(process.cwd(), "config")): ProvisioningConfig {
  const projectTypes = loadConfigDirectory<ProjectTypeConfig>(path.join(configRoot, "project-types"));
  const folderStructures = loadConfigDirectory<FolderStructureConfig>(path.join(configRoot, "folder-structures"));
  const templateSets = loadConfigDirectory<TemplateSetConfig>(path.join(configRoot, "template-sets"));
  const templateManifest = loadYaml<TemplateManifest>(path.join(configRoot, "templates", "ims-template-manifest.yaml"));

  return {
    projectTypes: indexById(projectTypes),
    folderStructures: indexById(folderStructures),
    templateSets: indexById(templateSets),
    templates: Object.fromEntries(
      Object.entries(templateManifest.templates).map(([key, value]) => [key, value.source]),
    ),
  };
}

function loadConfigDirectory<T>(directoryPath: string): T[] {
  return fs
    .readdirSync(directoryPath)
    .filter((fileName) => fileName.endsWith(".yaml") || fileName.endsWith(".yml"))
    .map((fileName) => loadYaml<T>(path.join(directoryPath, fileName)));
}

function loadYaml<T>(filePath: string): T {
  return yaml.load(fs.readFileSync(filePath, "utf8")) as T;
}

function indexById<T extends { id: string }>(items: T[]): Record<string, T> {
  return Object.fromEntries(items.map((item) => [item.id, item]));
}
