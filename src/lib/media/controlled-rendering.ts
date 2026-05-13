import { ApprovalStatus, Prisma, TaskStatus } from "@prisma/client";
import { z } from "zod";

import { createAuditLog } from "@/lib/audit";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { evaluateGovernancePolicy } from "@/lib/governance/policy-engine";
import { emitOrchestrationEvent } from "@/lib/orchestration/event-bus";
import { enqueueOrchestrationJob, getQueueHealth, ORCHESTRATION_QUEUES } from "@/lib/orchestration/queue";
import { getMediaProviderStatuses } from "./providers";
import { controlledMediaWorkflowKinds, controlledMediaWorkflowLabels, type AssetValidationReport, type ControlledRenderQuota, type ControlledRenderResult, type ControlledRenderUsage, type MediaAssetPlan, type MediaProviderId, type RenderGovernanceDecision, type RenderPlan, type RenderQualityScore } from "./types";

const controlledWorkflowSchema = z.enum(controlledMediaWorkflowKinds);
const providerSchema = z.enum(["comfyui", "ffmpeg", "local_worker", "mock"]);

export const controlledRenderRequestSchema = z.object({
  workflowKind: controlledWorkflowSchema.default("live_thumbnail_rendering"),
  objective: z.string().min(8).max(1400),
  approvalId: z.string().max(160).optional(),
  providerId: providerSchema.default("comfyui"),
  prompt: z.string().max(2500).optional(),
  scriptText: z.string().max(8000).optional(),
  sourceAssetId: z.string().max(160).optional(),
  contentId: z.string().max(160).optional(),
  aspectRatio: z.enum(["16:9", "9:16", "1:1", "4:5"]).default("16:9"),
  outputFormat: z.enum(["image/png", "image/webp", "text/vtt", "application/json"]).default("image/png"),
  estimatedRenderSeconds: z.coerce.number().int().min(1).max(600).default(45),
  estimatedGpuMinutes: z.coerce.number().min(0).max(60).default(0.8),
  tags: z.array(z.string().min(1).max(48)).max(12).default([]),
});

type ControlledRenderRequest = z.infer<typeof controlledRenderRequestSchema>;

const globalStore = globalThis as typeof globalThis & {
  folqenControlledMediaRuns?: ControlledRenderResult[];
  folqenControlledMediaUsage?: ControlledRenderUsage;
  folqenControlledMediaEmergency?: boolean;
};

const controlledRunStore = globalStore.folqenControlledMediaRuns ?? [];
const controlledUsage: ControlledRenderUsage = globalStore.folqenControlledMediaUsage ?? {
  runsToday: 0,
  activeRuns: 0,
  estimatedGpuMinutesToday: 0,
  failedRunsToday: 0,
};
globalStore.folqenControlledMediaRuns = controlledRunStore;
globalStore.folqenControlledMediaUsage = controlledUsage;

function jsonSafe(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "asset";
}

function defaultQuota(): ControlledRenderQuota {
  const env = getEnv();
  return {
    maxDailyRuns: env.MEDIA_RENDER_MAX_DAILY_RUNS,
    maxConcurrency: env.MEDIA_RENDER_MAX_CONCURRENCY,
    maxRenderSeconds: env.MEDIA_RENDER_MAX_SECONDS,
    maxEstimatedGpuMinutes: env.MEDIA_RENDER_MAX_ESTIMATED_GPU_MINUTES,
    maxQueueDepth: 12,
    maxAttempts: 1,
  };
}

function mediaExecutionEnabled() {
  return getEnv().ALLOW_CONTROLLED_MEDIA_EXECUTION && getEnv().LIVE_MEDIA_ACTIVATION_STAGE >= 1;
}

function renderKillSwitchEngaged() {
  return getEnv().MEDIA_RENDER_KILL_SWITCH || getEnv().MEDIA_RENDER_EMERGENCY_STOP || globalStore.folqenControlledMediaEmergency === true;
}

function providerConfigured(providerId: MediaProviderId) {
  const env = getEnv();
  if (providerId === "mock") return true;
  if (providerId === "comfyui") return Boolean(env.COMFYUI_BASE_URL?.trim());
  if (providerId === "ffmpeg") return Boolean(env.FFMPEG_PATH?.trim());
  if (providerId === "local_worker") return Boolean(env.LOCAL_WORKER_BASE_URL?.trim() && env.LOCAL_WORKER_SHARED_SECRET?.trim());
  return false;
}

