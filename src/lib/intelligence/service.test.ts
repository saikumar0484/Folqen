import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { intelligenceAgents, intelligenceWorkflows } from "./agents";
import { resolveIntelligenceMutationAccess } from "./api-handler";
import { getIntelligenceProviderStatus } from "./providers";
import { createIntelligenceContentPackage, runIntelligenceWorkflow } from "./service";

const adminUser = {
  id: "admin-1",
  email: "admin@example.com",
  name: "Admin",
  role: "ADMIN" as const,
};

const viewerUser = {
  id: "viewer-1",
  email: "viewer@example.com",
  name: "Viewer",
  role: "VIEWER" as const,
};

describe("Folqen intelligence departments", () => {
  it("defines all requested Research and Content agents", () => {
    assert.equal(intelligenceAgents.length, 11);
    assert.equal(intelligenceAgents.filter((agent) => agent.departmentId === "research").length, 5);
    assert.equal(intelligenceAgents.filter((agent) => agent.departmentId === "content").length, 6);
    assert.equal(intelligenceAgents.some((agent) => agent.id === "trend-research-agent"), true);
    assert.equal(intelligenceAgents.some((agent) => agent.id === "metadata-optimization-agent"), true);
  });

  it("defines all requested intelligence workflows", () => {
    assert.deepEqual(
      intelligenceWorkflows.map((workflow) => workflow.kind),
      [
        "trend_discovery",
        "competitor_analysis",
        "viral_opportunity",
        "topic_selection",
        "hook_optimization",
        "script_generation",
        "thumbnail_planning",
        "metadata_optimization",
      ],
    );
  });

  it("keeps OpenRouter and Gemini blocked by default", () => {
    assert.equal(getIntelligenceProviderStatus("openrouter").status, "Not connected");
    assert.equal(getIntelligenceProviderStatus("openrouter").paidToolGuard, "blocked");
    assert.equal(getIntelligenceProviderStatus("gemini").status, "Not connected");
    assert.equal(getIntelligenceProviderStatus("gemini").paidToolGuard, "blocked");
    assert.equal(getIntelligenceProviderStatus("mock").status, "Mock");
  });

  it("runs every workflow as structured mock-safe output", async () => {
    for (const workflow of intelligenceWorkflows) {
      const result = await runIntelligenceWorkflow({
        workflowKind: workflow.kind,
        objective: `Run ${workflow.name} for a safe India folklore content planning packet.`,
        seedTopics: ["haunted fort mystery", "cursed object folklore"],
        sourceReferences: ["Manual note: archive/source to verify later"],
        approvalRequired: true,
      });

      assert.equal(result.workflowKind, workflow.kind);
      assert.equal(result.departmentId, workflow.departmentId);
      assert.equal(result.status, "waiting_for_approval");
      assert.ok(result.assignedAgents.length > 0);
      assert.ok(result.rankedItems.length > 0);
      assert.ok(result.recommendations.length > 0);
      assert.ok(result.draftArtifacts.length > 0);
      assert.equal(result.providerStatus.status, "Mock");
      assert.match(result.queueJobId, /^mock_job_/);
      assert.equal(result.memoryCaptureStatus, "captured");
      assert.equal(result.approvalCheckpoint.status, "pending");
      assert.ok(result.graphTrace.length > 0);
    }
  });

  it("blocks configured non-mock provider execution until a future approval-gated slice", async () => {
    const result = await runIntelligenceWorkflow({
      workflowKind: "trend_discovery",
      objective: "Try a non-mock intelligence provider without enabling paid execution.",
      providerId: "openrouter",
    });

    assert.equal(result.status, "blocked");
    assert.equal(result.providerStatus.paidToolGuard, "blocked");
    assert.equal(result.rankedItems.length, 0);
    assert.match(result.recommendations.join(" "), /blocked/i);
  });

  it("content package workflow never claims publishing or paid execution", async () => {
    const packageResult = await createIntelligenceContentPackage({
      objective: "Create a safe draft package for a haunted fort short.",
      seedTopics: ["haunted fort mystery"],
    });

    assert.equal(packageResult.result.providerStatus.status, "Mock");
    assert.equal(packageResult.result.status, "waiting_for_approval");
    assert.match(packageResult.package.message, /database persistence is not connected|No publishing|review/i);
    assert.equal(packageResult.result.risks.some((risk) => /paid|publishing|scraping/i.test(risk)), true);
  });

  it("handler-level access checks cover anonymous, viewer, missing marker, invalid, and valid users", async () => {
    assert.deepEqual(resolveIntelligenceMutationAccess({ user: null }), { ok: false, status: 401, error: "Login required." });
    assert.deepEqual(resolveIntelligenceMutationAccess({ user: viewerUser }), {
      ok: false,
      status: 403,
      error: "Only admins and operators can run intelligence workflows.",
    });
    assert.deepEqual(resolveIntelligenceMutationAccess({ user: adminUser, safetyError: { status: 403, error: "Mutation must be sent from the Folqen app UI." } }), {
      ok: false,
      status: 403,
      error: "Mutation must be sent from the Folqen app UI.",
    });
    assert.equal(resolveIntelligenceMutationAccess({ user: adminUser }).ok, true);
    await assert.rejects(
      async () =>
        runIntelligenceWorkflow({
          workflowKind: "bad_kind",
          objective: "This invalid workflow should fail validation.",
        }),
    );
  });
});
