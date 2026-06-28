import { describe, expect, it } from "vitest";
import { buildProjectPlan } from "../../src/domain/provisioning/buildProjectPlan";
import { loadProvisioningConfig } from "../../src/config/loadConfig";

describe("buildProjectPlan", () => {
  it("builds the standard project plan for URD", () => {
    const config = loadProvisioningConfig();
    const plan = buildProjectPlan(
      {
        projectNumber: "P-001",
        projectName: "Example Project",
        clientOrSite: "Example Site",
        projectType: "urd",
        dueDate: "2026-07-01",
      },
      config,
    );

    expect(plan.projectFolderName).toBe("P-001 - Example Project");
    expect(plan.folders).toContain("01 Scope Docs");
    expect(plan.templates.length).toBeGreaterThan(0);
  });
});
