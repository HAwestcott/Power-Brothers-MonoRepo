# Architecture

V1 is a config-driven Azure Functions app. SharePoint remains the operational source of truth.

```text
Design Request list item
-> pollDesignRequests timer function
-> project-provisioning queue
-> provisionProject queue function
-> Design Hub document library / Projects / <project folder>
-> IMS source templates copied into target folders
```

The Function entrypoints should stay thin. Provisioning decisions belong in `src/domain/provisioning`; SharePoint API calls belong in `src/sharepoint`.

Use repo-defined YAML config for project types, folder structures, template sets, distributor overrides, and IMS template references.
