import type { QueueEnqueueResult } from "@/lib/orchestration/types";

export type AiProviderId = "mock" | "openrouter" | "gemini" | "claude" | "openai_compatible" | "ollama_local";
export type AiProviderStatusLabel = "Mock" | "Not connected" | "Configured" | "Needs approval" | "Blocked";
export type AiRuntimeMode = "dry_run" | "sandbox" | "blocked";
export type AiTaskType = "text_generation" | "structured_output" | "planning" | "classification" | "summarization" | "embedding";
export type AiWorkflowKind = "provider_execution" | "structured_generation" | "agent_tool_call" | "embedding_request" | "provider_health_check" | "fallback_recovery";

export type AiProviderProfile = {
  id: AiProviderId;
  label: string;
  status: AiProviderStatusLabel;
  category: "cloud_paid" | "cloud_quota" | "openai_compatible" | "local" | "mock";
  capabilities: AiTaskType[];
  configured: boolean;
  liveExecutionEnabled: boolean;
  paidToolGuard: "blocked" | "not_required" | "needs_approval";
  costPer1kInputTokensInr: number;
  costPer1kOutputTokensInr: number;
  maxConcurrency: number;
  timeoutMs: number;
  health: {
    status: "healthy" | "degraded" | "not_connected" | "blocked" | "mock";
    latencyMs: number;
    failureRate: number;
    lastCheckedAt: string;
  };
  notes: string[];
};

export type AiGatewayRequest = {
  workflowKind: AiWorkflowKind;
  objective: string;
  taskType?: AiTaskType;
  departmentId?: string;
  preferredProviders?: AiProviderId[];
  fallbackProviders?: AiProviderId[];
  model?: string;
  prompt?: string;
  systemPrompt?: string;
  expectedOutput?: "text" | "json" | "embedding";
  responseSchema?: Record<string, unknown>;
  maxInputTokens?: number;
  maxOutputTokens?: number;
  estimatedInputTokens?: number;
  estimatedOutputTokens?: number;
  approvalId?: string;
  approvalStatus?: "pending" | "approved" | "rejected" | "expired" | "not_required";
  budgetInr?: number;
  monthlyBudgetInr?: number;
  dryRun?: boolean;
  sandbox?: boolean;
  retryCount?: number;
};

export type AiBudgetDecision = {
  status: "within_budget" | "threshold_warning" | "blocked";
  estimatedCostInr: number;
  monthlyBudgetInr: number;
  departmentBudgetInr: number;
  usedThisMonthInr: number;
  remainingBudgetInr: number;
  alertThresholdPercent: number;
  quotas: Array<{
    id: string;
    label: string;
    used: number;
    limit: number;
    status: AiProviderStatusLabel;
  }>;
  reasons: string[];
};

export type AiValidationResult = {
  status: "passed" | "warning" | "failed";
  score: number;
  schemaValid: boolean;
  unsafeContentDetected: boolean;
  malformedOutputDetected: boolean;
  hallucinationGuard: "not_applicable" | "needs_sources" | "passed_mock";
  warnings: string[];
};

export type AiExecutionTrace = {
  traceId: string;
  runId: string;
  workflowKind: AiWorkflowKind;
  providerId: AiProviderId;
  fallbackChain: AiProviderId[];
  mode: AiRuntimeMode;
  status: "completed_mock" | "blocked" | "queued" | "failed_validation";
  startedAt: string;
  completedAt: string;
  latencyMs: number;
  retryCount: number;
  estimatedTokens: {
    input: number;
    output: number;
    total: number;
  };
  estimatedCostInr: number;
  events: string[];
};

export type AiRuntimeResult = {
  runId: string;
  workflowKind: AiWorkflowKind;
  status: "completed_mock" | "blocked" | "waiting_for_approval" | "failed_validation";
  mode: AiRuntimeMode;
  provider: AiProviderProfile;
  fallbackChain: AiProviderId[];
  mockResponse: {
    content: string;
    structured: Record<string, unknown>;
  };
  validation: AiValidationResult;
  budget: AiBudgetDecision;
  governance: {
    decision: "allowed" | "blocked" | "needs_approval" | "sandbox_only";
    requiredApprovals: string[];
    reasons: string[];
    controls: string[];
  };
  queue: QueueEnqueueResult;
  observability: AiExecutionTrace;
  approvalCheckpoint: {
    id: string;
    status: "pending" | "not_required";
    reason: string;
    riskLevel: "low" | "medium" | "high" | "critical";
  };
  retryPolicy: {
    enabled: boolean;
    maxAttempts: number;
    backoffMs: number;
    fallbackEnabled: boolean;
    escalationAfterAttempts: number;
  };
  persisted: boolean;
  createdAt: string;
};

export type AiGatewayDashboard = {
  providers: AiProviderProfile[];
  recentExecutions: AiRuntimeResult[];
  traces: AiExecutionTrace[];
  budget: AiBudgetDecision;
  queueHealth: Array<{
    name: string;
    mode: "mock" | "live";
    waiting: number;
    active: number;
    delayed: number;
    failed: number;
    completed: number;
    status: "mock_safe" | "healthy" | "degraded";
  }>;
  controls: Array<{
    id: string;
    label: string;
    status: AiProviderStatusLabel;
    description: string;
  }>;
  observability: {
    mode: "mock_safe";
    liveProviderExecution: "blocked";
    paidToolExecution: "blocked";
    sandboxExecution: "enabled";
  };
};
