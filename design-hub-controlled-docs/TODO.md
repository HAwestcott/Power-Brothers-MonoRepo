# TODO

## Before Continuous Polling

- Add provisioning state fields to the `Design Hub` SharePoint list or confirm existing fields to reuse:
  - `ProvisioningStatus` with values such as `Not Started`, `Queued`, `Provisioning`, `Provisioned`, `Failed`.
  - `ProvisioningRunId`.
  - `ProvisionedFolderDriveItemId`.
  - `ProvisionedAt`.
  - `ProvisioningError`.
- Make the poller claim work before queueing it:
  - only queue items with empty `ProjectFolder` and no active provisioning state;
  - set `ProvisioningStatus = Queued` and a new `ProvisioningRunId` before sending the queue message.
- Make the worker re-read the list item before provisioning and skip stale messages if:
  - `ProjectFolder` is already populated;
  - the `ProvisioningRunId` no longer matches;
  - status is already `Provisioned`.
- Update provisioning status through the lifecycle:
  - `Queued` -> `Provisioning` -> `Provisioned` or `Failed`.
- Fix updating the `ProjectFolder` hyperlink field. Current Graph PATCH with a plain URL returns `400 Bad Request`; likely needs SharePoint hyperlink field shape such as `{ Url, Description }` or a different API path.

## Provisioning Behaviour

- Decide whether an existing deterministic folder path should always be treated as success or whether mismatched existing content should fail the run.
- Decide whether template copies should skip, overwrite, or version existing files.
- Keep folder creation deterministic: `01 Projects/{ProjectNumber} - {Title}`.
- Confirm whether `ProjectNumber` should ever be parsed/normalised when users enter extra text.

## SharePoint Model

- Confirm whether `ProjectFolder` is the correct long-term field for the provisioned folder URL.
- Add/confirm source IMS paths for remaining templates currently marked `TBC`.
- Confirm whether `DNSP` should be required for provisioning.
- Confirm if additional project types such as earthing assessment need different folder/template config.

## Local/Runtime

- Use a Functions-supported Node.js version locally; Node v25 currently starts with warnings.
- Avoid leaving the timer host running against live SharePoint until idempotency state fields are implemented.
- Keep `PROVISION_LOOKBACK_MINUTES=0` for explicit queue-only testing; only raise it when intentionally testing form-triggered polling.
