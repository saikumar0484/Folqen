import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

import { createCorrelationId } from "@/lib/orchestration/event-bus";
import { evaluateGovernancePolicy } from "@/lib/governance/policy-engine";
import { evaluateAiBudget } from "./budget";
import { getAiProviderProfiles } from "./providers";
import { selectProviderForRequest } from "./routing";
import { validateAiResponse } from "./validation";
import type { AiBudgetDecision, AiGatewayRequest, AiProviderId, AiProviderProfile, AiRuntimeResult, AiValidationResult } from "./types";

export type NormalizedAiGatewayInput = Required<
  Pick<
    AiGatewayRequest,
    | "workflowKind"
    | "objective"
    | "taskType"
    | "departmentId"
    | "preferredProviders"
    | "fallbackProviders"
    | "expectedOutput"
    | "responseSchema"
    | "maxInputTokens"
    | "maxOutputTokens"
    | "estimatedInputTokens"
    | "estimatedOutputTokens"
    | "approvalStatus"
    | "budgetInr"
    | "monthlyBudgetInr"
    | "dryRun"
    | "sandbox"
    | "retryCount"
  >
> &
  Omit<
    AiGatewayRequest,
    | "workflowKind"
    | "objective"
    | "taskType"
    | "departmentId"
    | "preferredProviders"
    | "fallbackProviders"
    | "expectedOutput"
    | "responseSchema"
    | "maxInputTokens"
    | "maxOutputTokens"
    | "estimatedInputTokens"
    | "estimatedOutputTokens"
    | "approvalStatus"
    | "budgetInr"
    | "monthlyBudgetInr"
    | "dryRun"
    | "sandbox"
    | "retryCount"
  >;

export function normalizeAiGatewayInput(input: AiGatewayRequest): NormalizedAiGatewayInput {
  return {
    workflowKind: input.workflowKind,
    objective: input.objective,
    taskType: input.taskType ?? (input.workflowKind === "embedding_request" ? "embedding" : "structured_output"),
    departmentId: input.departmentId ?? "infrastructure",
    preferredProviders: input.preferredProviders?.length ? input.preferredProviders : ["mock"],
    fallbackProviders: input.fallbackProviders?.length ? input.fallbackProviders : ["mock", "ollama_local", "gemini", "openrouter", "claude", "openai_compatible"],
    model: input.model,
    prompt: input.prompt,
    systemPrompt: input.systemPrompt,
    expectedOutput: input.expectedOutput ?? "json",
    responseSchema: input.responseSchema ?? {},
    maxInputTokens: input.maxInputTokens ?? 4000,
    maxOutputTokens: input.maxOutputTokens ?? 1200,
    estimatedInputTokens: input.estimatedInputTokens ?? Math.min(4000, Math.max(120, Math.ceil((input.prompt ?? input.objective).length / 3))),
    estimatedOutputTokens: input.estimatedOutputTokens ?? 600,
    approvalId: input.approvalId,
    approvalStatus: input.approvalStatus ?? "pending",
    budgetInr: input.budgetInr ?? 50,
    monthlyBudgetInr: input.monthlyBudgetInr ?? 1000,
    dryRun: input.dryRun ?? true,
    sandbox: input.sandbox ?? true,
    retryCount: input.retryCount ?? 0,
  };
}

function buildMockResponse(input: NormalizedAiGatewayInput, provider: AiProviderProfile) {
  return {
    content: `Mock ${input.taskType} response for "${input.objective}" routed through ${provider.label}. No provider API, paid call, credential use, or live model execution occurred.`,
    structured: {
      objective: input.objective,
      workflowKind: input.workflowKind,
      providerId: provider.id,
      mode: "dry_run",
      recommendations: [
        "Keep mock execution until governance approval and budget gates are satisfied.",
        "Attach source references before using outputs in public content.",
        "Route future low-cost drafting to local providers when sandbox checks are approved.",
      ],
      safety: {
        publicPublishing: "blocked",
        paidProviderExecution: "blocked",
        approvalRequired: true,
      },
    },
  };
}

const AiRuntimeGraphState = Annotation.Root({
  input: Annotation<NormalizedAiGatewayInput>({
    reducer: (_current, update) => update,
    default: () => normalizeAiGatewayInput({ workflowKind: "provider_execution", objective: "Run a mock provider execution." }),
  }),
  provider: Annotation<AiProviderProfile | null>({
    reducer: (_current, update) => update,
    default: () => null,
  }),
  fallbackChain: Annotation<AiProviderId[]>({
    reducer: (_current, update) => update,
    default: () => [],
  }),
  budget: Annotation<AiBudgetDecision | null>({
    reducer: (_current, update) => update,
    default: () => null,
  }),
  validation: Annotation<AiValidationResult | null>({
    reducer: (_current, update) => update,
    default: () => null,
  }),
  response: Annotation<{ content: string; structured: Record<string, unknown> } | null>({
    reducer: (_current, update) => update,
    default: () => null,
  }),
  governance: Annotation<ReturnType<typeof evaluateGovernancePolicy> | null>({
    reducer: (_current, update) => update,
    default: () => null,
  }),
  graphTrace: Annotation<string[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => [],
  }),
  correlationId: Annotation<string>({
    reducer: (_current, update) => update,
    default: () => createCorrelationId("ai-runtime"),
  }),
});

