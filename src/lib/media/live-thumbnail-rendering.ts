import { ApprovalStatus, Prisma, TaskStatus } from "@prisma/client";
import { z } from "zod";

import { createAuditLog } from "@/lib/audit";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { evaluateGovernancePolicy } from "@/lib/governance/policy-engine";
import { emitOrchestrationEvent } from "@/lib/orchestration/event-bus";
import { enqueueOrchestrationJob, getQueueHealth, ORCHESTRATION_QUEUES } from "@/lib/orchestration/queue";
import { getRedisConfig } from "@/lib/orchestration/redis";
import { getMediaProviderStatuses } from "./providers";
import type { AssetValidationReport, ControlledRenderResult, ControlledRenderUsage, LiveThumbnailRenderDashboard, MediaAssetPlan, RenderGovernanceDecision, RenderPlan, RenderQualityScore } from "./types";

const liveThumbnailRequestSchema = z.object({
  objective: z.string().min(12).max(1400),
  approvalId: z.string().min(1).max(160),
  prompt: z.string().min(12).max(2500),
  contentId: z.string().max(160).optional(),
  sourceAssetId: z.string().max(160).optional(),
  aspectRatio: z.literal("16:9").default("16:9"),
  outputFormat: z.enum(["image/png", "image/webp"]).default("image/png"),
  estimatedRenderSeconds: z.coerce.number().int().min(1).max(600).default(45),
  estimatedGpuMinutes: z.coerce.number().min(0).max(60).default(0.8),
  tags: z.array(z.string().min(1).max(48)).max(12).default([]),
});

type LiveThumbnailRenderRequest = z.infer<typeof liveThumbnailRequestSchema>;

type ApprovalVerification = ControlledRenderResult["approvalVerification"];

type LiveThumbnailWorkerResponse = {
  ok: true;
  assetUrl: string;
  mimeType: "image/png" | "image/webp";
  width?: number;
  height?: number;
  sizeBytes?: number;
  checksum?: string;
  renderDurationMs?: number;
  traceId?: string;
  logs?: string[];
};

type LiveThumbnailRunOptions = {
  fetchImpl?: typeof fetch;
  approvalVerifier?: (approvalId: string) => Promise<ApprovalVerification>;
};

const workerResponseSchema = z.object({
  ok: z.literal(true),
  assetUrl: z.string().min(1).max(2000),
  mimeType: z.enum(["image/png", "image/webp"]),
  width: z.coerce.number().int().positive().max(8192).optional(),
  height: z.coerce.number().int().positive().max(8192).optional(),
  sizeBytes: z.coerce.number().int().positive().max(25_000_000).optional(),
  checksum: z.string().max(256).optional(),
  renderDurationMs: z.coerce.number().int().min(0).max(600_000).optional(),
  traceId: z.string().max(256).optional(),
  logs: z.array(z.string().max(600)).max(12).optional(),
});

const globalStore = globalThis as typeof globalThis & {
  folqenLiveThumbnailRuns?: ControlledRenderResult[];
  folqenLiveThumbnailUsage?: ControlledRenderUsage;
  folqenLiveThumbnailEmergency?: boolean;
  folqenLiveThumbnailQuarantine?: boolean;
  folqenLiveThumbnailDisabled?: boolean;
};

const liveThumbnailRuns = globalStore.folqenLiveThumbnailRuns ?? [];
const liveThumbnailUsage: ControlledRenderUsage = globalStore.folqenLiveThumbnailUsage ?? {
  runsToday: 0,
  activeRuns: 0,
  estimatedGpuMinutesToday: 0,
  failedRunsToday: 0,
};

globalStore.folqenLiveThumbnailRuns = liveThumbnailRuns;
globalStore.folqenLiveThumbnailUsage = liveThumbnailUsage;

function jsonSafe(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "thumbnail";
}

function providerConfigured() {
  const env = getEnv();
  return Boolean(env.LOCAL_WORKER_BASE_URL?.trim() && env.LOCAL_WORKER_SHARED_SECRET?.trim());
}

