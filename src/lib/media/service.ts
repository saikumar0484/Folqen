import { Prisma, TaskStatus } from "@prisma/client";
import { z } from "zod";

import { createAuditLog } from "@/lib/audit";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { emitOrchestrationEvent } from "@/lib/orchestration/event-bus";
import { enqueueOrchestrationJob, ORCHESTRATION_QUEUES } from "@/lib/orchestration/queue";
import { getControlledMediaRuns, getRenderGovernanceSnapshot } from "./controlled-rendering";
import { runMediaGraph } from "./flows";
import { mediaTypes, mediaWorkflows } from "./registry";
import { getMediaProviderStatuses } from "./providers";
import type { MediaAssetPlan, MediaDashboard, MediaGenerationInput, MediaPipelineResult, RenderPlan } from "./types";

const mediaWorkflowSchema = z.enum([
  "thumbnail_workflow",
  "shorts_visual_workflow",
  "script_to_scene_workflow",
  "asset_adaptation_workflow",
  "rendering_workflow",
  "subtitle_workflow",
  "asset_optimization_workflow",
]);

const mediaTypeSchema = z.enum(["thumbnail", "shorts_visual", "video_clip", "subtitles", "cover_image", "platform_variant", "asset_template", "render_output"]);
const platformSchema = z.enum(["YOUTUBE", "INSTAGRAM", "FACEBOOK", "SNAPCHAT", "THREADS"]);

export const mediaGenerationSchema = z.object({
  workflowKind: mediaWorkflowSchema,
  objective: z.string().min(8).max(1200),
  mediaType: mediaTypeSchema.optional(),
  contentId: z.string().min(1).max(140).optional(),
  sourceAssetId: z.string().min(1).max(140).optional(),
  platform: platformSchema.default("YOUTUBE"),
  prompt: z.string().max(2500).optional(),
  scriptText: z.string().max(8000).optional(),
  aspectRatio: z.enum(["16:9", "9:16", "1:1", "4:5"]).default("9:16"),
  durationSeconds: z.coerce.number().int().min(1).max(600).default(45),
  tags: z.array(z.string().min(1).max(48)).default([]),
  approvalRequired: z.boolean().default(true),
});

export const renderRetrySchema = z.object({
  renderId: z.string().min(1).max(160),
  reason: z.string().min(3).max(600).default("Retry requested from media operations."),
});

const globalStore = globalThis as typeof globalThis & {
  folqenMediaRuns?: MediaPipelineResult[];
  folqenMediaAssets?: MediaAssetPlan[];
  folqenMediaRenders?: RenderPlan[];
};

const runStore = globalStore.folqenMediaRuns ?? [];
const assetStore = globalStore.folqenMediaAssets ?? [];
const renderStore = globalStore.folqenMediaRenders ?? [];
globalStore.folqenMediaRuns = runStore;
globalStore.folqenMediaAssets = assetStore;
globalStore.folqenMediaRenders = renderStore;

function jsonSafe(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function toAssetType(mediaType: string) {
  return `media_${mediaType}`;
}

function isMissingTableError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2021";
}

async function persistMediaRun(input: Required<MediaGenerationInput>, result: MediaPipelineResult, actorId?: string) {
  if (!hasDatabaseUrl()) {
    return { persisted: false as const, reason: "DATABASE_URL is not configured." };
  }

  try {
    const db = getDb();
    const createdAssets = await Promise.all(
      result.assets.map((asset) =>
        db.asset.create({
          data: {
            contentId: input.contentId,
            type: toAssetType(asset.mediaType),
            name: asset.title,
            path: asset.storagePath,
            mimeType: asset.format,
            metadata: jsonSafe({
              source: "folqen_media_pipeline",
              runId: result.runId,
              workflowKind: result.workflowKind,
              version: asset.version,
              tags: asset.tags,
              validation: asset.validation,
              liveRendering: false,
              publicPublishing: "blocked",
            }),
          },
        }),
      ),
    );

    await db.render.create({
      data: {
        contentId: input.contentId,
        status: TaskStatus.QUEUED,
        providerId: result.providerStatus.id,
        outputPath: `mock-render://${result.runId}`,
        logs: result.renderPlan.logs.join("\n"),
        metadata: jsonSafe({
          runId: result.runId,
          workflowKind: result.workflowKind,
          renderPlan: result.renderPlan,
          assetIds: createdAssets.map((asset) => asset.id),
          dryRun: true,
          liveRendering: false,
        }),
      },
    });

    await createAuditLog({
      actorId,
      action: "media.pipeline_planned",
      target: result.runId,
      riskLevel: result.status === "blocked" ? "MEDIUM" : "LOW",
      metadata: jsonSafe({ workflowKind: result.workflowKind, providerStatus: result.providerStatus.status, liveRendering: false }),
    });

    return { persisted: true as const };
  } catch (error) {
    if (isMissingTableError(error)) {
      return { persisted: false as const, reason: "Existing media tables are not available in this database." };
    }
    return { persisted: false as const, reason: "Media persistence failed; dry-run result remains available." };
  }
}

