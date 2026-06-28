# Design Hub Controlled Docs

- This project is for PowerBrothers Design Hub: a controlled documents, project lifecycle, and task-management system for the design team.
- V1 scope is only project provisioning: create a project folder structure and template files inside the existing Design Hub SharePoint document library.
- New projects are currently represented as subfolders under the `Projects` folder in an existing Design Hub document library; do not assume a new library/site is required.
- V1 starts from a SharePoint list form/item representing a design request.
- Required design-request fields for provisioning are project number/name, client/site, project type, and due date.
- Main V1 project types are URD, URD Masterplan, URD Stage Design, Option 2 - public lighting design, Option 1 - design, and earthing assessment.
- V1 can use the same folder structure for all project types, but keep the config model ready for project-type and distributor-specific variants.
- The power distributor can influence required output documents/templates; model distributor as an input when designing config.
- Template/folder definitions should be repo-defined config, but source template files are referenced from the existing SharePoint-hosted IMS rather than stored in this repo.
- All provisioned project folders/files live in one existing SharePoint document library unless explicitly changed.
- Existing project folder naming convention is still TBC; do not invent one as a fixed rule.
- V1 provisioning automation should be Azure Functions-based.
- V1 must inherit permissions from the target document library; do not break folder/item permission inheritance unless explicitly requested.
- No custom SharePoint UI, SPFx/PnP app, or Power BI reporting is in V1 scope.
- Design choices should keep ISO-ready document-control foundations in mind: stable IDs, controlled templates, clear auditability, and future lifecycle/review metadata.
- Future architecture may include SharePoint libraries for documents/access, SharePoint lists for data/tasks, Term Store taxonomy for search/dashboards, Azure Functions for automation, an SPFx/PnP UI, and Power BI reporting; do not implement those future pieces until asked.

## Open Decisions

- Exact existing project folder naming convention.
- Exact Design Request list name and field internal names.
- Exact target library name and `Projects` folder path.
- IMS source site/library/path for each source template.
- Whether V1 provisions immediately on item creation or only when a request reaches a ready/approved status.
- Whether distributor is required on the request form or can default initially.
