import { Prisma, RiskLevel, TaskStatus } from "@prisma/client";
import { z } from "zod";

import { evaluateAiBudget } from "@/lib/ai-gateway/budget";
import { normalizeAiGatewayInput } from "@/lib/ai-gateway/flows";
import { getAiProviderProfile, getAiProviderProfiles } from "@/lib/ai-gateway/providers";
import { validateAiResponse } from "@/lib/ai-gateway/validation";
import { createAuditLog } from "@/lib/audit";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { evaluateGovernancePolicy } from "@/lib/governance/policy-engine";
import { searchMemory } from "@/lib/memory/service";
import { emitOrchestrationEvent } from "@/lib/orchestration/event-bus";
import { enqueueOrchestrationJob, ORCHESTRATION_QUEUES } from "@/lib/orchestration/queue";
import type { DepartmentId } from "@/lib/orchestration/types";
import { getMutationSafetyError } from "@/lib/security/request-guards";
import { executeLiveProvider } from "./adapters";
import {
  analyticsDataSourceKinds,
  analyticsOperationalResponseSchema,
  analyticsOutputWarnings,
  buildAnalyticsOperationsPrompt,
  buildAnalyticsOperationsSystemPrompt,
  LIVE_ANALYTICS_OPERATIONAL_CAPABILITY,
  liveAnalyticsWorkflowKinds,
  parseAnalyticsOperationsJson,
  scoreAnalyticsOutput,
  type AnalyticsMemoryContextItem,
} from "./analytics-operations";
import { defaultRuntimeQuota, FIRST_LIVE_TARGET, getConfiguredActivationStage, isLiveExecutionFlagEnabled, isRuntimeKillSwitchEnabled } from "./config";
import {
  buildContentOperationsPrompt,
  buildContentOperationsSystemPrompt,
  contentOperationalResponseSchema,
  contentOutputWarnings,
  contentPlatformTargets,
  LIVE_CONTENT_OPERATIONAL_CAPABILITY,
  liveContentWorkflowKinds,
  parseContentOperationsJson,
  scoreContentOutput,
  type ContentMemoryContextItem,
} from "./content-operations";
import { buildResearchIdeationPrompt, buildResearchIdeationSystemPrompt, LIVE_RESEARCH_IDEATION_CAPABILITY, parseResearchIdeationJson, researchIdeationResponseJsonSchema } from "./research-ideation";
import {
  buildResearchOperationsPrompt,
  buildResearchOperationsSystemPrompt,
  LIVE_RESEARCH_OPERATIONAL_CAPABILITY,
  liveResearchWorkflowKinds,
  parseResearchOperationsJson,
  researchOperationalResponseSchema,
  researchOutputWarnings,
  scoreResearchOutput,
  type ResearchMemoryContextItem,
} from "./research-operations";
import type { ControlledLiveExecutionRequest, ControlledLiveExecutionResult, LiveExecutionDashboard, LiveReadinessDecision, ProviderActivationRecord, RuntimeUsageSnapshot } from "./types";

const providerIdSchema = z.enum(["mock", "openrouter", "gemini", "claude", "openai_compatible", "ollama_local"]);
const departmentIdSchema = z.enum(["research", "content", "platform_operations", "analytics", "optimization", "infrastructure", "error_recovery", "organizational_memory"]);
const workflowKindSchema = z.enum(["provider_execution", "structured_generation", "agent_tool_call", "embedding_request", "provider_health_check", "fallback_recovery"]);
const taskTypeSchema = z.enum(["text_generation", "structured_output", "planning", "classification", "summarization", "embedding"]);
const liveResearchWorkflowKindSchema = z.enum(liveResearchWorkflowKinds);
const liveContentWorkflowKindSchema = z.enum(liveContentWorkflowKinds);
const liveAnalyticsWorkflowKindSchema = z.enum(liveAnalyticsWorkflowKinds);
const contentPlatformTargetSchema = z.enum(contentPlatformTargets);
const analyticsDataSourceKindSchema = z.enum(analyticsDataSourceKinds);

export const controlledLiveExecutionSchema = z.object({
  objective: z.string().min(8).max(1500),
  providerId: providerIdSchema.default(FIRST_LIVE_TARGET.providerId),
  departmentId: departmentIdSchema.default(FIRST_LIVE_TARGET.departmentId as z.infer<typeof departmentIdSchema>),
  workflowKind: workflowKindSchema.default(FIRST_LIVE_TARGET.workflowKind),
  taskType: taskTypeSchema.default(FIRST_LIVE_TARGET.taskType),
  model: z.string().max(120).optional(),
  prompt: z.string().max(8000).optional(),
  systemPrompt: z.string().max(4000).optional(),
  approvalId: z.string().max(160).optional(),
  approvalStatus: z.enum(["pending", "approved", "rejected", "expired", "not_required"]).default("pending"),
  maxOutputTokens: z.coerce.number().int().min(1).max(defaultRuntimeQuota.maxOutputTokensPerRequest).default(400),
  estimatedInputTokens: z.coerce.number().int().min(1).max(defaultRuntimeQuota.maxInputTokensPerRequest).optional(),
  estimatedOutputTokens: z.coerce.number().int().min(1).max(defaultRuntimeQuota.maxOutputTokensPerRequest).optional(),
  researchWorkflowKind: liveResearchWorkflowKindSchema.default("content_ideation"),
  contentWorkflowKind: liveContentWorkflowKindSchema.default("hook_generation"),
  analyticsWorkflowKind: liveAnalyticsWorkflowKindSchema.default("content_performance_analysis"),
  seedTopics: z.array(z.string().min(1).max(180)).max(12).default([]),
  competitors: z.array(z.string().min(1).max(180)).max(12).default([]),
  audienceNotes: z.array(z.string().min(1).max(500)).max(12).default([]),
  sourceReferences: z.array(z.string().min(1).max(500)).max(12).default([]),
  platformTargets: z.array(contentPlatformTargetSchema).max(5).default(["YOUTUBE_SHORTS", "INSTAGRAM_REELS", "THREADS"]),
  analyticsSignals: z.array(z.string().min(1).max(700)).max(18).default([]),
  analyticsDataSources: z.array(analyticsDataSourceKindSchema).max(5).default(["mock_ingestion", "workflow_analytics", "internal_execution_metrics"]),
});

export const activationRequestSchema = z.object({
  providerId: providerIdSchema.default(FIRST_LIVE_TARGET.providerId),
  reason: z.string().min(8).max(1200),
  requestedStage: z.coerce.number().int().min(1).max(4).default(1),
});

