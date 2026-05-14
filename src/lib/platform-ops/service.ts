import { Prisma, TaskStatus } from "@prisma/client";
import { z } from "zod";

import { createAuditLog } from "@/lib/audit";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { emitOrchestrationEvent } from "@/lib/orchestration/event-bus";
import { enqueueOrchestrationJob, ORCHESTRATION_QUEUES } from "@/lib/orchestration/queue";
import { runPlatformOpsGraph } from "./flows";
import { getPlatformProviderStatuses } from "./providers";
import { platformProfiles, publishingWorkflows } from "./registry";
import type { AnalyticsIngestionPlan, DeploymentPlan, PlatformOperationInput, PlatformOperationResult, PlatformOpsDashboard } from "./types";

const workflowSchema = z.enum([
  "scheduled_publishing",
  "multi_platform_distribution",
  "publishing_retry_recovery",
  "failed_upload_recovery",
  "platform_adaptation",
  "analytics_collection",
  "engagement_monitoring",
]);

const platformSchema = z.enum(["YOUTUBE", "INSTAGRAM", "THREADS", "TIKTOK", "LINKEDIN", "X_TWITTER"]);

export const platformOperationSchema = z.object({
  workflowKind: workflowSchema,
  objective: z.string().min(8).max(1400),
  contentId: z.string().min(1).max(140).optional(),
  title: z.string().max(160).optional(),
  caption: z.string().max(5000).optional(),
  description: z.string().max(2500).optional(),
  hashtags: z.array(z.string().min(1).max(48)).max(40).default([]),
  platforms: z.array(platformSchema).min(1).max(6).default(["YOUTUBE", "INSTAGRAM", "THREADS"]),
  scheduledAt: z.string().datetime().optional(),
  assetIds: z.array(z.string().min(1).max(140)).max(12).default([]),
  approvalRequired: z.boolean().default(true),
});

export const platformRetrySchema = z.object({
  deploymentId: z.string().min(1).max(180),
  platform: platformSchema.default("YOUTUBE"),
  reason: z.string().min(3).max(700).default("Operator requested dry-run publishing recovery."),
});

const globalStore = globalThis as typeof globalThis & {
  folqenPlatformRuns?: PlatformOperationResult[];
  folqenPlatformDeployments?: DeploymentPlan[];
  folqenPlatformAnalyticsPlans?: AnalyticsIngestionPlan[];
};

const runStore = globalStore.folqenPlatformRuns ?? [];
const deploymentStore = globalStore.folqenPlatformDeployments ?? [];
const analyticsStore = globalStore.folqenPlatformAnalyticsPlans ?? [];
globalStore.folqenPlatformRuns = runStore;
globalStore.folqenPlatformDeployments = deploymentStore;
globalStore.folqenPlatformAnalyticsPlans = analyticsStore;

function jsonSafe(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function queueForWorkflow(workflowKind: PlatformOperationInput["workflowKind"]) {
  if (workflowKind === "scheduled_publishing") return ORCHESTRATION_QUEUES.scheduling;
  if (workflowKind === "publishing_retry_recovery" || workflowKind === "failed_upload_recovery") return ORCHESTRATION_QUEUES.publishingRetry;
  return ORCHESTRATION_QUEUES.publishing;
}

function isMissingTableError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2021";
}

