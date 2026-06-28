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

To exercise the queue trigger locally, enqueue a JSON message like `samples/provision-project-message.json` to the `project-provisioning` queue in Azurite. The function should build a provisioning plan and log that live SharePoint writes are not implemented yet.

Run `npm run queue:sample` after Azurite and the Functions host are running to enqueue the sample message.

Use a Functions-supported Node.js version for local host testing. The current host starts under unsupported Node versions, but logs a compatibility warning.