function liveActivationEnabled() {
  const env = getEnv();
  return env.ALLOW_CONTROLLED_MEDIA_EXECUTION && env.ALLOW_LIVE_THUMBNAIL_RENDERING && env.LIVE_MEDIA_ACTIVATION_STAGE >= 1 && env.LIVE_THUMBNAIL_RENDER_STAGE >= 1;
}

function killSwitchEngaged() {
  const env = getEnv();
  return env.MEDIA_RENDER_KILL_SWITCH || env.MEDIA_RENDER_EMERGENCY_STOP || globalStore.folqenLiveThumbnailEmergency === true || globalStore.folqenLiveThumbnailDisabled === true;
}

async function verifyApproval(approvalId: string): Promise<ApprovalVerification> {
  if (!hasDatabaseUrl()) {
    return { verified: false, status: "unavailable", approvalId, reason: "Database approval verification is required before live thumbnail rendering." };
  }

  try {
    const approval = await getDb().approval.findUnique({ where: { id: approvalId } });
    if (!approval) return { verified: false, status: "missing", approvalId, reason: "Approval record was not found." };
    if (approval.status !== ApprovalStatus.APPROVED) return { verified: false, status: approval.status.toLowerCase() as ApprovalVerification["status"], approvalId, reason: `Approval status is ${approval.status}.` };
    if (!approval.type.includes("media_render") && !approval.type.includes("thumbnail_render")) {
      return { verified: false, status: "approved", approvalId, reason: "Approval is not scoped to governed thumbnail rendering." };
    }
    return { verified: true, status: "approved", approvalId, reason: "Live thumbnail render approval verified." };
  } catch {
    return { verified: false, status: "unavailable", approvalId, reason: "Approval verification failed." };
  }
}

function buildValidation(input: LiveThumbnailRenderRequest, worker?: LiveThumbnailWorkerResponse): AssetValidationReport {
  const text = [input.objective, input.prompt].join(" ");
  const warnings: string[] = [];
  const malformedAsset = input.objective.trim().length < 12 || input.prompt.trim().length < 12;
  const failedRender = Boolean(worker && !worker.assetUrl);
  const lowQuality = input.prompt.split(/\s+/).length < 8 || !/thumbnail|title|contrast|mystery|cinematic|documentary/i.test(text);
  const duplicateRisk = Boolean(input.sourceAssetId);
  const unsafeAsset = /gore|blood|celebrity likeness|private person|copyrighted|nsfw|explicit/i.test(text);

  if (malformedAsset) warnings.push("Objective or prompt is too weak for live thumbnail rendering.");
  if (lowQuality) warnings.push("Thumbnail prompt lacks enough composition, title-space, contrast, or visual strategy detail.");
  if (duplicateRisk) warnings.push("Source asset reuse creates duplicate thumbnail risk and requires human review.");
  if (unsafeAsset) warnings.push("Unsafe or rights-sensitive visual instruction detected.");
  if (failedRender) warnings.push("Worker response did not include a rendered asset URL.");

  return {
    status: unsafeAsset || malformedAsset || failedRender ? "failed" : warnings.length ? "warning" : "passed",
    malformedAsset,
    failedRender,
    lowQuality,
    duplicateRisk,
    unsafeAsset,
    warnings,
  };
}

function scoreAsset(validation: AssetValidationReport): RenderQualityScore {
  const penalty = validation.warnings.length * 7 + (validation.unsafeAsset ? 45 : 0) + (validation.malformedAsset ? 25 : 0) + (validation.failedRender ? 50 : 0) + (validation.lowQuality ? 16 : 0) + (validation.duplicateRisk ? 10 : 0);
  const qualityScore = Math.max(0, Math.min(100, 88 - penalty));
  const safetyScore = validation.unsafeAsset ? 25 : validation.status === "warning" ? 78 : 94;
  const formatScore = validation.failedRender ? 30 : 92;

  return {
    qualityScore,
    promptFitScore: validation.lowQuality ? 56 : 88,
    safetyScore,
    formatScore,
    uniquenessScore: validation.duplicateRisk ? 62 : 84,
    acceptance: validation.status === "failed" || qualityScore < 60 || safetyScore < 70 || formatScore < 60 ? "rejected" : validation.status === "warning" ? "needs_review" : "accepted",
  };
}

