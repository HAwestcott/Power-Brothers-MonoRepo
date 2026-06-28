# Provisioning Flow

1. A SharePoint form creates a Design Request list item.
2. `pollDesignRequests` finds items that are ready for provisioning.
3. The poller queues a compact provisioning job.
4. `provisionProject` loads config and builds a provisioning plan.
5. The worker creates missing folders under the project folder.
6. The worker copies template files from the SharePoint-hosted IMS into the project folder.
7. The worker updates the Design Request item with status, target URL, and errors.

The queue worker currently creates folders and copies templates with resolved IMS source paths. Template entries still marked `TBC` are skipped until their IMS source paths are confirmed.
