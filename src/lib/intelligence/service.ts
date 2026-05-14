import { z } from "zod";

import { captureWorkflowMemory } from "@/lib/orchestration/memory-hooks";
import { enqueueOrchestrationJob, ORCHESTRATION_QUEUES } from "@/lib/orchestration/queue";
import { getIntelligenceDepartments, intelligenceWorkflows } from "./agents";
import { persistContentPackage, persistIntelligenceRun, listPersistedIntelligenceRuns } from "./persistence";
import { listIntelligenceProviders } from "./providers";
import { runIntelligenceGraph } from "./workflows";
import type { IntelligenceDepartmentId, IntelligenceRunResult, IntelligenceWorkflowKind } from "./types";

const platformSchema = z.enum(["YOUTUBE", "INSTAGRAM", "FACEBOOK", "SNAPCHAT", "THREADS", "SUBSTACK", "LINKEDIN", "BLUESKY", "LEMON8", "KICK"]);

export const intelligenceRunInputSchema = z.object({
  workflowKind: z.enum([
    "trend_discovery",
    "competitor_analysis",
    "viral_opportunity",
    "topic_selection",
    "hook_optimization",
    "script_generation",
    "thumbnail_planning",
    "metadata_optimization",
  ]),
  objective: z.string().min(10).max(2000),
  region: z.string().min(2).max(80).default("India"),
  brandContext: z.string().min(3).max(160).default("Urban legends / mystery / folklore"),
  platforms: z.array(platformSchema).default(["YOUTUBE", "INSTAGRAM", "FACEBOOK"]),
  seedTopics: z.array(z.string().min(1).max(140)).default([]),
  competitors: z.array(z.string().min(1).max(140)).default([]),
  audienceNotes: z.array(z.string().min(1).max(300)).default([]),
  sourceReferences: z.array(z.string().min(1).max(500)).default([]),
  approvalRequired: z.boolean().default(true),
  providerId: z.enum(["mock", "openrouter", "gemini"]).default("mock"),
});

export function getIntelligenceOverview() {
  return {
    departments: getIntelligenceDepartments(),
    workflows: intelligenceWorkflows,
    providers: listIntelligenceProviders(),
    safety: {
      executionMode: "mock_safe",
      publicPublishing: "blocked",
      paidTools: "blocked",
      scraping: "blocked",
      providerExecution: "blocked_unless_future_approved",
    },
  };
}

export async function runIntelligenceWorkflow(rawInput: unknown, options: { actorId?: string; requiredDepartment?: IntelligenceDepartmentId } = {}) {
  const input = intelligenceRunInputSchema.parse(rawInput);
  const workflow = intelligenceWorkflows.find((candidate) => candidate.kind === input.workflowKind);

  if (!workflow) {
    throw new Error(`Unknown intelligence workflow: ${input.workflowKind}`);
  }

  if (options.requiredDepartment && workflow.departmentId !== options.requiredDepartment) {
    throw new Error(`Workflow ${input.workflowKind} does not belong to the ${options.requiredDepartment} department.`);
  }

  const { input: normalized, result: graphResult } = await runIntelligenceGraph(input);
  const queue = await enqueueOrchestrationJob({
    queueName: ORCHESTRATION_QUEUES.workflows,
    name: `intelligence.${input.workflowKind}`,
    data: {
      workflowKind: input.workflowKind,
      departmentId: workflow.departmentId,
      runId: graphResult.runId,
      mockSafe: true,
    },
  });

  const result: IntelligenceRunResult = {
    ...graphResult,
    queueJobId: queue.jobId,
    memoryCaptureStatus: "captured",
    createdAt: new Date().toISOString(),
  };

  await persistIntelligenceRun(normalized, result, options.actorId);
  await captureWorkflowMemory({
    id: result.runId,
    name: workflow.name,
    objective: normalized.objective,
    departmentId: result.departmentId,
    status: result.status === "blocked" ? "blocked" : result.status === "completed" ? "completed" : "waiting_for_approval",
    assignedAgents: result.assignedAgents,
    steps: workflow.ownerAgentIds,
    approvalCheckpoint: {
      id: result.approvalCheckpoint.id,
      reason: result.approvalCheckpoint.reason,
      riskLevel: result.approvalCheckpoint.riskLevel,
      requiredRole: "owner",
      status: result.approvalCheckpoint.status === "pending" ? "pending" : "not_required",
    },
    correlationId: result.runId,
    graphTrace: result.graphTrace,
    crewPlan: ["Research and Content intelligence run is coordinated through the mock-safe department layer."],
    queueJobId: result.queueJobId,
    createdAt: result.createdAt,
  });

  return result;
}

export async function createIntelligenceContentPackage(rawInput: unknown, actorId?: string) {
  const input = intelligenceRunInputSchema.parse({
    ...((rawInput ?? {}) as Record<string, unknown>),
    workflowKind: "script_generation" satisfies IntelligenceWorkflowKind,
    approvalRequired: true,
  });
  const result = await runIntelligenceWorkflow(input, { actorId, requiredDepartment: "content" });
  const packagePersistence = await persistContentPackage(
    {
      ...input,
      region: input.region,
      brandContext: input.brandContext,
      platforms: input.platforms,
      seedTopics: input.seedTopics,
      competitors: input.competitors,
      audienceNotes: input.audienceNotes,
      sourceReferences: input.sourceReferences,
      approvalRequired: input.approvalRequired,
      providerId: input.providerId,
    },
    result,
    actorId,
  );

  return {
    result,
    package: {
      status: packagePersistence.persisted ? "created" : "metadata_only",
      contentId: packagePersistence.contentId,
      message: packagePersistence.persisted
        ? "Draft content package created with review approval. No publishing or paid AI execution happened."
        : "Content package preview generated; database persistence is not connected.",
    },
  };
}

export async function getIntelligenceDashboard(departmentId?: IntelligenceDepartmentId) {
  const overview = getIntelligenceOverview();
  const runs = await listPersistedIntelligenceRuns(12);
  const departments = departmentId ? overview.departments.filter((department) => department.id === departmentId) : overview.departments;

  return {
    ...overview,
    departments,
    runs: runs.map((run) => ({
      id: run.id,
      workflowId: run.workflowId,
      status: run.status,
      providerId: run.providerId,
      createdAt: run.createdAt.toISOString(),
      output: run.output,
    })),
  };
}