async function evaluateLiveThumbnailGovernance(input: LiveThumbnailRenderRequest, approval: ApprovalVerification, validation: AssetValidationReport, scoring: RenderQualityScore): Promise<RenderGovernanceDecision> {
  const env = getEnv();
  const reasons = new Set<string>();
  const controls = new Set<string>([
    "thumbnail_only",
    "content_department_only",
    "approval_required",
    "budget_guard",
    "gpu_minute_guard",
    "timeout_guard",
    "queue_observability",
    "sandbox_fallback",
    "rollback_ready",
    "render_quarantine_available",
    "no_autonomous_retries",
    "no_video_generation",
    "no_publishing",
    "no_workflow_mutation",
  ]);

  if (!liveActivationEnabled()) reasons.add("Live thumbnail rendering flags are disabled or activation stages are below 1.");
  if (env.THUMBNAIL_RENDER_PROVIDER !== "local_worker") reasons.add("Only the controlled local_worker thumbnail provider is allowed.");
  if (!providerConfigured()) reasons.add("Controlled thumbnail worker endpoint or shared secret is not configured.");
  if (killSwitchEngaged()) reasons.add("Live thumbnail render kill switch, emergency stop, or runtime disable is engaged.");
  if (globalStore.folqenLiveThumbnailQuarantine === true) reasons.add("Live thumbnail provider is quarantined.");
  if (!approval.verified) reasons.add(approval.reason);
  if (validation.status === "failed" || scoring.acceptance === "rejected") reasons.add("Thumbnail asset validation or scoring rejected the render request.");
  if (input.estimatedRenderSeconds > env.MEDIA_RENDER_MAX_SECONDS) reasons.add("Estimated render duration exceeds the configured timeout.");
  if (input.estimatedGpuMinutes > env.MEDIA_RENDER_MAX_ESTIMATED_GPU_MINUTES) reasons.add("Estimated GPU minutes exceed the render budget.");
  if (liveThumbnailUsage.runsToday >= env.MEDIA_RENDER_MAX_DAILY_RUNS) reasons.add("Daily thumbnail render quota has been reached.");
  if (liveThumbnailUsage.activeRuns >= env.MEDIA_RENDER_MAX_CONCURRENCY) reasons.add("Thumbnail render concurrency limit has been reached.");

  const queueHealth = await getQueueHealth();
  const mediaQueue = queueHealth.find((queue) => queue.name === ORCHESTRATION_QUEUES.media);
  const queueDepth = (mediaQueue?.waiting ?? 0) + (mediaQueue?.active ?? 0) + (mediaQueue?.delayed ?? 0);
  if (queueDepth > 12) reasons.add("Media render queue depth exceeds the safety limit.");

  const policy = evaluateGovernancePolicy({
    actionType: "media_render",
    actorRole: "OPERATOR",
    providerId: "local_worker",
    approvalStatus: approval.verified ? "approved" : "pending",
    estimatedCostInr: 0,
    dryRun: false,
    queueDepth,
    retryCount: 0,
  });

  for (const reason of policy.reasons) reasons.add(reason);
  for (const control of policy.controls) controls.add(control);

  const reasonList = Array.from(reasons);
  let status: RenderGovernanceDecision["status"] = reasonList.length ? "blocked" : "allowed";
  if (reasonList.some((reason) => /approval/i.test(reason))) status = "needs_approval";
  if (reasonList.some((reason) => /kill switch|emergency|disabled|quarantined/i.test(reason))) status = "kill_switch";
  if (reasonList.some((reason) => /budget|GPU minutes|duration|quota|concurrency|queue/i.test(reason))) status = "budget_blocked";
  if (reasonList.some((reason) => /not configured|endpoint|shared secret/i.test(reason))) status = "not_connected";

  return {
    allowed: reasonList.length === 0,
    status,
    reasons: reasonList,
    controls: Array.from(controls),
    quota: {
      maxDailyRuns: env.MEDIA_RENDER_MAX_DAILY_RUNS,
      maxConcurrency: env.MEDIA_RENDER_MAX_CONCURRENCY,
      maxRenderSeconds: env.MEDIA_RENDER_MAX_SECONDS,
      maxEstimatedGpuMinutes: env.MEDIA_RENDER_MAX_ESTIMATED_GPU_MINUTES,
      maxQueueDepth: 12,
      maxAttempts: 1,
      ...liveThumbnailUsage,
    },
  };
}