function providerForWorkflow(input: ControlledRenderRequest): MediaProviderId {
  if (input.workflowKind === "subtitle_rendering") return "ffmpeg";
  if (input.workflowKind === "asset_validation" || input.workflowKind === "render_quality_scoring" || input.workflowKind === "asset_reflection") return "mock";
  if (input.workflowKind === "render_recovery") return input.providerId === "local_worker" ? "local_worker" : "ffmpeg";
  return input.providerId;
}

async function verifyRenderApproval(approvalId?: string) {
  if (!approvalId) {
    return { verified: false, status: "missing" as const, reason: "Approved media render approval ID is required." };
  }

  if (!hasDatabaseUrl()) {
    return { verified: false, status: "unavailable" as const, approvalId, reason: "Database approval verification is required before governed rendering." };
  }

  try {
    const approval = await getDb().approval.findUnique({ where: { id: approvalId } });
    if (!approval) return { verified: false, status: "missing" as const, approvalId, reason: "Approval record was not found." };
    if (approval.status !== ApprovalStatus.APPROVED) return { verified: false, status: approval.status.toLowerCase() as "pending" | "rejected" | "expired", approvalId, reason: `Approval status is ${approval.status}.` };
    if (!approval.type.includes("media_render")) return { verified: false, status: "approved" as const, approvalId, reason: "Approval is not scoped to governed media rendering." };
    return { verified: true, status: "approved" as const, approvalId, reason: "Media render approval verified." };
  } catch {
    return { verified: false, status: "unavailable" as const, approvalId, reason: "Approval verification failed." };
  }
}