export async function runMediaPipeline(rawInput: unknown, actorId?: string): Promise<MediaPipelineResult> {
  const input = mediaGenerationSchema.parse(rawInput) as Required<MediaGenerationInput>;
  const { result: graphResult } = await runMediaGraph(input);
  const queue = await enqueueOrchestrationJob({
    queueName: ORCHESTRATION_QUEUES.media,
    name: `media.${input.workflowKind}`,
    data: {
      workflowKind: input.workflowKind,
      mediaType: graphResult.mediaType,
      mockSafe: true,
      liveRendering: false,
    },
    options: {
      attempts: graphResult.renderPlan.maxAttempts,
      backoff: { type: "exponential", delay: graphResult.renderPlan.retryPolicy.backoffMs },
    },
  });

  const event = await emitOrchestrationEvent({
    type: `media.${input.workflowKind}.planned`,
    severity: graphResult.status === "blocked" ? "warning" : "info",
    source: "media-pipeline",
    departmentId: "content",
    workflowRunId: graphResult.runId,
    message: `Media pipeline planned: ${input.workflowKind}.`,
    metadata: {
      providerStatus: graphResult.providerStatus.status,
      mediaType: graphResult.mediaType,
      liveRendering: false,
      queueJobId: queue.jobId,
    },
  });

  const result: MediaPipelineResult = {
    ...graphResult,
    queueJobId: queue.jobId,
    renderPlan: {
      ...graphResult.renderPlan,
      queueJobId: queue.jobId,
      status: "queued",
    },
    eventId: event.id,
    persisted: false,
    createdAt: new Date().toISOString(),
  };

  const persistence = await persistMediaRun(input, result, actorId);
  result.persisted = persistence.persisted;

  runStore.unshift(result);
  assetStore.unshift(...result.assets);
  renderStore.unshift(result.renderPlan);
  runStore.splice(50);
  assetStore.splice(100);
  renderStore.splice(100);

  return result;
}

export async function retryRender(rawInput: unknown, actorId?: string) {
  const input = renderRetrySchema.parse(rawInput);
  const queue = await enqueueOrchestrationJob({
    queueName: ORCHESTRATION_QUEUES.media,
    name: "media.render.retry",
    data: {
      renderId: input.renderId,
      reason: input.reason,
      mockSafe: true,
      liveRendering: false,
    },
  });
  const retryPlan: RenderPlan = {
    renderId: input.renderId,
    workflowKind: "rendering_workflow",
    status: "failed_recoverable",
    queueJobId: queue.jobId,
    attempts: 1,
    maxAttempts: 3,
    providerStatus: getMediaProviderStatuses().find((provider) => provider.id === "ffmpeg") ?? getMediaProviderStatuses()[0],
    steps: ["inspect_failure", "validate_idempotency", "requeue_dry_run", "escalate_if_live_provider_needed"],
    logs: [
      "Retry request captured in mock-safe mode.",
      "No FFmpeg command, GPU job, file write, or provider call was executed.",
      input.reason,
    ],
    retryPolicy: {
      enabled: true,
      backoffMs: 15_000,
      escalationAfterAttempts: 3,
    },
  };

  renderStore.unshift(retryPlan);
  renderStore.splice(100);

  await emitOrchestrationEvent({
    type: "media.render.retry_planned",
    severity: "warning",
    source: "media-pipeline",
    departmentId: "content",
    message: "Render retry was planned in dry-run mode.",
    metadata: { renderId: input.renderId, queueJobId: queue.jobId, liveRendering: false },
  });

  await createAuditLog({
    actorId,
    action: "media.render_retry_planned",
    target: input.renderId,
    riskLevel: "LOW",
    metadata: jsonSafe({ reason: input.reason, liveRendering: false, queueJobId: queue.jobId }),
  });

  return {
    ok: true,
    mode: "dry_run" as const,
    retryPlan,
    message: "Render retry planned without live rendering. Escalate before any real FFmpeg or ComfyUI execution.",
  };
}

async function listPersistedMediaAssets(limit = 12): Promise<MediaAssetPlan[]> {
  if (!hasDatabaseUrl()) return [];

  try {
    const rows = await getDb().asset.findMany({
      where: { type: { startsWith: "media_" } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return rows.map((row) => {
      const metadata = (row.metadata ?? {}) as Record<string, unknown>;
      const validation = metadata.validation as MediaAssetPlan["validation"] | undefined;
      return {
        id: row.id,
        mediaType: row.type.replace(/^media_/, "") as MediaAssetPlan["mediaType"],
        title: row.name,
        description: String(metadata.workflowKind ?? "Stored media pipeline asset"),
        format: row.mimeType ?? "application/json",
        aspectRatio: String(metadata.aspectRatio ?? "9:16"),
        storagePath: row.path,
        version: Number(metadata.version ?? 1),
        tags: Array.isArray(metadata.tags) ? metadata.tags.map(String) : [],
        status: "Mock",
        providerId: "mock",
        validation: validation ?? { safe: true, warnings: ["Stored metadata-only media asset."] },
      };
    });
  } catch {
    return [];
  }
}

export async function getMediaDashboard(): Promise<MediaDashboard> {
  const persistedAssets = await listPersistedMediaAssets();
  const recentAssets = [...persistedAssets, ...assetStore].filter((asset, index, all) => all.findIndex((candidate) => candidate.id === asset.id) === index).slice(0, 12);
  const renderQueue = renderStore.slice(0, 8);

  return {
    workflows: mediaWorkflows,
    providers: getMediaProviderStatuses(),
    recentAssets,
    renderQueue,
    failedRenders: renderQueue.filter((render) => render.status === "failed_recoverable"),
    controlledRenders: getControlledMediaRuns(),
    renderGovernance: await getRenderGovernanceSnapshot(),
    observability: {
      mode: "mock_safe",
      liveRendering: "blocked",
      gpuExecution: "blocked",
      publicPublishing: "blocked",
    },
  };
}

export function getMediaCapabilities() {
  return {
    mediaTypes,
    workflows: mediaWorkflows,
    providers: getMediaProviderStatuses(),
    safety: {
      liveComfyUI: "blocked",
      liveFfmpeg: "blocked",
      gpuRequired: false,
      automaticPublishing: "blocked",
    },
  };
}
