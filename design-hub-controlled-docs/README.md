# Design Hub Controlled Docs

Azure Functions automation for provisioning Design Hub project folders and IMS-controlled templates in SharePoint.

## V1 Scope

- Poll or receive SharePoint Design Request items.
- Create a project folder under the existing Design Hub document library `Projects` folder.
- Create the configured folder structure.
- Copy configured source templates from the existing SharePoint-hosted IMS.
- Leave permissions inherited from the target library.

## Commands

- `npm install` - install dependencies.
- `npm run build` - compile TypeScript.
- `npm run typecheck` - compile-check without emit.
- `npm test` - run unit tests.
- `npm run start:azurite` - start the local Azure Storage emulator required by queue/timer functions.
- `npm start` - build and start the Azure Functions host.

## Local Setup

Copy `local.settings.json.example` to `local.settings.json` and fill in the TBC SharePoint values before implementing live SharePoint calls.

For the current scaffold, the SharePoint calls are placeholders. A local smoke test can verify config loading, TypeScript compilation, function startup, and queue-trigger wiring, but it will not create SharePoint folders yet.

1. Run `npm install`.
2. Run `npm run typecheck`.
3. Run `npm test`.
4. In one terminal, run `npm run start:azurite`.
5. In another terminal, run `npm start`.

To exercise the queue trigger locally, enqueue a JSON message like `samples/provision-project-message.json` to the `project-provisioning` queue in Azurite. The function creates the configured folder structure under `Shared Documents/01 Projects` and copies resolved IMS templates.

Run `npm run queue:sample` after Azurite and the Functions host are running to enqueue the sample message.

Use a Functions-supported Node.js version for local host testing. The current host starts under unsupported Node versions, but logs a compatibility warning.

Set `PROVISION_LOOKBACK_MINUTES=0` locally if you only want to test explicit queue messages and avoid polling recent Design Request items.

## SharePoint Discovery

Use `scripts/discover-sharepoint.ps1` after creating a PnP-compatible Entra app registration. The script signs in with device login and prints the Design Request fields and visible document libraries.

```powershell
pwsh ./scripts/discover-sharepoint.ps1 -ClientId "<app-client-id>"
```

The script defaults to tenant `wellsfordau.onmicrosoft.com`; pass `-Tenant` if that needs to change.

If device login fails, try browser-based interactive auth:

```powershell
pwsh ./scripts/discover-sharepoint.ps1 -ClientId "<app-client-id>" -AuthMode Interactive
```

Do not put client secrets in commands or source files. If a client secret is required for a temporary discovery test, set `ENTRAID_CLIENT_SECRET` in the shell or let the script prompt for it:

```powershell
pwsh ./scripts/discover-sharepoint.ps1 -ClientId "<app-client-id>" -UseClientSecret
```

If PnP client-secret auth fails, use the Graph discovery script with Graph application permissions:

```powershell
pwsh ./scripts/discover-sharepoint-graph.ps1 -ClientId "<app-client-id>"
```

To resolve the known `Projects` folder sharing link at the same time:

```powershell
pwsh ./scripts/discover-sharepoint-graph.ps1 -ClientId "<app-client-id>" -ProjectsFolderSharingUrl "<folder-sharing-url>"
```