export const providerActionSchema = z.object({
  providerId: providerIdSchema.default(FIRST_LIVE_TARGET.providerId),
  action: z.enum(["disable_provider", "quarantine_provider", "rollback_to_dry_run"]),
  reason: z.string().min(6).max(1000),
});

const globalStore = globalThis as typeof globalThis & {
  folqenLiveExecutionRegistry?: ProviderActivationRecord[];
  folqenLiveExecutionRuns?: ControlledLiveExecutionResult[];
};

const ACTIVATION_SETTING_KEY = "live_execution.activation.gemini_research_ideation";
const LIVE_EXECUTION_ALLOWED_DEPARTMENTS: DepartmentId[] = ["research", "content", "analytics"];

const usageZero: RuntimeUsageSnapshot = {
  requestsToday: 0,
  requestsThisMonth: 0,
  inFlight: 0,
  inputTokensToday: 0,
  outputTokensToday: 0,
  estimatedCostTodayInr: 0,
  estimatedCostThisMonthInr: 0,
};

const registryStore =
  globalStore.folqenLiveExecutionRegistry ??
  [
    {
      providerId: FIRST_LIVE_TARGET.providerId,
      stage: getConfiguredActivationStage(),
      status: "Blocked" as const,
      enabled: false,
      departmentId: FIRST_LIVE_TARGET.departmentId,
      workflowKind: FIRST_LIVE_TARGET.workflowKind,
      taskType: FIRST_LIVE_TARGET.taskType,
      rolloutPercent: 0,
      approvalStatus: "pending" as const,
      sandboxPassed: false,
      killSwitchEngaged: isRuntimeKillSwitchEnabled(),
      emergencyStopEngaged: isRuntimeKillSwitchEnabled(),
      quarantine: false,
      quotas: defaultRuntimeQuota,
      usage: usageZero,
      lastUpdatedAt: new Date().toISOString(),
      notes: ["Stage 0 mock-only by default. Stage 1 target is Gemini for approved Research, Content, and Analytics Department workflows only."],
    },
  ];

const runStore = globalStore.folqenLiveExecutionRuns ?? [];
globalStore.folqenLiveExecutionRegistry = registryStore;
globalStore.folqenLiveExecutionRuns = runStore;

function jsonSafe(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function getTargetRecord(providerId = FIRST_LIVE_TARGET.providerId) {
  return registryStore.find((record) => record.providerId === providerId) ?? registryStore[0];
}

function updateRecord(providerId: string, update: Partial<ProviderActivationRecord>) {
  const index = registryStore.findIndex((record) => record.providerId === providerId);
  if (index >= 0) {
    registryStore[index] = { ...registryStore[index], ...update, lastUpdatedAt: new Date().toISOString() };
    return registryStore[index];
  }
  return undefined;
}

function credentialConfigured(providerId: string) {
  if (providerId === "gemini") return Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  return false;
}

function isApprovedLiveDepartment(departmentId: DepartmentId) {
  return LIVE_EXECUTION_ALLOWED_DEPARTMENTS.includes(departmentId);
}

function isApprovedLiveTask(input: ControlledLiveExecutionRequest) {
  if (input.departmentId === "research") {
    return input.taskType === "planning";
  }
  if (input.departmentId === "content") {
    return input.taskType === "structured_output";
  }
  if (input.departmentId === "analytics") {
    return input.taskType === "structured_output";
  }
  return false;
}

function liveExecutionWorkflowId(result: ControlledLiveExecutionResult) {
  if (result.departmentId === "content") return `live_execution.gemini_content.${result.contentWorkflowKind ?? "hook_generation"}`;
  if (result.departmentId === "analytics") return `live_execution.gemini_analytics.${result.analyticsWorkflowKind ?? "content_performance_analysis"}`;
  return `live_execution.gemini_research.${result.researchWorkflowKind ?? "content_ideation"}`;
}

function liveExecutionMetricName(result: ControlledLiveExecutionResult) {
  if (result.departmentId === "content") return "live_gemini_content_intelligence_cost_inr";
  if (result.departmentId === "analytics") return "live_gemini_analytics_intelligence_cost_inr";
  return "live_gemini_research_ideation_cost_inr";
}

function isProviderActivationRecord(value: unknown): value is ProviderActivationRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    "providerId" in value &&
    "stage" in value &&
    "departmentId" in value &&
    "workflowKind" in value &&
    "quotas" in value &&
    "usage" in value
  );
}

async function loadActivationRecord(providerId = FIRST_LIVE_TARGET.providerId) {
  if (!hasDatabaseUrl()) {
    return getTargetRecord(providerId);
  }

  try {
    const setting = await getDb().setting.findUnique({ where: { key: ACTIVATION_SETTING_KEY } });
    if (isProviderActivationRecord(setting?.value)) {
      updateRecord(providerId, setting.value);
      return getTargetRecord(providerId);
    }
  } catch {
    return getTargetRecord(providerId);
  }

  return getTargetRecord(providerId);
}

async function persistActivationRecord(record: ProviderActivationRecord) {
  if (!hasDatabaseUrl()) {
    return { persisted: false as const, reason: "DATABASE_URL is not configured." };
  }

  try {
    await getDb().setting.upsert({
      where: { key: ACTIVATION_SETTING_KEY },
      create: {
        key: ACTIVATION_SETTING_KEY,
        value: jsonSafe(record),
        version: 1,
      },
      update: {
        value: jsonSafe(record),
        version: { increment: 1 },
      },
    });
    return { persisted: true as const };
  } catch {
    return { persisted: false as const, reason: "Activation state persistence failed." };
  }
}

type ApprovalVerification = NonNullable<ControlledLiveExecutionResult["approvalVerification"]>;

function activationPayloadMatchesTarget(payload: Prisma.JsonValue | null | undefined, departmentId: DepartmentId) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return true;
  const record = payload as Record<string, unknown>;
  const providerId = typeof record.providerId === "string" ? record.providerId : undefined;
  const allowedDepartments = Array.isArray(record.allowedDepartments) ? record.allowedDepartments.filter((item): item is string => typeof item === "string") : undefined;
  const firstTarget = typeof record.firstTarget === "object" && record.firstTarget !== null && !Array.isArray(record.firstTarget) ? (record.firstTarget as Record<string, unknown>) : undefined;
  const targetProvider = typeof firstTarget?.providerId === "string" ? firstTarget.providerId : undefined;
  const targetDepartment = typeof firstTarget?.departmentId === "string" ? firstTarget.departmentId : undefined;
  return (
    (!providerId || providerId === FIRST_LIVE_TARGET.providerId) &&
    (!targetProvider || targetProvider === FIRST_LIVE_TARGET.providerId) &&
    (allowedDepartments?.length ? allowedDepartments.includes(departmentId) : !targetDepartment || targetDepartment === departmentId)
  );
}

