import { Prisma } from "@prisma/client";
import { z } from "zod";

import { createAuditLog } from "@/lib/audit";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { emitOrchestrationEvent } from "@/lib/orchestration/event-bus";
import { enqueueOrchestrationJob, getQueueHealth, ORCHESTRATION_QUEUES } from "@/lib/orchestration/queue";
import type { DepartmentId } from "@/lib/orchestration/types";
import { evaluateAiBudget } from "./budget";
import { normalizeAiGatewayInput, runAiRuntimeGraph } from "./flows";
import { getAiProviderProfiles } from "./providers";
import type { AiGatewayDashboard, AiRuntimeResult } from "./types";

const providerIdSchema = z.enum(["mock", "openrouter", "gemini", "claude", "openai_compatible", "ollama_local"]);
const departmentIdSchema = z.enum(["research", "content", "platform_operations", "analytics", "optimization", "infrastructure", "error_recovery", "organizational_memory"]);

export const aiGatewayRequestSchema = z.object({
  workflowKind: z.enum(["provider_execution", "structured_generation", "agent_tool_call", "embedding_request", "provider_health_check", "fallback_recovery"]),
  objective: z.string().min(8).max(1500),
  taskType: z.enum(["text_generation", "structured_output", "planning", "classification", "summarization", "embedding"]).optional(),
  departmentId: departmentIdSchema.default("infrastructure"),
  preferredProviders: z.array(providerIdSchema).max(6).default(["mock"]),
  fallbackProviders: z.array(providerIdSchema).max(6).default(["mock", "ollama_local", "gemini", "openrouter", "claude", "openai_compatible"]),
  model: z.string().max(120).optional(),
  prompt: z.string().max(12_000).optional(),
  systemPrompt: z.string().max(4000).optional(),
  expectedOutput: z.enum(["text", "json", "embedding"]).default("json"),
  responseSchema: z.record(z.string(), z.unknown()).default({}),
  maxInputTokens: z.coerce.number().int().min(1).max(128_000).default(4000),
  maxOutputTokens: z.coerce.number().int().min(1).max(32_000).default(1200),
  estimatedInputTokens: z.coerce.number().int().min(1).max(128_000).optional(),
  estimatedOutputTokens: z.coerce.number().int().min(1).max(32_000).optional(),
  approvalId: z.string().max(160).optional(),
  approvalStatus: z.enum(["pending", "approved", "rejected", "expired", "not_required"]).default("pending"),
  budgetInr: z.coerce.number().min(0).max(100_000).default(50),
  monthlyBudgetInr: z.coerce.number().min(0).max(100_000).default(1000),
  dryRun: z.boolean().default(true),
  sandbox: z.boolean().default(true),
  retryCount: z.coerce.number().int().min(0).max(20).default(0),
});

export const aiGatewayRetrySchema = z.object({
  runId: z.string().min(1).max(180),
  reason: z.string().min(3).max(800).default("AI runtime retry requested."),
  preferredProviders: z.array(providerIdSchema).max(6).default(["mock"]),
});

const globalStore = globalThis as typeof globalThis & {
  folqenAiGatewayRuns?: AiRuntimeResult[];
};

const runStore = globalStore.folqenAiGatewayRuns ?? [];
globalStore.folqenAiGatewayRuns = runStore;

function jsonSafe(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function isMissingTableError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2021";
}

async function persistAiRuntimeRun(input: ReturnType<typeof normalizeAiGatewayInput>, result: AiRuntimeResult, actorId?: string) {
  if (!hasDatabaseUrl()) {
    return { persisted: false as const, reason: "DATABASE_URL is not configured." };
  }

  try {
    const db = getDb();
    await db.workflowRun.create({
      data: {
        id: result.runId,
        providerId: result.provider.id,
        workflowId: `ai_gateway.${input.workflowKind}`,
        status: result.status === "completed_mock" ? "COMPLETED" : result.status === "failed_validation" ? "FAILED" : "QUEUED",
        input: jsonSafe(input),
        output: jsonSafe({
          provider: result.provider.id,
          validation: result.validation,
          budget: result.budget,
          governance: result.governance,
          queueJobId: result.queue.jobId,
          dryRun: true,
          liveExecution: false,
        }),
        logs: [...result.observability.events, "No live provider execution occurred."].join("\n"),
      },
    });

    await db.analyticsRecord.create({
      data: {
        metric: "estimated_cost_inr",
        value: result.budget.estimatedCostInr,
        period: "dry_run",
        metadata: jsonSafe({
          runId: result.runId,
          providerId: result.provider.id,
          estimatedTokens: result.observability.estimatedTokens,
          validationScore: result.validation.score,
          liveExecution: false,
        }),
      },
    });

    await createAuditLog({
      actorId,
      action: "ai_gateway.execution_planned",
      target: result.runId,
      riskLevel: result.status === "blocked" ? "HIGH" : "MEDIUM",
      metadata: jsonSafe({ providerId: result.provider.id, governance: result.governance, budget: result.budget, liveExecution: false }),
    });

    return { persisted: true as const };
  } catch (error) {
    if (isMissingTableError(error)) {
      return { persisted: false as const, reason: "Existing workflow/analytics tables are not available in this database." };
    }
    return { persisted: false as const, reason: "AI runtime persistence failed; dry-run result remains available." };
  }
}