function buildAsset(input: LiveThumbnailRenderRequest, validation: AssetValidationReport, worker?: LiveThumbnailWorkerResponse): MediaAssetPlan {
  const base = slug(`${input.objective}-${Date.now()}`);
  return {
    id: `live_thumbnail_asset_${base}`,
    mediaType: "thumbnail",
    title: `Live Thumbnail: ${input.objective.slice(0, 90)}`,
    description: input.prompt,
    format: worker?.mimeType ?? input.outputFormat,
    aspectRatio: "16:9",
    storagePath: worker?.assetUrl ?? `quarantined-thumbnail://${base}`,
    version: input.sourceAssetId ? 2 : 1,
    tags: Array.from(new Set(["live-thumbnail", "governed-render", ...input.tags])).slice(0, 12),
    status: worker ? "Live" : validation.status === "failed" ? "Blocked" : "Needs approval",
    providerId: "local_worker",
    validation: {
      safe: validation.status !== "failed",
      warnings: validation.warnings,
    },
  };
}

function buildRenderPlan(input: LiveThumbnailRenderRequest, queueJobId: string, validation: AssetValidationReport, worker?: LiveThumbnailWorkerResponse): RenderPlan {
  const providerStatus = getMediaProviderStatuses().find((provider) => provider.id === "local_worker") ?? getMediaProviderStatuses()[0];
  return {
    renderId: `live_thumbnail_render_${slug(input.objective)}`,
    workflowKind: "thumbnail_workflow",
    status: validation.status === "failed" || !worker ? "failed_recoverable" : "queued",
    queueJobId,
    attempts: worker ? 1 : 0,
    maxAttempts: 1,
    providerStatus,
    steps: ["verify_thumbnail_approval", "validate_budget_and_quota", "enqueue_render_trace", "call_controlled_thumbnail_worker", "validate_asset_contract", "score_thumbnail", "persist_registry_metadata", "hold_for_human_review"],
    logs: [
      worker ? "Controlled thumbnail worker returned a governed thumbnail asset." : "Live thumbnail rendering did not execute or did not return an asset.",
      "No video generation, public publishing, autonomous retry, unrestricted GPU execution, or workflow mutation was allowed.",
      ...(worker?.logs ?? []),
    ],
    retryPolicy: {
      enabled: true,
      backoffMs: 0,
      escalationAfterAttempts: 1,
    },
  };
}

async function callControlledThumbnailWorker(input: LiveThumbnailRenderRequest, fetchImpl: typeof fetch): Promise<LiveThumbnailWorkerResponse> {
  const env = getEnv();
  const baseUrl = env.LOCAL_WORKER_BASE_URL?.replace(/\/+$/, "");
  if (!baseUrl || !env.LOCAL_WORKER_SHARED_SECRET) {
    throw new Error("Controlled thumbnail worker is not configured.");
  }

  const response = await fetchImpl(`${baseUrl}/api/folqen/render/thumbnail`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Folqen-Worker-Secret": env.LOCAL_WORKER_SHARED_SECRET,
    },
    body: JSON.stringify({
      capability: "live_thumbnail_rendering",
      department: "content",
      objective: input.objective,
      prompt: input.prompt,
      aspectRatio: input.aspectRatio,
      outputFormat: input.outputFormat,
      maxRenderSeconds: env.MEDIA_RENDER_MAX_SECONDS,
      maxEstimatedGpuMinutes: env.MEDIA_RENDER_MAX_ESTIMATED_GPU_MINUTES,
      autonomousRetries: false,
      publishingAllowed: false,
      workflowMutationAllowed: false,
    }),
    signal: AbortSignal.timeout(Math.min(env.MEDIA_RENDER_MAX_SECONDS, input.estimatedRenderSeconds) * 1000),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`Controlled thumbnail worker failed with HTTP ${response.status}.`);
  }

  return workerResponseSchema.parse(payload);
}