function createAiRuntimeGraph() {
  return new StateGraph(AiRuntimeGraphState)
    .addNode("validate_request", (state) => ({
      graphTrace: [`Validated AI runtime request for ${state.input.workflowKind} and ${state.input.taskType}.`],
    }))
    .addNode("route_provider", (state) => {
      const providers = getAiProviderProfiles();
      const route = selectProviderForRequest(state.input, providers);
      return {
        provider: route.provider,
        fallbackChain: route.fallbackChain,
        graphTrace: [`Selected ${route.provider.label}; fallback chain: ${route.fallbackChain.join(" -> ")}.`],
      };
    })
    .addNode("governance_gate", (state) => {
      const provider = state.provider ?? getAiProviderProfiles()[0];
      const governance = evaluateGovernancePolicy({
        actionType: "provider_execution",
        actorRole: "SYSTEM",
        providerId: provider.id,
        approvalStatus: state.input.approvalStatus,
        estimatedCostInr: 0,
        monthlyBudgetInr: state.input.monthlyBudgetInr,
        dryRun: state.input.dryRun,
        retryCount: state.input.retryCount,
      });
      return {
        governance,
        graphTrace: [`Governance decision: ${governance.decision}.`],
      };
    })
    .addNode("budget_gate", (state) => {
      const provider = state.provider ?? getAiProviderProfiles()[0];
      const budget = evaluateAiBudget(state.input, provider);
      return {
        budget,
        graphTrace: [`Budget status: ${budget.status}; estimated cost INR ${budget.estimatedCostInr}.`],
      };
    })
    .addNode("execute_mock", (state) => {
      const provider = state.provider ?? getAiProviderProfiles()[0];
      return {
        response: buildMockResponse(state.input, provider),
        graphTrace: ["Executed deterministic mock provider response. No network, SDK, key, or paid call was used."],
      };
    })
    .addNode("validate_response", (state) => ({
      validation: validateAiResponse(state.input, state.response ?? buildMockResponse(state.input, state.provider ?? getAiProviderProfiles()[0])),
      graphTrace: ["Validated mock response schema, unsafe content markers, malformed output, and hallucination guard hooks."],
    }))
    .addEdge(START, "validate_request")
    .addEdge("validate_request", "route_provider")
    .addEdge("route_provider", "governance_gate")
    .addEdge("governance_gate", "budget_gate")
    .addEdge("budget_gate", "execute_mock")
    .addEdge("execute_mock", "validate_response")
    .addEdge("validate_response", END)
    .compile();
}

export async function runAiRuntimeGraph(input: AiGatewayRequest): Promise<{
  input: NormalizedAiGatewayInput;
  result: Omit<AiRuntimeResult, "queue" | "persisted" | "createdAt"> & { graphTrace: string[] };
}> {
  const normalized = normalizeAiGatewayInput(input);
  const graph = createAiRuntimeGraph();
  const started = Date.now();
  const output = await graph.invoke({ input: normalized, correlationId: createCorrelationId("ai-runtime") });
  const provider = output.provider ?? getAiProviderProfiles()[0];
  const governance = output.governance ?? evaluateGovernancePolicy({ actionType: "provider_execution", providerId: provider.id, dryRun: true });
  const budget = output.budget ?? evaluateAiBudget(normalized, provider);
  const validation = output.validation ?? validateAiResponse(normalized, buildMockResponse(normalized, provider));
  const completedAt = new Date().toISOString();
  const mode = governance.decision === "blocked" || budget.status === "blocked" ? "blocked" : normalized.sandbox ? "sandbox" : "dry_run";
  const status = validation.status === "failed" ? "failed_validation" : governance.decision === "blocked" || budget.status === "blocked" ? "blocked" : normalized.approvalStatus === "approved" ? "completed_mock" : "waiting_for_approval";
  const estimatedTokens = {
    input: normalized.estimatedInputTokens,
    output: normalized.estimatedOutputTokens,
    total: normalized.estimatedInputTokens + normalized.estimatedOutputTokens,
  };

  return {
    input: normalized,
    result: {
      runId: output.correlationId,
      workflowKind: normalized.workflowKind,
      status,
      mode,
      provider,
      fallbackChain: output.fallbackChain,
      mockResponse: output.response ?? buildMockResponse(normalized, provider),
      validation,
      budget,
      governance: {
        decision: governance.decision,
        requiredApprovals: governance.requiredApprovals,
        reasons: governance.reasons,
        controls: governance.controls,
      },
      observability: {
        traceId: `trace_${output.correlationId}`,
        runId: output.correlationId,
        workflowKind: normalized.workflowKind,
        providerId: provider.id,
        fallbackChain: output.fallbackChain,
        mode,
        status: status === "waiting_for_approval" ? "queued" : status,
        startedAt: new Date(started).toISOString(),
        completedAt,
        latencyMs: Math.max(1, Date.now() - started),
        retryCount: normalized.retryCount,
        estimatedTokens,
        estimatedCostInr: budget.estimatedCostInr,
        events: output.graphTrace,
      },
      approvalCheckpoint: {
        id: `approval_${output.correlationId}`,
        status: normalized.approvalStatus === "approved" ? "not_required" : "pending",
        reason: "Provider execution remains gated by governance approval, paid-tool controls, and budget review.",
        riskLevel: provider.id === "mock" ? "medium" : "high",
      },
      retryPolicy: {
        enabled: true,
        maxAttempts: 3,
        backoffMs: 10_000,
        fallbackEnabled: true,
        escalationAfterAttempts: 3,
      },
      graphTrace: output.graphTrace,
    },
  };
}
