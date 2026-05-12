import assert from "node:assert/strict";
import test from "node:test";

import { FOLQEN_MUTATION_HEADER, FOLQEN_MUTATION_HEADER_VALUE } from "@/lib/security/mutation-headers";
import { resolvePlatformOpsMutationAccess } from "./api-handler";
import { getPlatformProviderStatuses } from "./providers";
import { platformProfiles, publishingWorkflows } from "./registry";
import { getPlatformOpsCapabilities, getPlatformOpsDashboard, retryPublishing, runPlatformOperation } from "./service";

const operator = { id: "user_operator", email: "operator@example.com", name: "Operator", role: "OPERATOR" as const };
const viewer = { id: "user_viewer", email: "viewer@example.com", name: "Viewer", role: "VIEWER" as const };

test("platform operations registry exposes requested platforms and workflows", () => {
  assert.deepEqual(
    platformProfiles.map((platform) => platform.id),
    ["YOUTUBE", "INSTAGRAM", "THREADS", "TIKTOK", "LINKEDIN", "X_TWITTER"],
  );
  assert.deepEqual(
    publishingWorkflows.map((workflow) => workflow.kind),
    [
      "scheduled_publishing",
      "multi_platform_distribution",
      "publishing_retry_recovery",
      "failed_upload_recovery",
      "platform_adaptation",
      "analytics_collection",
      "engagement_monitoring",
    ],
  );
});

test("platform providers never enable live publishing by default", () => {
  const providers = getPlatformProviderStatuses({
    ORACLE_N8N_INSTANCE_URL: "https://n8n.example.com",
    YOUTUBE_CLIENT_ID: "client",
    YOUTUBE_CLIENT_SECRET: "secret",
    INSTAGRAM_CLIENT_ID: "client",
    INSTAGRAM_CLIENT_SECRET: "secret",
  } as unknown as NodeJS.ProcessEnv);

  assert.equal(providers.every((provider) => provider.livePublishingEnabled === false), true);
  assert.equal(providers.find((provider) => provider.id === "n8n")?.status, "Configured");
  assert.equal(providers.find((provider) => provider.id === "youtube_api")?.status, "Blocked");
  assert.equal(providers.find((provider) => provider.id === "instagram_graph")?.status, "Blocked");
});

test("every platform workflow creates mock-safe output with queue metadata", async () => {
  for (const workflow of publishingWorkflows) {
    const result = await runPlatformOperation({
      workflowKind: workflow.kind,
      objective: `Prepare ${workflow.name} for an Indian haunted fort mystery package.`,
      platforms: ["YOUTUBE", "INSTAGRAM", "THREADS"],
      title: "The Fort That Would Not Sleep",
      approvalRequired: true,
    });

    assert.equal(result.mode, "dry_run");
    assert.equal(result.deployments.length, 3);
    assert.equal(result.queueJobIds.every((id) => id.startsWith("mock_job_")), true);
    assert.equal(result.deployments.every((deployment) => deployment.logs.some((log) => /No public post|No platform account/.test(log))), true);
    assert.equal(result.approvalCheckpoint.status, "pending");
  }
});

test("platform adaptation creates platform-specific metadata without publishing", async () => {
  const result = await runPlatformOperation({
    workflowKind: "platform_adaptation",
    objective: "Adapt a folklore short about Bhangarh Fort.",
    platforms: ["YOUTUBE", "X_TWITTER"],
    hashtags: ["Bhangarh", "Mystery"],
  });

  assert.equal(result.adaptations.length, 2);
  assert.equal(result.adaptations[0].checks.publishing, "Blocked");
  const xAdaptation = result.adaptations.find((item) => item.platform === "X_TWITTER");
  assert.ok(xAdaptation);
  assert.equal(xAdaptation.caption.length <= 280, true);
});

test("TikTok remains a requested placeholder and blocks India dependency", async () => {
  const result = await runPlatformOperation({
    workflowKind: "multi_platform_distribution",
    objective: "Prepare TikTok placeholder distribution for a global mirror package.",
    platforms: ["TIKTOK"],
  });

  assert.equal(result.status, "blocked");
  assert.equal(result.adaptations[0].checks.policy, "Blocked");
  assert.match(result.deployments[0].logs.join(" "), /not part of the India-first dependency plan/);
});

test("publishing retry plans recovery without account automation", async () => {
  const result = await retryPublishing({ deploymentId: "deploy_failed_1", platform: "YOUTUBE", reason: "Upload API not connected." });

  assert.equal(result.mode, "dry_run");
  assert.equal(result.retryPlan.status, "failed_recoverable");
  assert.match(result.retryPlan.queueJobId, /^mock_job_/);
  assert.equal(result.retryPlan.logs.some((log) => /No platform account/.test(log)), true);
});

test("dashboard and capabilities expose publishing, analytics, and monetization safety", async () => {
  await runPlatformOperation({
    workflowKind: "analytics_collection",
    objective: "Plan read-only analytics import for mystery Shorts.",
    platforms: ["YOUTUBE", "INSTAGRAM"],
  });

  const dashboard = await getPlatformOpsDashboard();
  const capabilities = getPlatformOpsCapabilities();

  assert.equal(dashboard.observability.publicPublishing, "blocked");
  assert.equal(dashboard.observability.scraping, "blocked");
  assert.equal(dashboard.analyticsPlans.length > 0, true);
  assert.equal(capabilities.safety.tiktokIndiaDependency, "blocked");
});

test("platform ops mutation access covers anonymous, viewer, missing marker, and operator", () => {
  assert.deepEqual(resolvePlatformOpsMutationAccess({ user: null }), { ok: false, status: 401, error: "Login required." });
  assert.deepEqual(resolvePlatformOpsMutationAccess({ user: viewer }), { ok: false, status: 403, error: "Only admins and operators can run platform operations." });
  assert.deepEqual(resolvePlatformOpsMutationAccess({ user: operator, safetyError: { status: 403, error: "Mutation must be sent from the Folqen app UI." } }), {
    ok: false,
    status: 403,
    error: "Mutation must be sent from the Folqen app UI.",
  });
  assert.equal(resolvePlatformOpsMutationAccess({ user: operator }).ok, true);

  const request = new Request("http://localhost:3000/api/platform-ops/distribute", {
    headers: { [FOLQEN_MUTATION_HEADER]: FOLQEN_MUTATION_HEADER_VALUE },
  });
  assert.equal(request.headers.get(FOLQEN_MUTATION_HEADER), FOLQEN_MUTATION_HEADER_VALUE);
});