async function verifyActivationApproval(approvalId: string | undefined, departmentId: DepartmentId): Promise<ApprovalVerification> {
  if (!approvalId) {
    return { verified: false, status: "missing", reason: "Activation approval ID is required." };
  }

  if (!hasDatabaseUrl()) {
    return { verified: false, status: "unavailable", approvalId, reason: "Database approval verification is required for live execution." };
  }

  try {
    const approval = await getDb().approval.findUnique({ where: { id: approvalId } });
    if (!approval) {
      return { verified: false, status: "missing", approvalId, reason: "Approval record was not found." };
    }
    if (approval.type !== "live_execution.provider_activation") {
      return { verified: false, status: "rejected", approvalId, reason: "Approval record is not a live provider activation approval." };
    }
    if (approval.status !== "APPROVED") {
      return { verified: false, status: approval.status.toLowerCase() as ApprovalVerification["status"], approvalId, reason: `Approval is ${approval.status.toLowerCase()}, not approved.` };
    }
    if (!activationPayloadMatchesTarget(approval.payload, departmentId)) {
      return { verified: false, status: "rejected", approvalId, reason: `Approval does not match the Gemini ${departmentId} live activation target.` };
    }
    return { verified: true, status: "approved", approvalId, reason: `Approval record is verified for Gemini ${departmentId} live execution.` };
  } catch {
    return { verified: false, status: "unavailable", approvalId, reason: "Approval verification failed against the database." };
  }
}

async function evaluateLiveReadinessForExecution(input: ControlledLiveExecutionRequest) {
  await loadActivationRecord(input.providerId);
  const approvalVerification = await verifyActivationApproval(input.approvalId, input.departmentId ?? FIRST_LIVE_TARGET.departmentId);
  const readiness = evaluateLiveReadiness({
    ...input,
    approvalStatus: approvalVerification.verified ? "approved" : input.approvalStatus ?? "pending",
  });

  const reasons = new Set(readiness.reasons);
  if (!approvalVerification.verified) {
    reasons.add(approvalVerification.reason);
  }
  if (!hasDatabaseUrl()) {
    reasons.add("Database-backed activation state and approval verification are required for live execution.");
  }

  const mergedReadiness: LiveReadinessDecision = {
    ...readiness,
    allowed: readiness.allowed && approvalVerification.verified && hasDatabaseUrl(),
    reasons: Array.from(reasons),
    controls: Array.from(new Set([...readiness.controls, "database_approval_verification", "persisted_activation_registry", "no_autonomous_retries", "structured_json_validation"])),
  };
  if (!mergedReadiness.allowed) {
    mergedReadiness.status = mergedReadiness.reasons.some((reason) => /approval/i.test(reason)) ? "needs_approval" : readiness.status === "allowed" ? "blocked" : readiness.status;
  }

  return { readiness: mergedReadiness, approvalVerification };
}

async function persistLiveExecutionResult(input: ControlledLiveExecutionRequest, result: ControlledLiveExecutionResult, actorId?: string) {
  if (!hasDatabaseUrl()) {
    return { persisted: false as const };
  }

  try {
    const db = getDb();
    await db.workflowRun.create({
      data: {
        id: result.runId,
        providerId: result.providerId,
        workflowId: liveExecutionWorkflowId(result),
        status: result.status === "completed_live" ? TaskStatus.COMPLETED : TaskStatus.FAILED,
        input: jsonSafe({ ...input, approvalStatus: undefined }),
        output: jsonSafe(result),
        logs: [
          `mode=${result.mode}`,
          `status=${result.status}`,
          `readiness=${result.readiness.status}`,
          `queueJobId=${result.queueJobId}`,
          "No publishing, rendering, platform execution, autonomous retry, or workflow mutation was allowed.",
        ].join("\n"),
      },
    });

    await db.analyticsRecord.create({
      data: {
        metric: liveExecutionMetricName(result),
        value: result.providerResponse?.usage.estimatedCostInr ?? 0,
        period: new Date().toISOString().slice(0, 10),
        metadata: jsonSafe({
          runId: result.runId,
          status: result.status,
          tokenUsage: result.providerResponse?.usage,
          validation: result.validation,
          approvalVerification: result.approvalVerification,
          liveCapability: result.liveCapability,
          researchWorkflowKind: result.researchWorkflowKind,
          researchScore: result.researchScore,
          contentWorkflowKind: result.contentWorkflowKind,
          contentScore: result.contentScore,
          analyticsWorkflowKind: result.analyticsWorkflowKind,
          analyticsScore: result.analyticsScore,
        }),
      },
    });

    if (result.status !== "completed_live") {
      await db.errorLog.create({
        data: {
          source: "live-execution",
          message: result.validation.warnings[0] ?? "Controlled live execution blocked or failed.",
          severity: result.status === "failed" ? RiskLevel.HIGH : RiskLevel.MEDIUM,
          metadata: jsonSafe({
            runId: result.runId,
            providerId: result.providerId,
            readiness: result.readiness,
            approvalVerification: result.approvalVerification,
            rollback: result.rollback,
          }),
        },
      });
    }

    return { persisted: true as const };
  } catch {
    await createAuditLog({
      actorId,
      action: "live_execution.persistence_failed",
      target: result.runId,
      riskLevel: "MEDIUM",
      metadata: jsonSafe({ providerId: result.providerId, status: result.status }),
    });
    return { persisted: false as const };
  }
}

async function retrieveResearchMemory(input: ControlledLiveExecutionRequest): Promise<ResearchMemoryContextItem[]> {
  const query = [input.objective, input.researchWorkflowKind, ...(input.seedTopics ?? []), ...(input.competitors ?? []), ...(input.audienceNotes ?? [])].filter(Boolean).join(" ");
  const memoryItems: ResearchMemoryContextItem[] = [];

  try {
    const search = await searchMemory({
      query: query || "Research Department intelligence",
      categories: ["strategic", "workflow", "analytics", "organizational"],
      departmentId: "research",
      tags: ["research", "strategy", "workflow", "analytics"],
      limit: 6,
    });
    memoryItems.push(
      ...search.items.map((item) => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        relevance: Math.round((item.retrievalScore ?? 0) * 100),
        category: item.category,
      })),
    );
  } catch {
    // Memory tables are optional until the migration is approved; fall back to workflow history below.
  }

  if (hasDatabaseUrl()) {
    try {
      const rows = await getDb().workflowRun.findMany({
        where: { workflowId: { startsWith: "live_execution.gemini_research" } },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, workflowId: true, output: true, createdAt: true },
      });
      for (const row of rows) {
        memoryItems.push({
          id: row.id,
          title: row.workflowId,
          summary: `Previous live Research workflow from ${row.createdAt.toISOString()}.`,
          relevance: 64,
          category: "workflow",
        });
      }
    } catch {
      // Existing WorkflowRun history is best-effort observability only.
    }
  }

  return memoryItems.filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index).slice(0, 8);
}