async function persistPlatformRun(input: Required<PlatformOperationInput>, result: PlatformOperationResult, actorId?: string) {
  if (!hasDatabaseUrl()) {
    return { persisted: false as const, reason: "DATABASE_URL is not configured." };
  }

  try {
    const db = getDb();
    const workflowRun = await db.workflowRun.create({
      data: {
        providerId: result.providerStatus.id,
        workflowId: `platform_ops.${result.workflowKind}`,
        status: TaskStatus.QUEUED,
        input: jsonSafe(input),
        output: jsonSafe({
          ...result,
          persisted: true,
          publicPublishing: false,
          accountAutomation: false,
          scraping: false,
        }),
        logs: result.deployments.flatMap((deployment) => deployment.logs).join("\n"),
      },
    });

    await db.agentTask.create({
      data: {
        title: `Platform Ops: ${result.workflowKind.replaceAll("_", " ")}`,
        description: `Dry-run deployment plan for ${result.platforms.join(", ")}.`,
        status: TaskStatus.QUEUED,
        riskLevel: result.approvalCheckpoint.riskLevel === "high" ? "HIGH" : "MEDIUM",
        contentId: input.contentId,
        metadata: jsonSafe({
          source: "folqen_platform_ops",
          workflowRunId: workflowRun.id,
          queueJobIds: result.queueJobIds,
          publicPublishing: "blocked",
          approvalCheckpoint: result.approvalCheckpoint,
        }),
      },
    });

    if (result.workflowKind === "analytics_collection" || result.workflowKind === "engagement_monitoring") {
      await db.analyticsRecord.create({
        data: {
          platform: null,
          metric: `platform_ops.${result.workflowKind}`,
          value: result.platforms.length,
          period: "dry_run",
          metadata: jsonSafe({
            source: "folqen_platform_ops",
            workflowRunId: workflowRun.id,
            metrics: result.analyticsPlan.metrics,
            liveIngestion: false,
          }),
        },
      });
    }

    await createAuditLog({
      actorId,
      action: "platform_ops.pipeline_planned",
      target: result.runId,
      riskLevel: result.approvalCheckpoint.riskLevel === "high" ? "HIGH" : "MEDIUM",
      metadata: jsonSafe({
        workflowKind: result.workflowKind,
        platforms: result.platforms,
        queueJobIds: result.queueJobIds,
        publicPublishing: false,
        liveCredentials: false,
      }),
    });

    return { persisted: true as const };
  } catch (error) {
    if (isMissingTableError(error)) {
      return { persisted: false as const, reason: "Existing workflow tables are not available in this database." };
    }
    return { persisted: false as const, reason: "Platform operations persistence failed; dry-run result remains in memory." };
  }
}

export async function runPlatformOperation(rawInput: unknown, actorId?: string): Promise<PlatformOperationResult> {
  const input = platformOperationSchema.parse(rawInput) as Required<PlatformOperationInput>;
  const { result: graphResult } = await runPlatformOpsGraph(input);
  const queueName = queueForWorkflow(input.workflowKind);
  const queueJobs = await Promise.all(
    graphResult.deployments.map((deployment) =>
      enqueueOrchestrationJob({
        queueName,
        name: `platform_ops.${input.workflowKind}.${deployment.platform.toLowerCase()}`,
        data: {
          workflowKind: input.workflowKind,
          platform: deployment.platform,
          deploymentId: deployment.deploymentId,
          mockSafe: true,
          publicPublishing: false,
          accountAutomation: false,
        },
        options: {
          attempts: deployment.retryPolicy.maxAttempts,
          backoff: { type: "exponential", delay: deployment.retryPolicy.backoffMs },
          delay: input.workflowKind === "scheduled_publishing" ? 1_000 : undefined,
        },
      }),
    ),
  );

  const deployments = graphResult.deployments.map((deployment, index) => ({
    ...deployment,
    queueJobId: queueJobs[index]?.jobId ?? "missing_mock_job",
  }));

  const event = await emitOrchestrationEvent({
    type: `platform_ops.${input.workflowKind}.planned`,
    severity: graphResult.status === "blocked" ? "warning" : "info",
    source: "platform-operations",
    departmentId: "platform_operations",
    workflowRunId: graphResult.runId,
    message: `Platform operations workflow planned: ${input.workflowKind}.`,
    metadata: {
      platforms: graphResult.platforms,
      queueJobIds: queueJobs.map((job) => job.jobId),
      publicPublishing: false,
      accountAutomation: false,
    },
  });

  const result: PlatformOperationResult = {
    ...graphResult,
    deployments,
    queueJobIds: queueJobs.map((job) => job.jobId),
    eventId: event.id,
    persisted: false,
    createdAt: new Date().toISOString(),
  };

  const persistence = await persistPlatformRun(input, result, actorId);
  result.persisted = persistence.persisted;

  runStore.unshift(result);
  deploymentStore.unshift(...result.deployments);
  analyticsStore.unshift(result.analyticsPlan);
  runStore.splice(50);
  deploymentStore.splice(120);
  analyticsStore.splice(80);

  return result;
}