async function persistLiveThumbnail(input: LiveThumbnailRenderRequest, result: ControlledRenderResult, actorId?: string) {
  if (!hasDatabaseUrl()) return { persisted: false as const };

  try {
    const db = getDb();
    const asset = await db.asset.create({
      data: {
        contentId: input.contentId,
        type: result.status === "completed_live" ? "live_thumbnail" : "quarantined_thumbnail",
        name: result.asset.title,
        path: result.asset.storagePath,
        mimeType: result.asset.format,
        sizeBytes: result.liveThumbnail?.sizeBytes,
        metadata: jsonSafe({
          source: "folqen_live_thumbnail_rendering",
          runId: result.runId,
          workflowKind: result.workflowKind,
          validation: result.validation,
          scoring: result.scoring,
          governance: result.governance,
          observability: result.observability,
          safety: result.safety,
          liveThumbnail: result.liveThumbnail,
          liveRendering: result.status === "completed_live",
          publicPublishing: "blocked",
          autonomousRetries: false,
        }),
      },
    });

    await db.render.create({
      data: {
        contentId: input.contentId,
        status: result.status === "completed_live" ? TaskStatus.COMPLETED : TaskStatus.FAILED,
        providerId: "local_worker",
        outputPath: result.asset.storagePath,
        logs: result.renderPlan.logs.join("\n"),
        metadata: jsonSafe({ ...result, persistedAssetId: asset.id }),
      },
    });

    await createAuditLog({
      actorId,
      action: `media.live_thumbnail.${result.status}`,
      target: result.runId,
      riskLevel: result.status === "completed_live" ? "HIGH" : "MEDIUM",
      metadata: jsonSafe({
        workflowKind: result.workflowKind,
        providerId: result.providerId,
        approvalId: result.approvalVerification.approvalId,
        validation: result.validation,
        scoring: result.scoring,
        liveRendering: result.status === "completed_live",
      }),
    });

    return { persisted: true as const };
  } catch (error) {
    await createAuditLog({
      actorId,
      action: "media.live_thumbnail.persistence_failed",
      target: result.runId,
      riskLevel: "MEDIUM",
      metadata: jsonSafe({ workflowKind: result.workflowKind, error: error instanceof Error ? error.message : "unknown" }),
    });
    return { persisted: false as const };
  }
}

async function recordFailure(input: LiveThumbnailRenderRequest, message: string, runId: string, actorId?: string) {
  if (!hasDatabaseUrl()) return;

  try {
    await getDb().errorLog.create({
      data: {
        source: "live_thumbnail_rendering",
        message,
        severity: "HIGH",
        metadata: jsonSafe({ runId, objective: input.objective, approvalId: input.approvalId, isolated: true, noAutonomousRetry: true }),
      },
    });

    await createAuditLog({
      actorId,
      action: "media.live_thumbnail.failure_isolated",
      target: runId,
      riskLevel: "HIGH",
      metadata: jsonSafe({ message, failedAssetIsolation: true, autonomousRetry: false }),
    });
  } catch {
    // Failure isolation is best-effort when the database is unavailable.
  }
}

