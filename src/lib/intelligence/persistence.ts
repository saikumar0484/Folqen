import { Prisma, TaskStatus, ContentStatus, PlatformName, ReviewStatus, RiskLevel } from "@prisma/client";

import { createAuditLog } from "@/lib/audit";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { emitOrchestrationEvent } from "@/lib/orchestration/event-bus";
import type { IntelligenceRunInput, IntelligenceRunResult } from "./types";

function jsonSafe(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function toPlatformNames(platforms: string[]) {
  return platforms.filter((platform): platform is PlatformName => Object.values(PlatformName).includes(platform as PlatformName));
}

export async function persistIntelligenceRun(input: Required<IntelligenceRunInput>, result: IntelligenceRunResult, actorId?: string) {
  await emitOrchestrationEvent({
    type: `intelligence.${result.workflowKind}.completed`,
    severity: result.status === "blocked" ? "warning" : "info",
    source: "intelligence-layer",
    departmentId: result.departmentId,
    workflowRunId: result.runId,
    message: `Intelligence workflow completed: ${result.workflowKind}.`,
    metadata: {
      providerStatus: result.providerStatus.status,
      assignedAgents: result.assignedAgents,
      confidence: result.confidence,
      approvalStatus: result.approvalCheckpoint.status,
    },
  });

  if (!hasDatabaseUrl()) {
    return { persisted: false as const, reason: "DATABASE_URL is not configured." };
  }

  const db = getDb();
  const payload = { input, result };

  await db.workflowRun.create({
    data: {
      id: result.runId,
      providerId: result.providerStatus.id,
      workflowId: result.workflowKind,
      status: result.status === "blocked" ? TaskStatus.FAILED : TaskStatus.COMPLETED,
      input: jsonSafe(input),
      output: jsonSafe(result),
      logs: result.graphTrace.join("\n"),
    },
  });

  await db.agentTask.create({
    data: {
      title: `Intelligence workflow: ${result.workflowKind}`,
      description: input.objective,
      status: result.status === "blocked" ? TaskStatus.FAILED : TaskStatus.COMPLETED,
      riskLevel: result.approvalCheckpoint.riskLevel.toUpperCase() as RiskLevel,
      metadata: jsonSafe(payload),
    },
  });

  await db.analyticsRecord.create({
    data: {
      platform: toPlatformNames(input.platforms)[0],
      metric: `intelligence_confidence_${result.workflowKind}`,
      value: result.confidence,
      period: "workflow_run",
      metadata: jsonSafe({ runId: result.runId, scores: result.rankedItems.map((item) => item.score) }),
    },
  });

  await createAuditLog({
    actorId,
    action: `intelligence.${result.workflowKind}.run`,
    target: result.runId,
    riskLevel: result.status === "blocked" ? "MEDIUM" : "LOW",
    metadata: jsonSafe({
      provider: result.providerStatus.id,
      providerStatus: result.providerStatus.status,
      publicPublishing: "blocked",
      paidTools: "blocked",
    }),
  });

  return { persisted: true as const, workflowRunId: result.runId };
}

export async function persistContentPackage(input: Required<IntelligenceRunInput>, result: IntelligenceRunResult, actorId?: string) {
  if (!hasDatabaseUrl()) {
    return { persisted: false as const, contentId: undefined, reason: "DATABASE_URL is not configured." };
  }

  const db = getDb();
  const title = result.rankedItems[0]?.title.replace(/^[^:]+:\s*/, "") || input.seedTopics[0] || input.objective;
  const platforms = toPlatformNames(input.platforms);

  const content = await db.contentItem.create({
    data: {
      title,
      format: "short_vertical_video",
      status: ContentStatus.DRAFT,
      reviewStatus: ReviewStatus.PENDING,
      safetyStatus: ReviewStatus.PENDING,
      copyrightStatus: ReviewStatus.PENDING,
      platformTargets: platforms.length > 0 ? platforms : [PlatformName.YOUTUBE, PlatformName.INSTAGRAM, PlatformName.FACEBOOK],
      metadata: jsonSafe({
        source: "folqen_intelligence_layer",
        workflowRunId: result.runId,
        liveAiProvider: false,
        publicPublishing: "blocked",
        paidTools: "blocked",
        recommendations: result.recommendations,
        risks: result.risks,
      }),
      assets: {
        create: result.draftArtifacts.map((artifact) => ({
          type: artifact.type,
          name: artifact.title,
          path: `manual-intelligence://${result.runId}/${artifact.type}`,
          mimeType: "application/json",
          metadata: jsonSafe(artifact),
        })),
      },
      approvals: {
        create: {
          type: "content_intelligence_review",
          title: `Review intelligence package: ${title}`,
          status: "PENDING",
          riskLevel: "MEDIUM",
          reason: "Human review is required before public use, paid provider execution, rendering, or publishing.",
          requestedBy: "folqen_intelligence_layer",
          payload: jsonSafe({ workflowRunId: result.runId, approvalCheckpoint: result.approvalCheckpoint }),
        },
      },
    },
  });

  await createAuditLog({
    actorId,
    action: "intelligence.content_package_created",
    target: content.id,
    riskLevel: "LOW",
    metadata: jsonSafe({ workflowRunId: result.runId, publicPublishing: "blocked", paidTools: "blocked" }),
  });

  return { persisted: true as const, contentId: content.id };
}

export async function listPersistedIntelligenceRuns(limit = 12) {
  if (!hasDatabaseUrl()) {
    return [];
  }

  return getDb().workflowRun.findMany({
    where: {
      workflowId: {
        in: [
          "trend_discovery",
          "competitor_analysis",
          "viral_opportunity",
          "topic_selection",
          "hook_optimization",
          "script_generation",
          "thumbnail_planning",
          "metadata_optimization",
        ],
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