export async function retryPublishing(rawInput: unknown, actorId?: string) {
  const input = platformRetrySchema.parse(rawInput);
  const queue = await enqueueOrchestrationJob({
    queueName: ORCHESTRATION_QUEUES.publishingRetry,
    name: `platform_ops.retry.${input.platform.toLowerCase()}`,
    data: {
      deploymentId: input.deploymentId,
      platform: input.platform,
      reason: input.reason,
      mockSafe: true,
      publicPublishing: false,
    },
  });

  const retryPlan: DeploymentPlan = {
    deploymentId: input.deploymentId,
    platform: input.platform,
    status: "failed_recoverable",
    queueJobId: queue.jobId,
    scheduledAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    retryPolicy: {
      enabled: true,
      maxAttempts: 3,
      backoffMs: 20_000,
      escalationAfterAttempts: 3,
    },
    recoverySteps: ["inspect_previous_failure", "verify_no_duplicate_post", "fallback_to_manual_package", "request_human_approval_before_live_retry"],
    logs: ["Publishing retry planned in dry-run mode.", "No platform account, credential, browser automation, scraping, or upload API was used.", input.reason],
  };

  deploymentStore.unshift(retryPlan);
  deploymentStore.splice(120);

  await emitOrchestrationEvent({
    type: "platform_ops.retry.planned",
    severity: "warning",
    source: "platform-operations",
    departmentId: "platform_operations",
    message: "Publishing retry recovery was planned in dry-run mode.",
    metadata: { deploymentId: input.deploymentId, platform: input.platform, queueJobId: queue.jobId, publicPublishing: false },
  });

  await createAuditLog({
    actorId,
    action: "platform_ops.retry_planned",
    target: input.deploymentId,
    riskLevel: "MEDIUM",
    metadata: jsonSafe({ platform: input.platform, reason: input.reason, publicPublishing: false, queueJobId: queue.jobId }),
  });

  return {
    ok: true,
    mode: "dry_run" as const,
    retryPlan,
    message: "Publishing retry planned without public posting. Manual package fallback remains active.",
  };
}

async function listPersistedDeployments(limit = 12): Promise<DeploymentPlan[]> {
  if (!hasDatabaseUrl()) return [];

  try {
    const rows = await getDb().workflowRun.findMany({
      where: { workflowId: { startsWith: "platform_ops." } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return rows.flatMap((row) => {
      const output = (row.output ?? {}) as unknown as { deployments?: DeploymentPlan[] };
      return (output.deployments ?? []).map((deployment) => ({ ...deployment, queueJobId: deployment.queueJobId ?? row.id }));
    });
  } catch {
    return [];
  }
}

export async function getPlatformOpsDashboard(): Promise<PlatformOpsDashboard> {
  const persistedDeployments = await listPersistedDeployments();
  const recentDeployments = [...persistedDeployments, ...deploymentStore]
    .filter((deployment, index, all) => all.findIndex((candidate) => candidate.deploymentId === deployment.deploymentId && candidate.queueJobId === deployment.queueJobId) === index)
    .slice(0, 12);

  return {
    platforms: platformProfiles,
    workflows: publishingWorkflows,
    providers: getPlatformProviderStatuses(),
    recentDeployments,
    failedDeployments: recentDeployments.filter((deployment) => deployment.status === "failed_recoverable"),
    analyticsPlans: analyticsStore.slice(0, 8),
    monetization: {
      status: "Mock",
      copyrightIncidents: "manual_review_required",
      platformWarnings: "manual_review_required",
      strikeMonitoring: "not_connected",
      policyMonitoring: "mock_watchlist",
    },
    observability: {
      mode: "mock_safe",
      publicPublishing: "blocked",
      accountAutomation: "blocked",
      scraping: "blocked",
      credentials: "not_connected",
    },
  };
}

export function getPlatformOpsCapabilities() {
  return {
    platforms: platformProfiles,
    workflows: publishingWorkflows,
    providers: getPlatformProviderStatuses(),
    safety: {
      publicPublishing: "blocked",
      accountAutomation: "blocked",
      liveCredentials: "not_connected",
      scraping: "blocked",
      tiktokIndiaDependency: "blocked",
    },
  };
}
