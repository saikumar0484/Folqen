import assert from "node:assert/strict";
import test from "node:test";

import { FOLQEN_MUTATION_HEADER, FOLQEN_MUTATION_HEADER_VALUE } from "@/lib/security/mutation-headers";
import { resolveMediaMutationAccess } from "./api-handler";
import { engageMediaRenderShutdown, resetControlledMediaEmergencyForTests, runControlledMediaRender } from "./controlled-rendering";
import { controlLiveThumbnailRendering, getLiveThumbnailDashboard, resetLiveThumbnailRuntimeForTests, runLiveThumbnailRender } from "./live-thumbnail-rendering";
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
  assert.equal(providers.find((provider) => provider.id === "local_worker")?.status, "Needs approval");
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

test("live thumbnail rendering blocks by default and does not call the worker", async () => {
  resetLiveThumbnailRuntimeForTests();
  let called = false;
  const result = await runLiveThumbnailRender(
    {
      objective: "Render a governed 16:9 thumbnail for a haunted fort mystery short.",
      approvalId: "approval_missing",
      prompt: "Cinematic mystery documentary thumbnail with bold title space, safe folklore tone, and high contrast.",
      tags: ["thumbnail"],
    },
    undefined,
    {
      fetchImpl: (async () => {
        called = true;
        throw new Error("worker should not be called");
      }) as typeof fetch,
      approvalVerifier: async (approvalId) => ({ verified: false, status: "missing", approvalId, reason: "Approval missing in test." }),
    },
  );

  assert.equal(called, false);
  assert.equal(result.status, "waiting_for_approval");
  assert.equal(result.mode, "blocked");
  assert.equal(result.providerId, "local_worker");
  assert.equal(result.safety.noPublishing, true);
  assert.equal(result.safety.noAutonomousRetries, true);
});

test("live thumbnail rendering completes only with activation flags, approval, worker, budget, and validation", async () => {
  resetLiveThumbnailRuntimeForTests();
  const previous = {
    ALLOW_CONTROLLED_MEDIA_EXECUTION: process.env.ALLOW_CONTROLLED_MEDIA_EXECUTION,
    ALLOW_LIVE_THUMBNAIL_RENDERING: process.env.ALLOW_LIVE_THUMBNAIL_RENDERING,
    LIVE_MEDIA_ACTIVATION_STAGE: process.env.LIVE_MEDIA_ACTIVATION_STAGE,
    LIVE_THUMBNAIL_RENDER_STAGE: process.env.LIVE_THUMBNAIL_RENDER_STAGE,
    LOCAL_WORKER_BASE_URL: process.env.LOCAL_WORKER_BASE_URL,
    LOCAL_WORKER_SHARED_SECRET: process.env.LOCAL_WORKER_SHARED_SECRET,
    MEDIA_RENDER_KILL_SWITCH: process.env.MEDIA_RENDER_KILL_SWITCH,
    MEDIA_RENDER_EMERGENCY_STOP: process.env.MEDIA_RENDER_EMERGENCY_STOP,
  };
  Object.assign(process.env, {
    ALLOW_CONTROLLED_MEDIA_EXECUTION: "true",
    ALLOW_LIVE_THUMBNAIL_RENDERING: "true",
    LIVE_MEDIA_ACTIVATION_STAGE: "1",
    LIVE_THUMBNAIL_RENDER_STAGE: "1",
    LOCAL_WORKER_BASE_URL: "https://worker.folqen.test",
    LOCAL_WORKER_SHARED_SECRET: "test-worker-secret",
    MEDIA_RENDER_KILL_SWITCH: "false",
    MEDIA_RENDER_EMERGENCY_STOP: "false",
  });

  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const result = await runLiveThumbnailRender(
    {
      objective: "Render a governed 16:9 thumbnail for an India-focused haunted fort mystery short.",
      approvalId: "approval_live_thumbnail",
      prompt: "Cinematic mystery documentary thumbnail, haunted fort silhouette, bright title space, safe folklore tone, high contrast, no real-person likeness.",
      tags: ["thumbnail", "folklore"],
    },
    undefined,
    {
      fetchImpl: (async (url, init) => {
        calls.push({ url: String(url), init });
        return new Response(
          JSON.stringify({
            ok: true,
            assetUrl: "https://assets.folqen.test/thumbnails/haunted-fort.png",
            mimeType: "image/png",
            width: 1280,
            height: 720,
            sizeBytes: 512000,
            checksum: "sha256:test",
            renderDurationMs: 1200,
            traceId: "worker_trace_1",
            logs: ["rendered thumbnail through controlled worker"],
          }),
          { status: 200 },
        );
      }) as typeof fetch,
      approvalVerifier: async (approvalId) => ({ verified: true, status: "approved", approvalId, reason: "Approved in test." }),
    },
  );

  for (const [key, value] of Object.entries(previous)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }

  assert.equal(calls.length, 1);
  assert.equal(result.status, "completed_live");
  assert.equal(result.mode, "live");
  assert.equal(result.liveThumbnail?.previewUrl, "https://assets.folqen.test/thumbnails/haunted-fort.png");
  assert.equal(result.liveThumbnail?.provider, "local_worker");
  assert.equal(result.scoring.acceptance, "accepted");
  assert.equal(result.observability.providerTraceId, "worker_trace_1");
  assert.equal(result.safety.noVideoGeneration, true);
  assert.equal(result.rollback.available, true);
});

test("live thumbnail rendering rejects non-thumbnail output shape", async () => {
  await assert.rejects(
    () =>
      runLiveThumbnailRender({
        objective: "Render a governed non-thumbnail visual.",
        approvalId: "approval_bad_aspect",
        prompt: "Vertical poster visual with title space.",
        aspectRatio: "9:16",
      }),
    /Invalid literal value/,
  );
});

test("live thumbnail rollback and quarantine controls never execute autonomous retries", async () => {
  resetLiveThumbnailRuntimeForTests();
  const result = await controlLiveThumbnailRendering({ action: "rollback_to_dry_run", reason: "Test rollback to dry-run after thumbnail incident." });
  const dashboard = await getLiveThumbnailDashboard();

  assert.equal(result.mode, "rollback_to_dry_run");
  assert.match(result.queueJobId, /^mock_job_/);
  assert.equal(dashboard.diagnostics.killSwitchEngaged, true);
  assert.equal(dashboard.rollback.dryRunFallback, true);
  resetLiveThumbnailRuntimeForTests();
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