async function evaluateRenderGovernance(input: ControlledRenderRequest): Promise<RenderGovernanceDecision> {
  const providerId = providerForWorkflow(input);
  const quota = defaultQuota();
  const reasons = new Set<string>();
  const controls = new Set<string>([
    "approval_required",
    "sandbox_fallback",
    "render_quota_guard",
    "gpu_budget_guard",
    "concurrency_guard",
    "timeout_guard",
    "queue_depth_guard",
    "provider_health_guard",
    "emergency_shutdown_guard",
    "no_autonomous_retries",
    "rollback_ready",
  ]);

  if (!mediaExecutionEnabled()) reasons.add("ALLOW_CONTROLLED_MEDIA_EXECUTION is disabled or live media activation stage is 0.");
  if (renderKillSwitchEngaged()) reasons.add("Media render kill switch or emergency stop is engaged.");
  if (!providerConfigured(providerId)) reasons.add(`${providerId} provider is not configured.`);
  if (controlledUsage.runsToday >= quota.maxDailyRuns) reasons.add("Daily render quota has been reached.");
  if (controlledUsage.activeRuns >= quota.maxConcurrency) reasons.add("Render concurrency limit has been reached.");
  if (input.estimatedRenderSeconds > quota.maxRenderSeconds) reasons.add("Estimated render duration exceeds the configured timeout.");
  if (input.estimatedGpuMinutes > quota.maxEstimatedGpuMinutes) reasons.add("Estimated GPU minutes exceed the render budget.");

  const queueHealth = await getQueueHealth();
  const mediaQueue = queueHealth.find((queue) => queue.name === ORCHESTRATION_QUEUES.media);
  const queueDepth = (mediaQueue?.waiting ?? 0) + (mediaQueue?.active ?? 0) + (mediaQueue?.delayed ?? 0);
  if (queueDepth > quota.maxQueueDepth) reasons.add("Media render queue depth exceeds the safety limit.");

  const policy = evaluateGovernancePolicy({
    actionType: "media_render",
    actorRole: "OPERATOR",
    providerId,
    approvalStatus: input.approvalId ? "approved" : "pending",
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
  if (reasonList.some((reason) => /kill switch|emergency/i.test(reason))) status = "kill_switch";
  if (reasonList.some((reason) => /budget|GPU minutes|duration|quota|concurrency|queue/i.test(reason))) status = "budget_blocked";
  if (reasonList.some((reason) => /not configured/i.test(reason))) status = "not_connected";

  return {
    allowed: reasonList.length === 0,
    status,
    reasons: reasonList,
    controls: Array.from(controls),
    quota: { ...quota, ...controlledUsage },
  };
}

function buildAsset(input: ControlledRenderRequest, providerId: MediaProviderId): MediaAssetPlan {
  const base = slug(`${input.workflowKind}-${input.objective}`);
  const mediaType = input.workflowKind === "subtitle_rendering" ? "subtitles" : input.workflowKind === "render_recovery" ? "render_output" : "thumbnail";
  return {
    id: `controlled_asset_${base}`,
    mediaType,
    title: `${controlledMediaWorkflowLabels[input.workflowKind]}: ${input.objective.slice(0, 90)}`,
    description: input.prompt || input.scriptText || "Governed controlled media execution packet.",
    format: input.outputFormat,
    aspectRatio: input.aspectRatio,
    storagePath: `controlled-media://${input.workflowKind}/${base}`,
    version: input.sourceAssetId ? 2 : 1,
    tags: Array.from(new Set(["controlled-render", input.workflowKind, ...input.tags])).slice(0, 12),
    status: "Needs approval",
    providerId,
    validation: {
      safe: true,
      warnings: ["Controlled execution packet only. No GPU job, ComfyUI request, FFmpeg command, binary write, or publishing call occurred."],
    },
  };
}

function buildValidation(input: ControlledRenderRequest): AssetValidationReport {
  const warnings: string[] = [];
  const malformedAsset = input.objective.trim().length < 12;
  const lowQuality = !input.prompt && !input.scriptText && !input.sourceAssetId;
  const unsafeAsset = /gore|blood|celebrity likeness|private person|copyrighted/i.test([input.prompt, input.scriptText, input.objective].filter(Boolean).join(" "));
  const duplicateRisk = Boolean(input.sourceAssetId && input.workflowKind === "structured_image_generation");
  const failedRender = input.workflowKind === "render_recovery";

  if (malformedAsset) warnings.push("Objective is too weak for a production render packet.");
  if (lowQuality) warnings.push("Render packet lacks prompt, script, or source asset context.");
  if (unsafeAsset) warnings.push("Unsafe or rights-sensitive visual instruction detected.");
  if (duplicateRisk) warnings.push("Source asset reuse creates duplicate visual risk.");
  if (failedRender) warnings.push("Render recovery workflow requires human inspection before any retry.");

  return {
    status: unsafeAsset || malformedAsset ? "failed" : warnings.length ? "warning" : "passed",
    malformedAsset,
    failedRender,
    lowQuality,
    duplicateRisk,
    unsafeAsset,
    warnings,
  };
}

function scoreAsset(validation: AssetValidationReport): RenderQualityScore {
  const penalty = validation.warnings.length * 8 + (validation.unsafeAsset ? 35 : 0) + (validation.malformedAsset ? 20 : 0) + (validation.lowQuality ? 18 : 0) + (validation.duplicateRisk ? 12 : 0);
  const qualityScore = Math.max(0, Math.min(100, 86 - penalty));
  const safetyScore = validation.unsafeAsset ? 35 : validation.status === "warning" ? 76 : 92;
  const score = {
    qualityScore,
    promptFitScore: validation.lowQuality ? 52 : 84,
    safetyScore,
    formatScore: validation.malformedAsset ? 58 : 88,
    uniquenessScore: validation.duplicateRisk ? 58 : 82,
  };
  const acceptance = validation.status === "failed" || qualityScore < 55 || safetyScore < 60 ? "rejected" : validation.status === "warning" ? "needs_review" : "accepted";
  return { ...score, acceptance };
}

function buildRenderPlan(input: ControlledRenderRequest, providerId: MediaProviderId, queueJobId: string, providerStatus: ControlledRenderResult["providerStatus"]): RenderPlan {
  return {
    renderId: `controlled_render_${slug(`${input.workflowKind}-${input.objective}`)}`,
    workflowKind: input.workflowKind === "subtitle_rendering" ? "subtitle_workflow" : input.workflowKind === "render_recovery" ? "rendering_workflow" : "thumbnail_workflow",
    status: "queued",
    queueJobId,
    attempts: 0,
    maxAttempts: 1,
    providerStatus,
    steps: [
      "verify_approval_id",
      "validate_render_quota",
      "validate_provider_health",
      "build_comfyui_or_ffmpeg_ready_packet",
      "validate_asset_contract",
      "score_render_quality",
      "capture_observability",
      "hold_for_human_review",
    ],
    logs: [
      `Controlled render packet prepared for ${providerId}.`,
      "No GPU job, ComfyUI request, FFmpeg command, binary write, public publishing, autonomous retry, or workflow mutation was executed.",
    ],
    retryPolicy: {
      enabled: true,
      backoffMs: 0,
      escalationAfterAttempts: 1,
    },
  };
}

async function persistControlledRender(input: ControlledRenderRequest, result: ControlledRenderResult, actorId?: string) {
  if (!hasDatabaseUrl()) return { persisted: false as const };

  try {
    const db = getDb();
    const asset = await db.asset.create({
      data: {
        contentId: input.contentId,
        type: `controlled_${result.asset.mediaType}`,
        name: result.asset.title,
        path: result.asset.storagePath,
        mimeType: result.asset.format,
        metadata: jsonSafe({
          source: "folqen_controlled_media_execution",
          workflowKind: result.workflowKind,
          validation: result.validation,
          scoring: result.scoring,
          governance: result.governance,
          safety: result.safety,
          liveRendering: false,
          binaryGenerated: false,
        }),
      },
    });

    await db.render.create({
      data: {
        contentId: input.contentId,
        status: result.status === "completed_sandbox" ? TaskStatus.COMPLETED : TaskStatus.FAILED,
        providerId: result.providerId,
        outputPath: result.asset.storagePath,
        logs: result.renderPlan.logs.join("\n"),
        metadata: jsonSafe({ ...result, persistedAssetId: asset.id }),
      },
    });

    await createAuditLog({
      actorId,
      action: `media.controlled_render.${result.status}`,
      target: result.runId,
      riskLevel: result.status === "completed_sandbox" ? "HIGH" : "MEDIUM",
      metadata: jsonSafe({ workflowKind: result.workflowKind, providerId: result.providerId, governance: result.governance, validation: result.validation }),
    });

    return { persisted: true as const };
  } catch {
    await createAuditLog({
      actorId,
      action: "media.controlled_render.persistence_failed",
      target: result.runId,
      riskLevel: "MEDIUM",
      metadata: jsonSafe({ workflowKind: result.workflowKind, providerId: result.providerId }),
    });
    return { persisted: false as const };
  }
}

export async function runControlledMediaRender(rawInput: unknown, actorId?: string): Promise<ControlledRenderResult> {
  const input = controlledRenderRequestSchema.parse(rawInput);
  const providerId = providerForWorkflow(input);
  const providerStatus = getMediaProviderStatuses().find((provider) => provider.id === providerId) ?? getMediaProviderStatuses()[0];
  const approvalVerification = await verifyRenderApproval(input.approvalId);
  const governance = await evaluateRenderGovernance(input);
  const reasons = new Set(governance.reasons);
  if (!approvalVerification.verified) reasons.add(approvalVerification.reason);
  const finalGovernance: RenderGovernanceDecision = {
    ...governance,
    allowed: governance.allowed && approvalVerification.verified,
    status: governance.allowed && approvalVerification.verified ? "allowed" : approvalVerification.verified ? governance.status : "needs_approval",
    reasons: Array.from(reasons),
  };

  const queue = await enqueueOrchestrationJob({
    queueName: ORCHESTRATION_QUEUES.media,
    name: `media.controlled_render.${input.workflowKind}`,
    data: {
      workflowKind: input.workflowKind,
      providerId,
      controlledRendering: true,
      liveRendering: false,
      approvalRequired: true,
      autonomousRetries: false,
    },
    options: { attempts: 1, removeOnComplete: 50, removeOnFail: 100 },
  });
  const asset = buildAsset(input, providerId);
  const validation = buildValidation(input);
  const scoring = scoreAsset(validation);
  const runId = `controlled_media_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const blockedByQuality = scoring.acceptance === "rejected";
  const result: ControlledRenderResult = {
    runId,
    workflowKind: input.workflowKind,
    status: finalGovernance.allowed && !blockedByQuality ? "completed_sandbox" : approvalVerification.verified && !blockedByQuality ? "blocked" : "waiting_for_approval",
    mode: finalGovernance.allowed && !blockedByQuality ? "sandbox" : "blocked",
    providerId,
    providerStatus,
    governance: finalGovernance,
    approvalVerification,
    queueJobId: queue.jobId,
    asset,
    renderPlan: buildRenderPlan(input, providerId, queue.jobId, providerStatus),
    validation,
    scoring,
    observability: {
      trace: [
        "Validated render request schema.",
        "Evaluated render governance, quotas, provider health, and approval status.",
        "Generated controlled ComfyUI/FFmpeg-ready execution packet.",
        "Validated and scored asset contract.",
        "Held output for human review; no live rendering executed.",
      ],
      queueLatencyMs: queue.mode === "mock" ? 0 : 1,
      renderDurationEstimateSeconds: input.estimatedRenderSeconds,
      estimatedGpuMinutes: input.estimatedGpuMinutes,
      budgetUtilizationPercent: Number(((input.estimatedGpuMinutes / Math.max(0.1, defaultQuota().maxEstimatedGpuMinutes)) * 100).toFixed(1)),
    },
    rollback: {
      available: true,
      steps: ["engage_media_render_shutdown", "disable_controlled_media_execution", "drain_media_queue", "quarantine_provider", "delete_unapproved_asset_metadata"],
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

  if (result.status === "completed_sandbox") {
    controlledUsage.runsToday += 1;
    controlledUsage.estimatedGpuMinutesToday += input.estimatedGpuMinutes;
  }
  if (result.status === "failed" || scoring.acceptance === "rejected") controlledUsage.failedRunsToday += 1;

  await emitOrchestrationEvent({
    type: `media.controlled_render.${result.status}`,
    severity: result.status === "completed_sandbox" ? "warning" : "warning",
    source: "media-pipeline",
    departmentId: "content",
    workflowRunId: runId,
    message: result.status === "completed_sandbox" ? "Controlled media render packet completed in sandbox mode." : "Controlled media render was blocked or needs approval.",
    metadata: { providerId, governance: finalGovernance, validation, scoring, queueJobId: queue.jobId, liveRendering: false },
  });

  const persistence = await persistControlledRender(input, result, actorId);
  result.persisted = persistence.persisted;
  controlledRunStore.unshift(result);
  controlledRunStore.splice(50);

  return result;
}

export function getControlledMediaRuns() {
  return controlledRunStore.slice(0, 12);
}

export async function getRenderGovernanceSnapshot(): Promise<RenderGovernanceDecision> {
  return evaluateRenderGovernance({
    workflowKind: "live_thumbnail_rendering",
    objective: "Evaluate controlled media rendering readiness.",
    providerId: "comfyui",
    aspectRatio: "16:9",
    outputFormat: "image/png",
    estimatedRenderSeconds: 45,
    estimatedGpuMinutes: 0.8,
    tags: [],
  });
}

export async function engageMediaRenderShutdown(reason = "Emergency controlled media render shutdown requested.", actorId?: string) {
  globalStore.folqenControlledMediaEmergency = true;
  const queue = await enqueueOrchestrationJob({
    queueName: ORCHESTRATION_QUEUES.media,
    name: "media.controlled_render.shutdown",
    data: { controlledRendering: false, queueDrain: true, reason, liveRendering: false },
  });

  await createAuditLog({
    actorId,
    action: "media.controlled_render.shutdown",
    target: "controlled_media_rendering",
    riskLevel: "CRITICAL",
    metadata: jsonSafe({ reason, queueJobId: queue.jobId, liveRendering: false }),
  });

  await emitOrchestrationEvent({
    type: "media.controlled_render.shutdown",
    severity: "critical",
    source: "media-pipeline",
    departmentId: "content",
    message: "Controlled media render shutdown engaged.",
    metadata: { reason, queueJobId: queue.jobId, liveRendering: false },
  });

  return { ok: true, mode: "rollback_to_safe_mode" as const, queueJobId: queue.jobId, message: "Controlled media rendering is shut down. Queue drain is planned and all live rendering remains disabled." };
}

export function resetControlledMediaEmergencyForTests() {
  globalStore.folqenControlledMediaEmergency = false;
}
