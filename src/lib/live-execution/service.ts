import { Prisma } from "@prisma/client";
import { z } from "zod";

import { evaluateAiBudget } from "@/lib/ai-gateway/budget";
import { normalizeAiGatewayInput } from "@/lib/ai-gateway/flows";
import { getAiProviderProfile, getAiProviderProfiles } from "@/lib/ai-gateway/providers";
import { validateAiResponse } from "@/lib/ai-gateway/validation";
import { createAuditLog } from "@/lib/audit";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { evaluateGovernancePolicy } from "@/lib/governance/policy-engine";
import { emitOrchestrationEvent } from "@/lib/orchestration/event-bus";
import { enqueueOrchestrationJob, ORCHESTRATION_QUEUES } from "@/lib/orchestration/queue";
import type { DepartmentId } from "@/lib/orchestration/types";
import { getMutationSafetyError } from "@/lib/security/request-guards";
import { executeLiveProvider } from "./adapters";
import { defaultRuntimeQuota, FIRST_LIVE_TARGET, getConfiguredActivationStage, isLiveExecutionFlagEnabled, isRuntimeKillSwitchEnabled } from "./config";
import type { ControlledLiveExecutionRequest, ControlledLiveExecutionResult, LiveExecutionDashboard, LiveReadinessDecision, ProviderActivationRecord, RuntimeUsageSnapshot } from "./types";

const providerIdSchema = z.enum(["mock", "openrouter", "gemini", "claude", "openai_compatible", "ollama_local"]);
const departmentIdSchema = z.enum(["research", "content", "platform_operations", "analytics", "optimization", "infrastructure", "error_recovery", "organizational_memory"]);
const workflowKindSchema = z.enum(["provider_execution", "structured_generation", "agent_tool_call", "embedding_request", "provider_health_check", "fallback_recovery"]);
const taskTypeSchema = z.enum(["text_generation", "structured_output", "planning", "classification", "summarization", "embedding"]);

export const controlledLiveExecutionSchema = z.object({
  objective: z.string().min(8).max(1500),
  providerId: providerIdSchema.default(FIRST_LIVE_TARGET.providerId),
  departmentId: departmentIdSchema.default(FIRST_LIVE_TARGET.departmentId),
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
      notes: ["Stage 0 mock-only by default. First target is Gemini for Research Department content ideation only."],
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
    "research_department_only",
    "content_ideation_only",
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
  if ((input.departmentId ?? FIRST_LIVE_TARGET.departmentId) !== FIRST_LIVE_TARGET.departmentId) reasons.push("First activation is limited to the Research Department.");
  if ((input.workflowKind ?? FIRST_LIVE_TARGET.workflowKind) !== FIRST_LIVE_TARGET.workflowKind) reasons.push("First activation is limited to the structured content ideation workflow.");
  if ((input.taskType ?? FIRST_LIVE_TARGET.taskType) !== FIRST_LIVE_TARGET.taskType) reasons.push("First activation is limited to planning/content ideation tasks.");
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
            requestedStage: input.requestedStage,
            firstTarget: FIRST_LIVE_TARGET,
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

  updateRecord(input.providerId, {
    approvalId,
    approvalStatus: "pending",
    status: "Needs approval",
    notes: [`Activation approval requested for Stage ${input.requestedStage}. No live provider call is enabled.`],
  });

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
  const readiness = evaluateLiveReadiness(input);
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
    approvalStatus: input.approvalStatus,
  });

  const queue = await enqueueOrchestrationJob({
    queueName: ORCHESTRATION_QUEUES.aiRuntime,
    name: "live_execution.promote",
    data: { providerId: input.providerId, readiness: promotionReadiness, liveExecution: promotionAllowed, sandboxFirst: true },
  });

  await createAuditLog({
    actorId,
    action: "live_execution.promotion_evaluated",
    target: input.providerId,
    riskLevel: promotionAllowed ? "HIGH" : "MEDIUM",
    metadata: jsonSafe({ readiness: promotionReadiness, record, queueJobId: queue.jobId }),
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
  const readiness = evaluateLiveReadiness(input);
  const queue = await enqueueOrchestrationJob({
    queueName: ORCHESTRATION_QUEUES.aiRuntime,
    name: "live_execution.controlled_run",
    data: { providerId: input.providerId, readiness, liveExecution: readiness.allowed },
  });
  const runId = `live_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  let result: ControlledLiveExecutionResult = {
    runId,
    mode: readiness.allowed ? "live" : "blocked",
    status: readiness.allowed ? "failed" : input.approvalStatus === "approved" ? "blocked" : "waiting_for_approval",
    providerId: input.providerId,
    departmentId: input.departmentId,
    workflowKind: input.workflowKind,
    readiness,
    queueJobId: queue.jobId,
    validation: {
      status: readiness.allowed ? "warning" : "failed",
      warnings: readiness.allowed ? ["Live execution was attempted under constrained activation gates."] : readiness.reasons,
    },
    rollback: {
      available: true,
      steps: ["engage_kill_switch", "disable_provider", "quarantine_provider", "drain_ai_runtime_queue", "rollback_to_dry_run_mode"],
    },
    createdAt: new Date().toISOString(),
  };

  if (readiness.allowed) {
    const normalized = normalizeAiGatewayInput({
      workflowKind: input.workflowKind,
      objective: input.objective,
      taskType: input.taskType,
      departmentId: input.departmentId,
      preferredProviders: [input.providerId],
      fallbackProviders: ["mock"],
      model: input.model,
      prompt: input.prompt,
      systemPrompt: input.systemPrompt,
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
      const providerResponse = await executeLiveProvider({ providerId: input.providerId, model: input.model, input: normalized, timeoutMs: getAiProviderProfile(input.providerId)?.timeoutMs ?? 30_000 });
      const validation = validateAiResponse({ expectedOutput: "text", responseSchema: {} }, { content: providerResponse.content, structured: { content: providerResponse.content } });
      result = {
        ...result,
        status: "completed_live",
        providerResponse,
        validation: { status: validation.status, warnings: validation.warnings },
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
    metadata: jsonSafe({ readiness, providerId: input.providerId, queueJobId: queue.jobId, liveExecution: result.status === "completed_live" }),
  });

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

  return { ok: true, mode: "rollback_to_dry_run" as const, record, queueJobId: queue.jobId, message: `Provider action recorded: ${input.action}. Live execution remains disabled.` };
}

export async function getLiveExecutionDashboard(): Promise<LiveExecutionDashboard> {
  const readiness = evaluateLiveReadiness();
  const record = getTargetRecord();
  const provider = getAiProviderProfiles().find((item) => item.id === FIRST_LIVE_TARGET.providerId);
  return {
    activationStages: [
      { stage: 0, label: "Mock only", status: record.stage === 0 ? "Mock" : "Configured", description: "Dry-run and mock provider responses only." },
      { stage: 1, label: "Single-provider limited execution", status: record.stage >= 1 ? record.status : "Blocked", description: "Gemini only, Research Department only, low-volume content ideation only." },
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