export async function runAiGatewayExecution(rawInput: unknown, actorId?: string): Promise<AiRuntimeResult> {
  const parsed = aiGatewayRequestSchema.parse(rawInput);
  const { input, result: graphResult } = await runAiRuntimeGraph(parsed);
  const queue = await enqueueOrchestrationJob({
    queueName: ORCHESTRATION_QUEUES.aiRuntime,
    name: `ai-gateway.${input.workflowKind}`,
    data: {
      workflowKind: input.workflowKind,
      providerId: graphResult.provider.id,
      taskType: input.taskType,
      mockSafe: true,
      dryRun: true,
      liveExecution: false,
      estimatedCostInr: graphResult.budget.estimatedCostInr,
    },
    options: {
      attempts: graphResult.retryPolicy.maxAttempts,
      backoff: { type: "exponential", delay: graphResult.retryPolicy.backoffMs },
    },
  });

  const event = await emitOrchestrationEvent({
    type: `ai_gateway.${input.workflowKind}.planned`,
    severity: graphResult.status === "blocked" || graphResult.status === "failed_validation" ? "warning" : "info",
    source: "ai-gateway",
    departmentId: input.departmentId as DepartmentId,
    workflowRunId: graphResult.runId,
    message: `AI provider execution planned for ${graphResult.provider.label} in mock-safe mode.`,
    metadata: {
      providerId: graphResult.provider.id,
      queueJobId: queue.jobId,
      validation: graphResult.validation,
      budget: graphResult.budget,
      liveExecution: false,
    },
  });

  const result: AiRuntimeResult = {
    ...graphResult,
    queue,
    observability: {
      ...graphResult.observability,
      events: [...graphResult.observability.events, `Event captured: ${event.id}.`, `Queue ${queue.queueName} accepted ${queue.status} job ${queue.jobId}.`],
    },
    persisted: false,
    createdAt: new Date().toISOString(),
  };

  const persistence = await persistAiRuntimeRun(input, result, actorId);
  result.persisted = persistence.persisted;

  runStore.unshift(result);
  runStore.splice(50);

  return result;
}

export async function retryAiGatewayExecution(rawInput: unknown, actorId?: string) {
  const input = aiGatewayRetrySchema.parse(rawInput);
  const previous = runStore.find((run) => run.runId === input.runId);
  const result = await runAiGatewayExecution(
    {
      workflowKind: "fallback_recovery",
      objective: `Retry dry-run for ${input.runId}: ${input.reason}`,
      preferredProviders: input.preferredProviders,
      fallbackProviders: ["mock", "ollama_local", "gemini", "openrouter", "claude", "openai_compatible"],
      taskType: previous?.observability.estimatedTokens.total ? "structured_output" : "planning",
      retryCount: (previous?.observability.retryCount ?? 0) + 1,
      approvalStatus: "pending",
      dryRun: true,
      sandbox: true,
    },
    actorId,
  );

  await createAuditLog({
    actorId,
    action: "ai_gateway.retry_planned",
    target: input.runId,
    riskLevel: "LOW",
    metadata: jsonSafe({ retryRunId: result.runId, reason: input.reason, liveExecution: false }),
  });

  return {
    ok: true,
    mode: "dry_run" as const,
    retryRun: result,
    message: "AI runtime retry was planned in dry-run mode. No provider call or paid execution occurred.",
  };
}

export async function getAiGatewayDashboard(): Promise<AiGatewayDashboard> {
  const providers = getAiProviderProfiles();
  const mockBudget = evaluateAiBudget(
    normalizeAiGatewayInput({
      workflowKind: "provider_health_check",
      objective: "Estimate default AI runtime budget.",
      preferredProviders: ["mock"],
    }),
    providers[0],
  );
  const queueHealth = (await getQueueHealth()).filter((queue) => queue.name === ORCHESTRATION_QUEUES.aiRuntime || queue.name === ORCHESTRATION_QUEUES.aiRetry || queue.name === ORCHESTRATION_QUEUES.sandbox);

  return {
    providers,
    recentExecutions: runStore.slice(0, 8),
    traces: runStore.map((run) => run.observability).slice(0, 12),
    budget: mockBudget,
    queueHealth,
    controls: [
      { id: "mock_runtime", label: "Mock runtime", status: "Mock", description: "Default execution path. Generates structured dry-run responses only." },
      { id: "paid_provider_execution", label: "Paid providers", status: "Blocked", description: "OpenRouter, Claude, and compatible paid APIs require explicit approval and budget gates." },
      { id: "provider_activation", label: "Provider activation", status: "Needs approval", description: "Credentials alone never activate providers. Governance approval is required." },
      { id: "local_models", label: "Local models", status: providers.find((provider) => provider.id === "ollama_local")?.status ?? "Not connected", description: "Ollama/local execution is prepared but still sandbox-gated." },
      { id: "fallback_routing", label: "Fallback routing", status: "Mock", description: "Fallback chains are planned and observable without calling external providers." },
    ],
    observability: {
      mode: "mock_safe",
      liveProviderExecution: "blocked",
      paidToolExecution: "blocked",
      sandboxExecution: "enabled",
    },
  };
}

export function getAiGatewayCapabilities() {
  return {
    providers: getAiProviderProfiles(),
    workflows: ["provider_execution", "structured_generation", "agent_tool_call", "embedding_request", "provider_health_check", "fallback_recovery"],
    safety: {
      providersEnabledByDefault: false,
      mockProviderDefault: true,
      paidExecution: "blocked",
      publicPublishing: "blocked",
      governanceApprovalRequired: true,
    },
  };
}
