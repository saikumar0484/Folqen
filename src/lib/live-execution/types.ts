import type { AiProviderId, AiProviderStatusLabel, AiTaskType, AiWorkflowKind } from "@/lib/ai-gateway/types";
import type { DepartmentId } from "@/lib/orchestration/types";
import type { AnalyticsDataSourceKind, AnalyticsOperationalOutput, LiveAnalyticsWorkflowKind } from "./analytics-operations";
import type { ContentOperationalOutput, ContentPlatformTarget, LiveContentWorkflowKind } from "./content-operations";
import type { LiveResearchWorkflowKind, ResearchOperationalOutput } from "./research-operations";

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
  researchWorkflowKind?: LiveResearchWorkflowKind;
  contentWorkflowKind?: LiveContentWorkflowKind;
  analyticsWorkflowKind?: LiveAnalyticsWorkflowKind;
  seedTopics?: string[];
  competitors?: string[];
  audienceNotes?: string[];
  sourceReferences?: string[];
  platformTargets?: ContentPlatformTarget[];
  analyticsSignals?: string[];
  analyticsDataSources?: AnalyticsDataSourceKind[];
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
  liveCapability?: "gemini_research_content_ideation" | "gemini_research_operational_intelligence" | "gemini_content_operational_intelligence" | "gemini_analytics_operational_intelligence";
  researchWorkflowKind?: LiveResearchWorkflowKind;
  contentWorkflowKind?: LiveContentWorkflowKind;
  analyticsWorkflowKind?: LiveAnalyticsWorkflowKind;
  structuredOutput?: Record<string, unknown> | ResearchOperationalOutput | ContentOperationalOutput | AnalyticsOperationalOutput;
  researchScore?: {
    qualityScore: number;
    acceptance: "accepted" | "rejected" | "blocked";
    memoryItemsUsed: number;
    duplicateSignals: number;
  };
  contentScore?: {
    qualityScore: number;
    acceptance: "accepted" | "rejected" | "blocked";
    memoryItemsUsed: number;
    duplicateSignals: number;
  };
  analyticsScore?: {
    qualityScore: number;
    acceptance: "accepted" | "rejected" | "blocked";
    memoryItemsUsed: number;
    duplicateSignals: number;
    optimizationConfidence: number;
  };
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
