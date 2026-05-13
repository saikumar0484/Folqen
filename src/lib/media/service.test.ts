import assert from "node:assert/strict";
import test from "node:test";

import { FOLQEN_MUTATION_HEADER, FOLQEN_MUTATION_HEADER_VALUE } from "@/lib/security/mutation-headers";
import { resolveMediaMutationAccess } from "./api-handler";
import { engageMediaRenderShutdown, resetControlledMediaEmergencyForTests, runControlledMediaRender } from "./controlled-rendering";
import { getMediaProviderStatuses } from "./providers";
import { mediaTypes, mediaWorkflows } from "./registry";
import { getMediaCapabilities, getMediaDashboard, retryRender, runMediaPipeline } from "./service";
import { controlledMediaWorkflowKinds } from "./types";

const operator = { id: "user_operator", email: "operator@example.com", name: "Operator", role: "OPERATOR" as const };
const viewer = { id: "user_viewer", email: "viewer@example.com", name: "Viewer", role: "VIEWER" as const };

test("media registry exposes all requested media types and workflows", () => {
  assert.deepEqual(
    mediaTypes.map((type) => type.id),
    ["thumbnail", "shorts_visual", "video_clip", "subtitles", "cover_image", "platform_variant", "asset_template", "render_output"],
  );
  assert.deepEqual(
    mediaWorkflows.map((workflow) => workflow.kind),
    [
      "thumbnail_workflow",
      "shorts_visual_workflow",
      "script_to_scene_workflow",
      "asset_adaptation_workflow",
      "rendering_workflow",
      "subtitle_workflow",
      "asset_optimization_workflow",
    ],
  );
});

test("media providers never enable live ComfyUI, FFmpeg, or worker execution by default", () => {
  const providers = getMediaProviderStatuses({
    COMFYUI_BASE_URL: "http://localhost:8188",
    FFMPEG_PATH: "ffmpeg",
    LOCAL_WORKER_BASE_URL: "http://localhost:4100",
    LOCAL_WORKER_SHARED_SECRET: "secret",
  } as unknown as NodeJS.ProcessEnv);

  assert.equal(providers.every((provider) => provider.liveExecutionEnabled === false), true);
  assert.equal(providers.find((provider) => provider.id === "comfyui")?.status, "Blocked");
  assert.equal(providers.find((provider) => provider.id === "ffmpeg")?.status, "Configured");
  assert.equal(providers.find((provider) => provider.id === "local_worker")?.status, "Blocked");
});

test("every media workflow creates a dry-run result with queue metadata", async () => {
  for (const workflow of mediaWorkflows) {
    const result = await runMediaPipeline({
      workflowKind: workflow.kind,
      objective: `Plan ${workflow.name} for a haunted fort folklore short.`,
      platform: "YOUTUBE",
      prompt: "Premium mystery visual, no gore, source-safe documentary tone.",
      approvalRequired: true,
    });

    assert.equal(result.mode, "dry_run");
    assert.match(result.queueJobId, /^mock_job_/);
    assert.equal(result.assets.length > 0, true);
    assert.equal(result.renderPlan.logs.some((log) => /No GPU|No FFmpeg|No ComfyUI/.test(log)), true);
    assert.equal(result.approvalCheckpoint.status, "pending");
  }
});