export async function runLiveThumbnailRender(rawInput: unknown, actorId?: string, options: LiveThumbnailRunOptions = {}): Promise<ControlledRenderResult> {
  const input = liveThumbnailRequestSchema.parse(rawInput);
  const fetchImpl = options.fetchImpl ?? fetch;
  const providerStatus = getMediaProviderStatuses().find((provider) => provider.id === "local_worker") ?? getMediaProviderStatuses()[0];
  const approval = options.approvalVerifier ? await options.approvalVerifier(input.approvalId) : await verifyApproval(input.approvalId);
  const preValidation = buildValidation(input);
  const preScore = scoreAsset(preValidation);
  const governance = await evaluateLiveThumbnailGovernance(input, approval, preValidation, preScore);
  const queueStartedAt = Date.now();
  const queue = await enqueueOrchestrationJob({
    queueName: ORCHESTRATION_QUEUES.media,
    name: "media.live_thumbnail.render",
    data: {
      workflowKind: "live_thumbnail_rendering",
      providerId: "local_worker",
      departmentId: "content",
      thumbnailOnly: true,
      liveRendering: governance.allowed,
      approvalRequired: true,
      autonomousRetries: false,
      noPublishing: true,
    },
    options: { attempts: 1, removeOnComplete: 50, removeOnFail: 100 },
  });

  let worker: LiveThumbnailWorkerResponse | undefined;
  let failureMessage: string | undefined;
  const renderStartedAt = Date.now();
  liveThumbnailUsage.activeRuns += 1;

  try {
    if (governance.allowed) {
      worker = await callControlledThumbnailWorker(input, fetchImpl);
    }
  } catch (error) {
    failureMessage = error instanceof Error ? error.message : "Controlled thumbnail worker failed.";
  } finally {
    liveThumbnailUsage.activeRuns = Math.max(0, liveThumbnailUsage.activeRuns - 1);
  }

  const validation = buildValidation(input, worker);
  if (failureMessage) validation.warnings.push(failureMessage);
  const scoring = scoreAsset(validation);
  const blockedByQuality = scoring.acceptance === "rejected";
  const completedLive = governance.allowed && worker && !blockedByQuality;
  const runId = `live_thumbnail_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const asset = buildAsset(input, validation, completedLive ? worker : undefined);
  const result: ControlledRenderResult = {
    runId,
    workflowKind: "live_thumbnail_rendering",
    status: globalStore.folqenLiveThumbnailQuarantine ? "quarantined" : completedLive ? "completed_live" : approval.verified ? "failed" : "waiting_for_approval",
    mode: completedLive ? "live" : "blocked",
    providerId: "local_worker",
    providerStatus,
    governance: {
      ...governance,
      allowed: Boolean(completedLive),
      reasons: completedLive ? governance.reasons : Array.from(new Set([...governance.reasons, failureMessage, blockedByQuality ? "Thumbnail render output failed quality validation." : undefined].filter(Boolean) as string[])),
    },
    approvalVerification: approval,
    queueJobId: queue.jobId,
    asset,
    renderPlan: buildRenderPlan(input, queue.jobId, validation, completedLive ? worker : undefined),
    validation,
    scoring,
    observability: {
      trace: [
        "Validated live thumbnail request schema.",
        "Verified approval and Content Department thumbnail-only scope.",
        "Evaluated render activation, budget, quota, provider, and kill-switch gates.",
        queue.mode === "live" ? "Captured live BullMQ media queue metadata." : "Captured mock-safe media queue metadata for render traceability.",
        completedLive ? "Controlled thumbnail worker returned an asset." : "Live thumbnail render was blocked, failed, or held for approval.",
        "No video generation, publishing, autonomous retry, unrestricted GPU access, or workflow mutation occurred.",
      ],
      queueLatencyMs: Date.now() - queueStartedAt,
      renderDurationEstimateSeconds: input.estimatedRenderSeconds,
      renderDurationMs: worker?.renderDurationMs ?? Date.now() - renderStartedAt,
      estimatedGpuMinutes: input.estimatedGpuMinutes,
      budgetUtilizationPercent: Number(((input.estimatedGpuMinutes / Math.max(0.1, getEnv().MEDIA_RENDER_MAX_ESTIMATED_GPU_MINUTES)) * 100).toFixed(1)),
      providerTraceId: worker?.traceId,
      failureRatePercent: Number(((liveThumbnailUsage.failedRunsToday / Math.max(1, liveThumbnailUsage.runsToday + liveThumbnailUsage.failedRunsToday)) * 100).toFixed(1)),
    },
    rollback: {
      available: true,
      steps: ["disable_live_thumbnail_rendering", "rollback_to_dry_run", "drain_media_queue", "quarantine_local_worker", "isolate_failed_asset_metadata"],
    },
    liveThumbnail: {
      provider: "local_worker",
      previewUrl: completedLive ? worker?.assetUrl : undefined,
      width: worker?.width,
      height: worker?.height,
      sizeBytes: worker?.sizeBytes,
      checksum: worker?.checksum,
      quarantined: globalStore.folqenLiveThumbnailQuarantine === true || !completedLive,
      rollbackMode: "dry_run_available",
      failedAssetIsolation: completedLive ? undefined : `isolated://${runId}`,
    },
    safety: {
      noPublishing: true,
      noAutonomousRetries: true,
      noUnrestrictedGpu: true,
      noVideoGeneration: true,
      noWorkflowMutation: true,
    },
    persisted: false,
    createdAt: new Date().toISOString(),
  };

  if (completedLive) {
    liveThumbnailUsage.runsToday += 1;
    liveThumbnailUsage.estimatedGpuMinutesToday += input.estimatedGpuMinutes;
  } else {
    liveThumbnailUsage.failedRunsToday += 1;
    await recordFailure(input, result.governance.reasons[0] ?? "Live thumbnail render did not complete.", runId, actorId);
  }

  await emitOrchestrationEvent({
    type: `media.live_thumbnail.${result.status}`,
    severity: completedLive ? "warning" : "error",
    source: "media-pipeline",
    departmentId: "content",
    workflowRunId: runId,
    message: completedLive ? "Governed live thumbnail render completed through the controlled worker." : "Governed live thumbnail render was blocked, failed, quarantined, or waiting for approval.",
    metadata: {
      providerId: "local_worker",
      queueJobId: queue.jobId,
      governance: result.governance,
      validation,
      scoring,
      liveRendering: completedLive,
      noPublishing: true,
      noAutonomousRetries: true,
    },
  });

  const persistence = await persistLiveThumbnail(input, result, actorId);
  result.persisted = persistence.persisted;
  liveThumbnailRuns.unshift(result);
  liveThumbnailRuns.splice(24);

  return result;
}

