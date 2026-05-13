import type { AiProviderId, AiProviderStatusLabel, AiTaskType, AiWorkflowKind } from "@/lib/ai-gateway/types";
import type { DepartmentId } from "@/lib/orchestration/types";

export type LiveActivationStage = 0 | 1 | 2 | 3 | 4;
export type LiveActivationStatus = AiProviderStatusLabel | "Live" | "Disabled" | "Quarantined";
export type LiveActivationAction = "request_activation" | "promote" | "disable_provider" | "quarantine_provider" | "emergency_stop" | "rollback_to_dry_run";

export type RuntimeQuota = {
  maxRequestsPerDay: number;
  maxRequestsPerMonth: number;
  maxInFlight: number;
  maxInputTokensPerRequest: number;
  maxOutputTokensPerRequest: number;
  maxEstimatedCostInrPerRequest: number;
  maxDailyCostInr: number;
  maxMonthlyCostInr: number;
  alertThresholdPercent: number;
};

export type RuntimeUsageSnapshot = {
  requestsToday: number;
  requestsThisMonth: number;
  inFlight: number;
  inputTokensToday: number;
  outputTokensToday: number;
  estimatedCostTodayInr: number;
  estimatedCostThisMonthInr: number;
};

export type ProviderActivationRecord = {
  providerId: AiProviderId;
  stage: LiveActivationStage;
  status: LiveActivationStatus;
  enabled: boolean;
  departmentId: DepartmentId;
  workflowKind: AiWorkflowKind;
  taskType: AiTaskType;
  rolloutPercent: number;
  approvalStatus: "pending" | "approved" | "rejected" | "expired" | "not_required";
  approvalId?: string;
  sandboxPassed: boolean;
  killSwitchEngaged: boolean;
  emergencyStopEngaged: boolean;
  quarantine: boolean;
  quotas: RuntimeQuota;
  usage: RuntimeUsageSnapshot;
  lastUpdatedAt: string;
  notes: string[];
};

export type LiveReadinessDecision = {
  allowed: boolean;
  status: "allowed" | "blocked" | "needs_approval" | "sandbox_required" | "kill_switch" | "budget_blocked" | "not_connected";
  stage: LiveActivationStage;
  providerId: AiProviderId;
  reasons: string[];
  controls: string[];
};

export type ControlledLiveExecutionRequest = {
  objective: string;
  providerId?: AiProviderId;
  departmentId?: DepartmentId;
  workflowKind?: AiWorkflowKind;
  taskType?: AiTaskType;
  model?: string;
  prompt?: string;
  systemPrompt?: string;
  approvalId?: string;
  approvalStatus?: "pending" | "approved" | "rejected" | "expired" | "not_required";
  maxOutputTokens?: number;
  estimatedInputTokens?: number;
  estimatedOutputTokens?: number;
};

export type LiveProviderResponse = {
  providerId: AiProviderId;
  model: string;
  content: string;
  structured?: Record<string, unknown>;
  rawStatus: number;
  latencyMs: number;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCostInr: number;
  };
};

export type ControlledLiveExecutionResult = {
  runId: string;
  mode: "blocked" | "sandbox" | "live";
  status: "blocked" | "waiting_for_approval" | "completed_live" | "failed";
  providerId: AiProviderId;
  departmentId: DepartmentId;
  workflowKind: AiWorkflowKind;
  readiness: LiveReadinessDecision;
  providerResponse?: LiveProviderResponse;
  queueJobId: string;
  validation: {
    status: "passed" | "warning" | "failed";
    warnings: string[];
  };
  liveCapability?: "gemini_research_content_ideation";
  structuredOutput?: Record<string, unknown>;
  approvalVerification?: {
    verified: boolean;
    status: "approved" | "pending" | "rejected" | "expired" | "missing" | "unavailable";
    approvalId?: string;
    reason: string;
  };
  retryPolicy: {
    autonomousRetries: false;
    maxAttempts: 1;
    fallbackProviders: [];
  };
  rollback: {
    available: boolean;
    steps: string[];
  };
  createdAt: string;
};

export type LiveExecutionDashboard = {
  activationStages: Array<{
    stage: LiveActivationStage;
    label: string;
    status: LiveActivationStatus;
    description: string;
  }>;
  registry: ProviderActivationRecord[];
  firstTarget: {
    providerId: AiProviderId;
    departmentId: DepartmentId;
    workflowKind: AiWorkflowKind;
    taskType: AiTaskType;
    status: LiveActivationStatus;
  };
  recentRuns: ControlledLiveExecutionResult[];
  readiness: LiveReadinessDecision;
  budget: RuntimeQuota & RuntimeUsageSnapshot;
  rollback: {
    killSwitch: "engaged" | "ready";
    emergencyStop: "engaged" | "ready";
    queueDrain: "mock_planned" | "available";
    providerQuarantine: "available";
  };
  observability: {
    liveExecutions: number;
    blockedAttempts: number;
    failures: number;
    policyViolations: number;
  };
};