async function retrieveContentMemory(input: ControlledLiveExecutionRequest): Promise<ContentMemoryContextItem[]> {
  const query = [input.objective, input.contentWorkflowKind, ...(input.seedTopics ?? []), ...(input.audienceNotes ?? []), ...(input.platformTargets ?? [])].filter(Boolean).join(" ");
  const memoryItems: ContentMemoryContextItem[] = [];

  try {
    const search = await searchMemory({
      query: query || "Content Department intelligence",
      categories: ["prompt", "analytics", "strategic", "workflow", "organizational"],
      departmentId: "content",
      tags: ["content", "hook", "script", "caption", "metadata", "platform", "analytics"],
      limit: 6,
    });
    memoryItems.push(
      ...search.items.map((item) => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        relevance: Math.round((item.retrievalScore ?? 0) * 100),
        category: item.category,
      })),
    );
  } catch {
    // Memory tables are optional until the migration is approved; workflow history remains a safe fallback.
  }

  if (hasDatabaseUrl()) {
    try {
      const rows = await getDb().workflowRun.findMany({
        where: { workflowId: { startsWith: "live_execution.gemini_content" } },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, workflowId: true, output: true, createdAt: true },
      });
      for (const row of rows) {
        memoryItems.push({
          id: row.id,
          title: row.workflowId,
          summary: `Previous live Content workflow from ${row.createdAt.toISOString()}.`,
          relevance: 64,
          category: "workflow",
        });
      }
    } catch {
      // Existing WorkflowRun history is best-effort observability only.
    }
  }

  return memoryItems.filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index).slice(0, 8);
}

async function retrieveAnalyticsMemory(input: ControlledLiveExecutionRequest): Promise<AnalyticsMemoryContextItem[]> {
  const query = [input.objective, input.analyticsWorkflowKind, ...(input.analyticsSignals ?? []), ...(input.analyticsDataSources ?? []), ...(input.platformTargets ?? [])].filter(Boolean).join(" ");
  const memoryItems: AnalyticsMemoryContextItem[] = [];

  try {
    const search = await searchMemory({
      query: query || "Analytics Department feedback intelligence",
      categories: ["analytics", "workflow", "strategic", "organizational", "prompt"],
      departmentId: "analytics",
      tags: ["analytics", "performance", "retention", "ctr", "workflow", "experiment", "reflection", "platform"],
      limit: 6,
    });
    memoryItems.push(
      ...search.items.map((item) => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        relevance: Math.round((item.retrievalScore ?? 0) * 100),
        category: item.category,
      })),
    );
  } catch {
    // Memory tables are optional until migration/application state is configured; workflow and metric history remain safe fallbacks.
  }

  if (hasDatabaseUrl()) {
    try {
      const rows = await getDb().workflowRun.findMany({
        where: { workflowId: { startsWith: "live_execution.gemini_" } },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, workflowId: true, status: true, createdAt: true },
      });
      for (const row of rows) {
        memoryItems.push({
          id: row.id,
          title: row.workflowId,
          summary: `Previous governed workflow ${row.status.toLowerCase()} at ${row.createdAt.toISOString()}.`,
          relevance: row.workflowId.includes("analytics") ? 72 : 58,
          category: "workflow",
        });
      }
    } catch {
      // Existing WorkflowRun history is best-effort observability only.
    }

    try {
      const analytics = await getDb().analyticsRecord.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, metric: true, value: true, period: true },
      });
      for (const row of analytics) {
        memoryItems.push({
          id: row.id,
          title: row.metric,
          summary: `Analytics metric ${row.metric} recorded ${row.value} for ${row.period}.`,
          relevance: 66,
          category: "analytics",
        });
      }
    } catch {
      // AnalyticsRecord is optional context, never a live platform API claim.
    }
  }

  return memoryItems.filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index).slice(0, 10);
}

