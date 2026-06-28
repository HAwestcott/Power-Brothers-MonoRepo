# SharePoint Model

## Known

- Existing Design Hub `Documents` library (`Shared Documents`) contains the parent folder `01 Projects`.
- New project work is provisioned as subfolders under `Shared Documents/01 Projects`.
- Source templates are controlled in an existing SharePoint-hosted IMS.
- V1 inherits target library permissions.
- Design Hub site URL is `https://wellsfordau.sharepoint.com/sites/Design`.
- Design Request list display name is `Design Hub`.
- Design Request list ID is `b39d089f-ae56-4812-8fd6-ed46fff42fad`.
- V1 provisions immediately when the Design Request list item is created.
- Project folder naming convention is `{ProjectNumber} - {ProjectName}`, for example `PB260233 - SHL001 C2 JAN 2026`.
- Project numbers use a `PB` prefix and `YYMM##` style format.
- V1 does not need custom folder-name sanitisation beyond SharePoint restrictions.
- Example IMS template source: `Shared Documents/1 IMS/005 Forms/PB-IMS-F-065 Safety in Design.xlsm`.
- The Safety in Design checklist is copied to `05 Safety in Design/PB-IMS-F-065 Safety in Design.xlsm`.
- Target document library ID is `ce006cf3-0bd6-4b51-b709-f14454e0a545`.
- Target parent folder is `01 Projects`, resolved from sharing link to `https://wellsfordau.sharepoint.com/sites/Design/Shared%20Documents/01%20Projects`.

## Design Request Fields

- Project number: `ProjectNumber`.
- Project name/title: `Title`.
- Site/client address: `SiteAddress`.
- Project type: `DesignType`.
- Due date: `DueDate`.
- Distributor/DNSP: `DNSP`.
- Status: `Status`.
- Project folder URL/reference: `ProjectFolder`.
- Designer: `Designer`.
- Checker/approver: `DesignChecker_x002f_Approver`.
- Project manager: `ProjectManager`.
- Planner: `Planner`.
- Request text: `DesignRequestText`.

## To Confirm

- Design Request field internal names.
- IMS site/library/path for each remaining source template.
- Whether `ProjectFolder` is the correct field to update with the provisioned folder URL.
