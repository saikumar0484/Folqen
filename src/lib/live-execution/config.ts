import type { AiProviderId } from "@/lib/ai-gateway/types";
import type { DepartmentId } from "@/lib/orchestration/types";
import type { LiveActivationStage, RuntimeQuota } from "./types";

export const FIRST_LIVE_TARGET = {
  providerId: "gemini" as AiProviderId,
  departmentId: "research" as DepartmentId,
  workflowKind: "structured_generation" as const,
  taskType: "planning" as const,
  defaultModel: "gemini-2.5-flash",
};

export const defaultRuntimeQuota: RuntimeQuota = {
  maxRequestsPerDay: 5,
  maxRequestsPerMonth: 50,
  maxInFlight: 1,
  maxInputTokensPerRequest: 2000,
  maxOutputTokensPerRequest: 800,
  maxEstimatedCostInrPerRequest: 2,
  maxDailyCostInr: 10,
  maxMonthlyCostInr: 200,
  alertThresholdPercent: 75,
};

export function isLiveExecutionFlagEnabled(env: NodeJS.ProcessEnv = process.env) {
  return env.ALLOW_LIVE_AI_EXECUTION === "true";
}

export function getConfiguredActivationStage(env: NodeJS.ProcessEnv = process.env): LiveActivationStage {
  const value = Number(env.LIVE_AI_ACTIVATION_STAGE ?? 0);
  if (value === 1 || value === 2 || value === 3 || value === 4) return value;
  return 0;
}

export function isRuntimeKillSwitchEnabled(env: NodeJS.ProcessEnv = process.env) {
  return env.AI_RUNTIME_KILL_SWITCH === "true" || env.AI_RUNTIME_EMERGENCY_STOP === "true";
}