export function getLiveThumbnailRuns() {
  return liveThumbnailRuns.slice(0, 12);
}

export async function getLiveThumbnailDashboard(): Promise<LiveThumbnailRenderDashboard> {
  const env = getEnv();
  const queueHealth = await getQueueHealth();
  const mediaQueue = queueHealth.find((queue) => queue.name === ORCHESTRATION_QUEUES.media) ?? queueHealth[0];
  const approval: ApprovalVerification = { verified: false, status: "missing", reason: "Readiness snapshot only. A real approval ID is required before rendering." };
  const validation = buildValidation({
    objective: "Evaluate governed live thumbnail rendering readiness.",
    approvalId: "readiness_snapshot",
    prompt: "Cinematic mystery documentary thumbnail with strong contrast, title space, safe folklore tone, and no real-person likeness.",
    aspectRatio: "16:9",
    outputFormat: "image/png",
    estimatedRenderSeconds: 45,
    estimatedGpuMinutes: 0.8,
    tags: [],
  });
  const scoring = scoreAsset(validation);
  const governance = await evaluateLiveThumbnailGovernance(
    {
      objective: "Evaluate governed live thumbnail rendering readiness.",
      approvalId: "readiness_snapshot",
      prompt: "Cinematic mystery documentary thumbnail with strong contrast, title space, safe folklore tone, and no real-person likeness.",
      aspectRatio: "16:9",
      outputFormat: "image/png",
      estimatedRenderSeconds: 45,
      estimatedGpuMinutes: 0.8,
      tags: [],
    },
    approval,
    validation,
    scoring,
  );

  return {
    capability: "live_thumbnail_rendering",
    providerId: "local_worker",
    status: governance.allowed ? "Live" : providerConfigured() ? "Needs approval" : "Not connected",
    constraints: ["Content Department only", "Thumbnail rendering only", "Approval mandatory", "Budget mandatory", "Sandbox fallback", "No publishing", "No video generation", "No autonomous retries", "No workflow mutation"],
    governance,
    recentRuns: getLiveThumbnailRuns(),
    queue: {
      mode: getRedisConfig().executionMode === "live" ? "live" : "mock",
      name: mediaQueue?.name ?? ORCHESTRATION_QUEUES.media,
      waiting: mediaQueue?.waiting ?? 0,
      active: mediaQueue?.active ?? 0,
      failed: mediaQueue?.failed ?? 0,
      completed: mediaQueue?.completed ?? 0,
    },
    rollback: {
      disableAvailable: true,
      quarantineAvailable: true,
      dryRunFallback: env.THUMBNAIL_RENDER_SANDBOX_FALLBACK,
      failedAssetIsolation: true,
    },
    diagnostics: {
      providerConfigured: providerConfigured(),
      activationEnabled: liveActivationEnabled(),
      killSwitchEngaged: killSwitchEngaged(),
      thumbnailOnly: true,
      noPublishing: true,
      noVideoGeneration: true,
      noAutonomousRetries: true,
    },
  };
}