export function evaluateLiveReadiness(rawInput: Partial<ControlledLiveExecutionRequest> = {}): LiveReadinessDecision {
  const input = controlledLiveExecutionSchema.partial({ objective: true }).parse(rawInput);
  const providerId = input.providerId ?? FIRST_LIVE_TARGET.providerId;
  const record = getTargetRecord(providerId);
  const provider = getAiProviderProfile(providerId);
  const normalized = normalizeAiGatewayInput({
    workflowKind: input.workflowKind ?? FIRST_LIVE_TARGET.workflowKind,
    objective: input.objective ?? "Evaluate controlled live execution readiness.",
    taskType: input.taskType ?? FIRST_LIVE_TARGET.taskType,
    departmentId: input.departmentId ?? FIRST_LIVE_TARGET.departmentId,
    preferredProviders: [providerId],
    fallbackProviders: ["mock"],
    prompt: input.prompt,
    systemPrompt: input.systemPrompt,
    maxOutputTokens: input.maxOutputTokens ?? 400,
    estimatedInputTokens: input.estimatedInputTokens,
    estimatedOutputTokens: input.estimatedOutputTokens,
    approvalStatus: input.approvalStatus ?? "pending",
    dryRun: false,
    sandbox: false,
    budgetInr: record.quotas.maxDailyCostInr,
    monthlyBudgetInr: record.quotas.maxMonthlyCostInr,
  });
  const budget = provider ? evaluateAiBudget(normalized, provider) : null;
  const governance = evaluateGovernancePolicy({
    actionType: "provider_execution",
    providerId,
    actorRole: "EXECUTIVE",
    approvalStatus: input.approvalStatus ?? "pending",
    estimatedCostInr: budget?.estimatedCostInr ?? 0,
    monthlyBudgetInr: record.quotas.maxMonthlyCostInr,
    dryRun: false,
  });
  const reasons: string[] = [];
  const controls = [
    "approval_required",
    "single_provider_target",
    "approved_department_only",
    "approved_structured_workflow_only",
    "quota_guard",
    "budget_guard",
    "kill_switch_guard",
    "rollback_ready",
  ];

  if (!isLiveExecutionFlagEnabled()) reasons.push("ALLOW_LIVE_AI_EXECUTION is not enabled.");
  if (isRuntimeKillSwitchEnabled() || record.killSwitchEngaged || record.emergencyStopEngaged) reasons.push("Runtime kill switch or emergency stop is engaged.");
  if (record.quarantine) reasons.push("Provider is quarantined.");
  if (!record.enabled) reasons.push("Provider activation record is not enabled.");
  if (record.stage < 1) reasons.push("Activation stage is still Stage 0 mock-only.");
  if (providerId !== FIRST_LIVE_TARGET.providerId) reasons.push("Only Gemini is supported as the first live activation target.");
  if (!isApprovedLiveDepartment((input.departmentId ?? FIRST_LIVE_TARGET.departmentId) as DepartmentId)) reasons.push("Live activation is limited to approved Research, Content, or Analytics Department workflows.");
  if ((input.workflowKind ?? FIRST_LIVE_TARGET.workflowKind) !== FIRST_LIVE_TARGET.workflowKind) reasons.push("Live activation is limited to governed structured-generation workflows.");
  if (!isApprovedLiveTask(input as ControlledLiveExecutionRequest)) reasons.push("Live activation is limited to approved Research planning, Content structured-output, or Analytics structured-output tasks.");
  if (!credentialConfigured(providerId)) reasons.push("Provider credential is not configured in server environment.");
  if ((input.approvalStatus ?? "pending") !== "approved" || !input.approvalId) reasons.push("Explicit approved activation approval ID is required.");
  if (!record.sandboxPassed) reasons.push("Sandbox execution must pass before live promotion.");
  if (!provider?.configured) reasons.push("Provider is not connected.");
  if ((input.maxOutputTokens ?? 400) > record.quotas.maxOutputTokensPerRequest) reasons.push("Requested output token limit exceeds provider quota.");
  if (normalized.estimatedInputTokens > record.quotas.maxInputTokensPerRequest) reasons.push("Estimated input tokens exceed request quota.");
  if (normalized.estimatedOutputTokens > record.quotas.maxOutputTokensPerRequest) reasons.push("Estimated output tokens exceed request quota.");
  if (record.usage.requestsToday >= record.quotas.maxRequestsPerDay) reasons.push("Daily request quota has been reached.");
  if (record.usage.requestsThisMonth >= record.quotas.maxRequestsPerMonth) reasons.push("Monthly request quota has been reached.");
  if (record.usage.inFlight >= record.quotas.maxInFlight) reasons.push("Concurrency limit has been reached.");
  if (budget?.estimatedCostInr && budget.estimatedCostInr > record.quotas.maxEstimatedCostInrPerRequest) reasons.push("Estimated request cost exceeds per-request ceiling.");
  if (record.usage.estimatedCostTodayInr + (budget?.estimatedCostInr ?? 0) > record.quotas.maxDailyCostInr) reasons.push("Daily budget ceiling would be exceeded.");
  if (record.usage.estimatedCostThisMonthInr + (budget?.estimatedCostInr ?? 0) > record.quotas.maxMonthlyCostInr) reasons.push("Monthly budget ceiling would be exceeded.");
  if (governance.decision === "blocked") reasons.push(...governance.reasons);

  const uniqueReasons = Array.from(new Set(reasons));
  const status: LiveReadinessDecision["status"] = uniqueReasons.some((reason) => reason.includes("kill switch") || reason.includes("emergency")) ? "kill_switch" : uniqueReasons.some((reason) => reason.includes("budget") || reason.includes("cost")) ? "budget_blocked" : uniqueReasons.some((reason) => reason.includes("approval")) ? "needs_approval" : uniqueReasons.some((reason) => reason.includes("Sandbox")) ? "sandbox_required" : uniqueReasons.some((reason) => reason.includes("credential") || reason.includes("connected")) ? "not_connected" : uniqueReasons.length ? "blocked" : "allowed";

  return {
    allowed: uniqueReasons.length === 0,
    status,
    stage: record.stage,
    providerId,
    reasons: uniqueReasons,
    controls,
  };
}

export async function requestProviderActivation(rawInput: unknown, actorId?: string) {
  const input = activationRequestSchema.parse(rawInput);
  const queue = await enqueueOrchestrationJob({
    queueName: ORCHESTRATION_QUEUES.governance,
    name: "live_execution.activation.request",
    data: { providerId: input.providerId, requestedStage: input.requestedStage, liveExecution: false, approvalRequired: true },
  });

  let approvalId = `approval_live_${Date.now()}`;
  if (hasDatabaseUrl()) {
    try {
      const approval = await getDb().approval.create({
        data: {
          type: "live_execution.provider_activation",
          title: `Live AI activation request: ${input.providerId}`,
          reason: input.reason,
          riskLevel: "HIGH",
          requestedBy: actorId,
          payload: jsonSafe({
            providerId: input.providerId,
            requestedStage: input.requestedStage,
            firstTarget: FIRST_LIVE_TARGET,
            allowedDepartments: LIVE_EXECUTION_ALLOWED_DEPARTMENTS,
            allowedWorkflows: ["research_intelligence", "content_intelligence", "analytics_intelligence"],
            quotas: defaultRuntimeQuota,
            liveExecution: false,
            queueJobId: queue.jobId,
          }),
        },
      });
      approvalId = approval.id;
    } catch {
      approvalId = `approval_live_${Date.now()}`;
    }
  }

  const record = updateRecord(input.providerId, {
    approvalId,
    approvalStatus: "pending",
    status: "Needs approval",
    notes: [`Activation approval requested for Stage ${input.requestedStage}. No live provider call is enabled.`],
  });
  if (record) await persistActivationRecord(record);

  await emitOrchestrationEvent({
    type: "live_execution.activation.requested",
    severity: "warning",
    source: "live-execution",
    departmentId: "infrastructure",
    message: "Controlled live AI activation approval was requested.",
    metadata: { providerId: input.providerId, approvalId, queueJobId: queue.jobId, requestedStage: input.requestedStage },
  });

  await createAuditLog({
    actorId,
    action: "live_execution.activation_requested",
    target: input.providerId,
    riskLevel: "HIGH",
    metadata: jsonSafe({ approvalId, requestedStage: input.requestedStage, queueJobId: queue.jobId, liveExecution: false }),
  });

  return { ok: true, mode: "approval_required" as const, approvalId, queueJobId: queue.jobId, message: "Activation request captured. Live execution remains blocked until approval, env flags, credentials, sandbox pass, and budget gates all pass." };
}

