import type { AiBudgetDecision, AiGatewayRequest, AiProviderProfile } from "./types";

export function estimateTokenCostInr(input: Required<Pick<AiGatewayRequest, "estimatedInputTokens" | "estimatedOutputTokens">>, provider: AiProviderProfile) {
  const inputCost = (input.estimatedInputTokens / 1000) * provider.costPer1kInputTokensInr;
  const outputCost = (input.estimatedOutputTokens / 1000) * provider.costPer1kOutputTokensInr;
  return Number((inputCost + outputCost).toFixed(4));
}

export function evaluateAiBudget(input: Required<Pick<AiGatewayRequest, "estimatedInputTokens" | "estimatedOutputTokens" | "budgetInr" | "monthlyBudgetInr" | "departmentId">>, provider: AiProviderProfile): AiBudgetDecision {
  const estimatedCostInr = estimateTokenCostInr(input, provider);
  const monthlyBudgetInr = input.monthlyBudgetInr;
  const departmentBudgetInr = input.budgetInr;
  const usedThisMonthInr = 0;
  const remainingBudgetInr = Math.max(0, monthlyBudgetInr - usedThisMonthInr);
  const projectedPercent = monthlyBudgetInr > 0 ? ((usedThisMonthInr + estimatedCostInr) / monthlyBudgetInr) * 100 : 100;
  const reasons: string[] = [];

  if (estimatedCostInr > departmentBudgetInr) {
    reasons.push(`Estimated execution cost exceeds the ${input.departmentId} department budget.`);
  }

  if (estimatedCostInr > remainingBudgetInr) {
    reasons.push("Estimated execution cost exceeds remaining monthly budget.");
  }

  if (provider.paidToolGuard !== "not_required") {
    reasons.push(`${provider.label} is governed as a paid or quota-bound provider.`);
  }

  const status = reasons.some((reason) => reason.includes("exceeds")) ? "blocked" : projectedPercent >= 80 ? "threshold_warning" : "within_budget";

  return {
    status,
    estimatedCostInr,
    monthlyBudgetInr,
    departmentBudgetInr,
    usedThisMonthInr,
    remainingBudgetInr,
    alertThresholdPercent: 80,
    quotas: [
      { id: "monthly_ai_spend", label: "Monthly AI spend", used: usedThisMonthInr, limit: monthlyBudgetInr, status: "Mock" },
      { id: `${input.departmentId}_budget`, label: `${input.departmentId} AI budget`, used: estimatedCostInr, limit: departmentBudgetInr, status: status === "blocked" ? "Blocked" : "Mock" },
      { id: `${provider.id}_concurrency`, label: `${provider.label} live concurrency`, used: 0, limit: provider.maxConcurrency, status: provider.liveExecutionEnabled ? "Configured" : provider.id === "mock" ? "Mock" : "Blocked" },
    ],
    reasons,
  };
}