test("thumbnail workflow produces a versioned asset plan", async () => {
  const result = await runMediaPipeline({
    workflowKind: "thumbnail_workflow",
    objective: "Create a curiosity-gap thumbnail for Bhangarh Fort mystery.",
    platform: "YOUTUBE",
    sourceAssetId: "asset_previous",
    tags: ["thumbnail", "fort"],
  });

  assert.equal(result.assets[0].mediaType, "thumbnail");
  assert.equal(result.assets[0].version, 2);
  assert.equal(result.assets[0].status, "Needs approval");
  assert.match(result.assets[0].storagePath, /^mock-media:\/\//);
});

test("render retry plans recovery without live rendering", async () => {
  const result = await retryRender({ renderId: "render_failed_1", reason: "FFmpeg worker unavailable." });

  assert.equal(result.mode, "dry_run");
  assert.equal(result.retryPlan.status, "failed_recoverable");
  assert.match(result.retryPlan.queueJobId, /^mock_job_/);
  assert.equal(result.retryPlan.logs.some((log) => /No FFmpeg command/.test(log)), true);
});

test("media dashboard exposes asset and render observability", async () => {
  await runMediaPipeline({
    workflowKind: "subtitle_workflow",
    objective: "Prepare subtitle overlay plan for a 45 second short.",
    mediaType: "subtitles",
  });

  const dashboard = await getMediaDashboard();

  assert.equal(dashboard.observability.liveRendering, "blocked");
  assert.equal(dashboard.observability.gpuExecution, "blocked");
  assert.equal(dashboard.renderQueue.length > 0, true);
  assert.equal(dashboard.recentAssets.length > 0, true);
});

test("media capabilities remain mock-safe", () => {
  const capabilities = getMediaCapabilities();

  assert.equal(capabilities.safety.liveComfyUI, "blocked");
  assert.equal(capabilities.safety.liveFfmpeg, "blocked");
  assert.equal(capabilities.safety.gpuRequired, false);
});

test("controlled media workflows expose governed rendering coverage", () => {
  assert.deepEqual(controlledMediaWorkflowKinds, [
    "live_thumbnail_rendering",
    "structured_image_generation",
    "subtitle_rendering",
    "asset_validation",
    "render_quality_scoring",
    "asset_reflection",
    "creative_asset_registry_integration",
    "render_recovery",
  ]);
});

test("controlled media rendering blocks without approval, env activation, and provider configuration", async () => {
  resetControlledMediaEmergencyForTests();
  const result = await runControlledMediaRender({
    workflowKind: "live_thumbnail_rendering",
    objective: "Prepare a governed thumbnail render packet for a haunted fort folklore short.",
    providerId: "comfyui",
    prompt: "Cinematic fort silhouette, no gore, no celebrity likeness.",
    tags: ["thumbnail"],
  });

  assert.equal(result.mode, "blocked");
  assert.equal(result.status, "waiting_for_approval");
  assert.equal(result.safety.noPublishing, true);
  assert.equal(result.safety.noAutonomousRetries, true);
  assert.equal(result.renderPlan.maxAttempts, 1);
  assert.match(result.queueJobId, /^mock_job_/);
  assert.equal(result.governance.reasons.some((reason) => reason.includes("ALLOW_CONTROLLED_MEDIA_EXECUTION")), true);
  assert.equal(result.approvalVerification.verified, false);
});

test("controlled media validation rejects unsafe or weak asset packets", async () => {
  resetControlledMediaEmergencyForTests();
  const result = await runControlledMediaRender({
    workflowKind: "structured_image_generation",
    objective: "Make copyrighted celebrity likeness gore thumbnail.",
    providerId: "mock",
    prompt: "Use celebrity likeness with gore and blood.",
    approvalId: "approval_fake",
  });

  assert.equal(result.validation.status, "failed");
  assert.equal(result.validation.unsafeAsset, true);
  assert.equal(result.scoring.acceptance, "rejected");
  assert.equal(result.safety.noUnrestrictedGpu, true);
});

test("controlled media emergency shutdown rolls rendering back to safe mode", async () => {
  const result = await engageMediaRenderShutdown("Test controlled render emergency shutdown.");

  assert.equal(result.mode, "rollback_to_safe_mode");
  assert.match(result.queueJobId, /^mock_job_/);
  resetControlledMediaEmergencyForTests();
});

test("media mutation access covers anonymous, viewer, missing marker, and operator", () => {
  assert.deepEqual(resolveMediaMutationAccess({ user: null }), { ok: false, status: 401, error: "Login required." });
  assert.deepEqual(resolveMediaMutationAccess({ user: viewer }), { ok: false, status: 403, error: "Only admins and operators can run media pipelines." });
  assert.deepEqual(resolveMediaMutationAccess({ user: operator, safetyError: { status: 403, error: "Mutation must be sent from the Folqen app UI." } }), {
    ok: false,
    status: 403,
    error: "Mutation must be sent from the Folqen app UI.",
  });
  assert.equal(resolveMediaMutationAccess({ user: operator }).ok, true);

  const request = new Request("http://localhost:3000/api/media/generate", {
    headers: { [FOLQEN_MUTATION_HEADER]: FOLQEN_MUTATION_HEADER_VALUE },
  });
  assert.equal(request.headers.get(FOLQEN_MUTATION_HEADER), FOLQEN_MUTATION_HEADER_VALUE);
});