export async function promoteSandboxToLive(rawInput: unknown, actorId?: string) {
  const input = controlledLiveExecutionSchema.parse(rawInput);
  const { readiness, approvalVerification } = await evaluateLiveReadinessForExecution(input);
  const promotionBlockingReasons = readiness.reasons.filter(
    (reason) =>
      reason !== "Provider activation record is not enabled." &&
      reason !== "Activation stage is still Stage 0 mock-only." &&
      reason !== "Sandbox execution must pass before live promotion.",
  );
  const promotionAllowed = promotionBlockingReasons.length === 0;
  const promotionReadiness = {
    ...readiness,
    allowed: promotionAllowed,
    status: promotionAllowed ? ("allowed" as const) : readiness.status,
    reasons: promotionBlockingReasons,
  };
  const record = updateRecord(input.providerId, {
    sandboxPassed: promotionAllowed,
    enabled: promotionAllowed,
    status: promotionAllowed ? "Live" : readiness.status === "needs_approval" ? "Needs approval" : "Blocked",
    stage: promotionAllowed ? 1 : getTargetRecord(input.providerId).stage,
    approvalId: input.approvalId,
    approvalStatus: approvalVerification.verified ? "approved" : input.approvalStatus,
  });
  if (record) await persistActivationRecord(record);

  const queue = await enqueueOrchestrationJob({
    queueName: ORCHESTRATION_QUEUES.aiRuntime,
    name: "live_execution.promote",
    data: { providerId: input.providerId, readiness: promotionReadiness, liveExecution: promotionAllowed, sandboxFirst: true },
    options: { attempts: 1, removeOnComplete: 50, removeOnFail: 100 },
  });

  await createAuditLog({
    actorId,
    action: "live_execution.promotion_evaluated",
    target: input.providerId,
    riskLevel: promotionAllowed ? "HIGH" : "MEDIUM",
    metadata: jsonSafe({ readiness: promotionReadiness, approvalVerification, record, queueJobId: queue.jobId }),
  });

  return {
    ok: promotionAllowed,
    mode: promotionAllowed ? ("live_ready" as const) : ("blocked" as const),
    readiness: promotionReadiness,
    registry: record,
    queueJobId: queue.jobId,
    message: promotionAllowed ? "Provider is eligible for Stage 1 controlled live execution." : "Live promotion blocked. Resolve all readiness reasons before any provider call.",
  };
}