export async function controlLiveThumbnailRendering(input: { action: "disable" | "rollback_to_dry_run" | "quarantine" | "drain_queue" | "recover_failed_render"; reason: string; renderId?: string }, actorId?: string) {
  if (input.action === "disable" || input.action === "rollback_to_dry_run") globalStore.folqenLiveThumbnailDisabled = true;
  if (input.action === "quarantine") globalStore.folqenLiveThumbnailQuarantine = true;
  if (input.action === "rollback_to_dry_run") globalStore.folqenLiveThumbnailEmergency = true;

  const queue = await enqueueOrchestrationJob({
    queueName: ORCHESTRATION_QUEUES.media,
    name: `media.live_thumbnail.control.${input.action}`,
    data: {
      action: input.action,
      renderId: input.renderId,
      reason: input.reason,
      liveThumbnailRendering: false,
      queueDrain: input.action === "drain_queue" || input.action === "rollback_to_dry_run",
      quarantine: input.action === "quarantine",
      autonomousRetries: false,
    },
  });

  await createAuditLog({
    actorId,
    action: `media.live_thumbnail.control.${input.action}`,
    target: input.renderId ?? "live_thumbnail_rendering",
    riskLevel: input.action === "recover_failed_render" ? "MEDIUM" : "CRITICAL",
    metadata: jsonSafe({ reason: input.reason, queueJobId: queue.jobId, noAutonomousRetry: true }),
  });

  await emitOrchestrationEvent({
    type: `media.live_thumbnail.control.${input.action}`,
    severity: input.action === "recover_failed_render" ? "warning" : "critical",
    source: "media-pipeline",
    departmentId: "content",
    message: "Live thumbnail render control action captured.",
    metadata: { reason: input.reason, renderId: input.renderId, queueJobId: queue.jobId, liveThumbnailRendering: false },
  });

  return {
    ok: true,
    mode: input.action === "recover_failed_render" ? "failed_render_recovery_planned" : "rollback_to_dry_run",
    action: input.action,
    queueJobId: queue.jobId,
    message:
      input.action === "recover_failed_render"
        ? "Failed thumbnail render recovery was planned. No autonomous retry or live render was executed."
        : "Live thumbnail rendering control action is active. Rendering can fall back to dry-run and the provider can be quarantined.",
  };
}

export function resetLiveThumbnailRuntimeForTests() {
  globalStore.folqenLiveThumbnailEmergency = false;
  globalStore.folqenLiveThumbnailQuarantine = false;
  globalStore.folqenLiveThumbnailDisabled = false;
  liveThumbnailRuns.splice(0);
  liveThumbnailUsage.runsToday = 0;
  liveThumbnailUsage.activeRuns = 0;
  liveThumbnailUsage.estimatedGpuMinutesToday = 0;
  liveThumbnailUsage.failedRunsToday = 0;
}
