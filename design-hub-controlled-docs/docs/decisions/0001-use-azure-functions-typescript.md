# 0001 Use Azure Functions With TypeScript

## Decision

Use Azure Functions with the Node.js/TypeScript v4 programming model for V1 provisioning automation.

## Rationale

- Fits config-driven SharePoint automation.
- Has first-class Azure Functions CLI support.
- Aligns with future SPFx/PnP TypeScript work.
- Keeps queue/timer/http function boundaries simple.

## Consequences

- The app uses the Azure Functions Core Tools TypeScript scaffold shape.
- SharePoint integration should be isolated in `src/sharepoint`.
- Function entrypoints should delegate business decisions to `src/domain`.