export async function runControlledLiveExecution(rawInput: unknown, actorId?: string): Promise<ControlledLiveExecutionResult> {
  const input = controlledLiveExecutionSchema.parse(rawInput);
  const { readiness, approvalVerification } = await evaluateLiveReadinessForExecution(input);
  const isContentWorkflow = input.departmentId === "content";
  const isAnalyticsWorkflow = input.departmentId === "analytics";
  const isResearchIdeationWorkflow = input.departmentId === "research" && input.researchWorkflowKind === "content_ideation";
  const queue = await enqueueOrchestrationJob({
    queueName: ORCHESTRATION_QUEUES.aiRuntime,
    name: "live_execution.controlled_run",
    data: { providerId: input.providerId, readiness, liveExecution: readiness.allowed, autonomousRetries: false },
    options: { attempts: 1, removeOnComplete: 50, removeOnFail: 100 },
  });
  const runId = `live_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  let result: ControlledLiveExecutionResult = {
    runId,
    mode: readiness.allowed ? "live" : "blocked",
    status: readiness.allowed ? "failed" : approvalVerification.verified ? "blocked" : "waiting_for_approval",
    providerId: input.providerId,
    departmentId: input.departmentId,
    workflowKind: input.workflowKind,
    readiness,
    queueJobId: queue.jobId,
    validation: {
      status: readiness.allowed ? "warning" : "failed",
      warnings: readiness.allowed ? ["Live execution was attempted under constrained activation gates."] : readiness.reasons,
    },
    liveCapability: isAnalyticsWorkflow ? LIVE_ANALYTICS_OPERATIONAL_CAPABILITY : isContentWorkflow ? LIVE_CONTENT_OPERATIONAL_CAPABILITY : isResearchIdeationWorkflow ? LIVE_RESEARCH_IDEATION_CAPABILITY : LIVE_RESEARCH_OPERATIONAL_CAPABILITY,
    researchWorkflowKind: input.researchWorkflowKind,
    contentWorkflowKind: input.contentWorkflowKind,
    analyticsWorkflowKind: input.analyticsWorkflowKind,
    approvalVerification,
    retryPolicy: {
      autonomousRetries: false,
      maxAttempts: 1,
      fallbackProviders: [],
    },
    rollback: {
      available: true,
      steps: ["engage_kill_switch", "disable_provider", "quarantine_provider", "drain_ai_runtime_queue", "rollback_to_dry_run_mode"],
    },
    createdAt: new Date().toISOString(),
  };

  if (readiness.allowed) {
    const recordBefore = getTargetRecord(input.providerId);
    updateRecord(input.providerId, { usage: { ...recordBefore.usage, inFlight: recordBefore.usage.inFlight + 1 } });
    const researchMemoryContext = input.departmentId === "research" ? await retrieveResearchMemory(input) : [];
    const contentMemoryContext = isContentWorkflow ? await retrieveContentMemory(input) : [];
    const analyticsMemoryContext = isAnalyticsWorkflow ? await retrieveAnalyticsMemory(input) : [];
    const normalized = normalizeAiGatewayInput({
      workflowKind: input.workflowKind,
      objective: input.objective,
      taskType: input.taskType,
      departmentId: input.departmentId,
      preferredProviders: [input.providerId],
      fallbackProviders: [],
      model: input.model,
      prompt: isAnalyticsWorkflow
        ? buildAnalyticsOperationsPrompt({
            workflowKind: input.analyticsWorkflowKind,
            objective: input.objective,
            performanceSignals: input.analyticsSignals,
            sourceReferences: input.sourceReferences,
            platformTargets: input.platformTargets,
            memoryContext: analyticsMemoryContext,
          })
        : isContentWorkflow
        ? buildContentOperationsPrompt({
            workflowKind: input.contentWorkflowKind,
            objective: input.objective,
            seedTopics: input.seedTopics,
            audienceNotes: input.audienceNotes,
            sourceReferences: input.sourceReferences,
            platformTargets: input.platformTargets,
            memoryContext: contentMemoryContext,
          })
        : isResearchIdeationWorkflow
          ? buildResearchIdeationPrompt({ objective: input.objective, prompt: input.prompt })
          : buildResearchOperationsPrompt({
              workflowKind: input.researchWorkflowKind,
              objective: input.objective,
              seedTopics: input.seedTopics,
              competitors: input.competitors,
              audienceNotes: input.audienceNotes,
              sourceReferences: input.sourceReferences,
              memoryContext: researchMemoryContext,
            }),
      systemPrompt: input.systemPrompt ?? (isAnalyticsWorkflow ? buildAnalyticsOperationsSystemPrompt() : isContentWorkflow ? buildContentOperationsSystemPrompt() : isResearchIdeationWorkflow ? buildResearchIdeationSystemPrompt() : buildResearchOperationsSystemPrompt()),
      maxOutputTokens: input.maxOutputTokens,
      estimatedInputTokens: input.estimatedInputTokens,
      estimatedOutputTokens: input.estimatedOutputTokens,
      approvalId: input.approvalId,
      approvalStatus: input.approvalStatus,
      dryRun: false,
      sandbox: false,
      budgetInr: defaultRuntimeQuota.maxDailyCostInr,
      monthlyBudgetInr: defaultRuntimeQuota.maxMonthlyCostInr,
    });
    try {
      const providerResponse = await executeLiveProvider({
        providerId: input.providerId,
        model: input.model,
        input: normalized,
        timeoutMs: getAiProviderProfile(input.providerId)?.timeoutMs ?? 30_000,
        responseMimeType: "application/json",
        responseSchema: isAnalyticsWorkflow ? analyticsOperationalResponseSchema : isContentWorkflow ? contentOperationalResponseSchema : isResearchIdeationWorkflow ? researchIdeationResponseJsonSchema : researchOperationalResponseSchema,
      });
      const structuredOutput = isAnalyticsWorkflow ? parseAnalyticsOperationsJson(providerResponse.content) : isContentWorkflow ? parseContentOperationsJson(providerResponse.content) : isResearchIdeationWorkflow ? parseResearchIdeationJson(providerResponse.content) : parseResearchOperationsJson(providerResponse.content);
      const researchOutput = input.departmentId === "research" && !isResearchIdeationWorkflow ? parseResearchOperationsJson(providerResponse.content) : undefined;
      const contentOutput = isContentWorkflow ? parseContentOperationsJson(providerResponse.content) : undefined;
      const analyticsOutput = isAnalyticsWorkflow ? parseAnalyticsOperationsJson(providerResponse.content) : undefined;
      const researchWarnings = researchOutput ? researchOutputWarnings(researchOutput) : [];
      const contentWarnings = contentOutput ? contentOutputWarnings(contentOutput) : [];
      const analyticsWarnings = analyticsOutput ? analyticsOutputWarnings(analyticsOutput) : [];
      const researchScore = researchOutput
        ? {
            qualityScore: scoreResearchOutput(researchOutput),
            acceptance: researchWarnings.some((warning) => warning.includes("below the live acceptance threshold") || warning.includes("Safety score")) ? ("rejected" as const) : ("accepted" as const),
            memoryItemsUsed: researchOutput.observability.memoryItemsUsed,
            duplicateSignals: researchOutput.duplicateSignals.length,
          }
        : undefined;
      const contentScore = contentOutput
        ? {
            qualityScore: scoreContentOutput(contentOutput),
            acceptance: contentWarnings.some((warning) => warning.includes("below the live acceptance threshold") || warning.includes("Safety score")) ? ("rejected" as const) : ("accepted" as const),
            memoryItemsUsed: contentOutput.observability.memoryItemsUsed,
            duplicateSignals: contentOutput.duplicateSignals.length,
          }
        : undefined;
      const analyticsScore = analyticsOutput
        ? {
            qualityScore: scoreAnalyticsOutput(analyticsOutput),
            acceptance: analyticsWarnings.some((warning) => warning.includes("below the live acceptance threshold") || warning.includes("Mandatory analytics safety flags")) ? ("rejected" as const) : ("accepted" as const),
            memoryItemsUsed: analyticsOutput.observability.memoryItemsUsed,
            duplicateSignals: analyticsOutput.duplicateSignals.length,
            optimizationConfidence: analyticsOutput.scoring.optimizationConfidenceScore,
          }
        : undefined;
      const validation = validateAiResponse(
        {
          expectedOutput: "json",
          responseSchema: {
            required: isAnalyticsWorkflow
              ? ["workflowKind", "report", "insights", "optimizationRecommendations", "duplicateSignals", "memoryContext", "scoring", "observability", "safety"]
              : isContentWorkflow
              ? ["workflowKind", "contentBrief", "drafts", "recommendations", "duplicateSignals", "memoryContext", "scoring", "observability", "safety"]
              : isResearchIdeationWorkflow
                ? ["summary", "trendInsights", "topicSuggestions", "strategicRecommendations", "risks", "followUpResearch", "safety"]
                : ["workflowKind", "summary", "insights", "recommendations", "duplicateSignals", "memoryContext", "scoring", "observability", "safety"],
          },
        },
        { content: providerResponse.content, structured: structuredOutput },
      );
      const validationWarnings = [...validation.warnings, ...researchWarnings, ...contentWarnings, ...analyticsWarnings];
      const outputRejected = researchScore?.acceptance === "rejected" || contentScore?.acceptance === "rejected" || analyticsScore?.acceptance === "rejected";
      result = {
        ...result,
        status: validation.status === "failed" || outputRejected ? "failed" : "completed_live",
        providerResponse: { ...providerResponse, structured: structuredOutput },
        structuredOutput,
        researchScore,
        contentScore,
        analyticsScore,
        validation: {
          status: validation.status === "failed" || outputRejected ? "failed" : validationWarnings.length ? "warning" : "passed",
          warnings: validationWarnings,
        },
      };
      const record = getTargetRecord(input.providerId);
      updateRecord(input.providerId, {
        usage: {
          requestsToday: record.usage.requestsToday + 1,
          requestsThisMonth: record.usage.requestsThisMonth + 1,
          inFlight: 0,
          inputTokensToday: record.usage.inputTokensToday + providerResponse.usage.inputTokens,
          outputTokensToday: record.usage.outputTokensToday + providerResponse.usage.outputTokens,
          estimatedCostTodayInr: record.usage.estimatedCostTodayInr + providerResponse.usage.estimatedCostInr,
          estimatedCostThisMonthInr: record.usage.estimatedCostThisMonthInr + providerResponse.usage.estimatedCostInr,
        },
      });
    } catch (error) {
      const record = getTargetRecord(input.providerId);
      updateRecord(input.providerId, { usage: { ...record.usage, inFlight: Math.max(0, record.usage.inFlight - 1) } });
      result = {
        ...result,
        status: "failed",
        validation: { status: "failed", warnings: [error instanceof Error ? error.message : "Live provider execution failed."] },
      };
    }
  }

  runStore.unshift(result);
  runStore.splice(50);

  await emitOrchestrationEvent({
    type: `live_execution.${result.status}`,
    severity: result.status === "completed_live" ? "info" : "warning",
    source: "live-execution",
    departmentId: input.departmentId as DepartmentId,
    workflowRunId: result.runId,
    message: result.status === "completed_live" ? "Controlled live AI execution completed." : "Controlled live AI execution was blocked or failed.",
    metadata: { readiness, queueJobId: queue.jobId, providerId: input.providerId, validation: result.validation },
  });

  await createAuditLog({
    actorId,
    action: `live_execution.${result.status}`,
    target: result.runId,
    riskLevel: result.status === "completed_live" ? "HIGH" : "MEDIUM",
    metadata: jsonSafe({ readiness, approvalVerification, providerId: input.providerId, queueJobId: queue.jobId, liveExecution: result.status === "completed_live", noAutonomousRetries: true }),
  });

  await persistLiveExecutionResult(input, result, actorId);
  await persistActivationRecord(getTargetRecord(input.providerId));

  return result;
}

export async function engageEmergencyStop(rawInput: unknown, actorId?: string) {
  const input = z.object({ reason: z.string().min(6).max(1000).default("Emergency stop requested.") }).parse(rawInput);
  const record = updateRecord(FIRST_LIVE_TARGET.providerId, {
    enabled: false,
    status: "Quarantined",
    killSwitchEngaged: true,
    emergencyStopEngaged: true,
    quarantine: true,
    rolloutPercent: 0,
    notes: ["Emergency stop engaged. Provider is quarantined and rolled back to dry-run mode.", input.reason],
  });
  const queue = await enqueueOrchestrationJob({
    queueName: ORCHESTRATION_QUEUES.aiRetry,
    name: "live_execution.emergency_stop",
    data: { providerId: FIRST_LIVE_TARGET.providerId, queueDrain: "mock_planned", cancelInFlight: true, liveExecution: false },
  });

  await createAuditLog({
    actorId,
    action: "live_execution.emergency_stop",
    target: FIRST_LIVE_TARGET.providerId,
    riskLevel: "CRITICAL",
    metadata: jsonSafe({ reason: input.reason, queueJobId: queue.jobId, record }),
  });
  if (record) await persistActivationRecord(record);

  return { ok: true, mode: "rollback_to_dry_run" as const, record, queueJobId: queue.jobId, message: "Emergency stop engaged. Provider disabled, queue drain planned, and runtime rolled back to dry-run mode." };
}

export async function actOnProvider(rawInput: unknown, actorId?: string) {
  const input = providerActionSchema.parse(rawInput);
  const update =
    input.action === "disable_provider"
      ? { enabled: false, status: "Disabled" as const, rolloutPercent: 0, notes: [input.reason] }
      : input.action === "quarantine_provider"
        ? { enabled: false, status: "Quarantined" as const, quarantine: true, rolloutPercent: 0, notes: [input.reason] }
        : { enabled: false, status: "Blocked" as const, stage: 0 as const, rolloutPercent: 0, sandboxPassed: false, notes: [input.reason, "Rolled back to Stage 0 dry-run mode."] };
  const record = updateRecord(input.providerId, update);
  const queue = await enqueueOrchestrationJob({
    queueName: ORCHESTRATION_QUEUES.aiRetry,
    name: `live_execution.provider.${input.action}`,
    data: { providerId: input.providerId, action: input.action, queueDrain: true, liveExecution: false },
  });

  await createAuditLog({
    actorId,
    action: `live_execution.${input.action}`,
    target: input.providerId,
    riskLevel: input.action === "quarantine_provider" ? "HIGH" : "MEDIUM",
    metadata: jsonSafe({ reason: input.reason, queueJobId: queue.jobId, record }),
  });
  if (record) await persistActivationRecord(record);

  return { ok: true, mode: "rollback_to_dry_run" as const, record, queueJobId: queue.jobId, message: `Provider action recorded: ${input.action}. Live execution remains disabled.` };
}

export async function getLiveExecutionDashboard(): Promise<LiveExecutionDashboard> {
  await loadActivationRecord();
  const readiness = evaluateLiveReadiness();
  const record = getTargetRecord();
  const provider = getAiProviderProfiles().find((item) => item.id === FIRST_LIVE_TARGET.providerId);
  return {
    activationStages: [
      { stage: 0, label: "Mock only", status: record.stage === 0 ? "Mock" : "Configured", description: "Dry-run and mock provider responses only." },
      { stage: 1, label: "Single-provider limited execution", status: record.stage >= 1 ? record.status : "Blocked", description: "Gemini only, approved Research, Content, and Analytics workflows only, ultra-low volume." },
      { stage: 2, label: "Controlled workflow execution", status: "Blocked", description: "Future workflow-level activation after Stage 1 proves stable." },
      { stage: 3, label: "Department-limited activation", status: "Blocked", description: "Future department-scoped rollout with richer quotas and monitoring." },
      { stage: 4, label: "Full governance-approved execution", status: "Blocked", description: "Future broad execution after explicit approval and production readiness." },
    ],
    registry: registryStore,
    firstTarget: {
      providerId: FIRST_LIVE_TARGET.providerId,
      departmentId: FIRST_LIVE_TARGET.departmentId,
      workflowKind: FIRST_LIVE_TARGET.workflowKind,
      taskType: FIRST_LIVE_TARGET.taskType,
      status: provider?.configured ? record.status : "Not connected",
    },
    recentRuns: runStore.slice(0, 8),
    readiness,
    budget: {
      ...record.quotas,
      ...record.usage,
    },
    rollback: {
      killSwitch: record.killSwitchEngaged || isRuntimeKillSwitchEnabled() ? "engaged" : "ready",
      emergencyStop: record.emergencyStopEngaged || isRuntimeKillSwitchEnabled() ? "engaged" : "ready",
      queueDrain: "mock_planned",
      providerQuarantine: "available",
    },
    observability: {
      liveExecutions: runStore.filter((run) => run.status === "completed_live").length,
      blockedAttempts: runStore.filter((run) => run.status === "blocked" || run.status === "waiting_for_approval").length,
      failures: runStore.filter((run) => run.status === "failed").length,
      policyViolations: runStore.filter((run) => run.readiness.reasons.length > 0).length,
    },
  };
}

export function resolveLiveExecutionMutationSafety(request: Request, userId?: string) {
  return userId ? getMutationSafetyError(request, { key: `live-execution:${userId}`, limit: 10, windowMs: 60_000 }) : null;
}
