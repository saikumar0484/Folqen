import { canPublishPublicly, canUsePaidTool } from "@/lib/security/guards";
import type { GovernanceActionType, GovernancePolicyInput, GovernancePolicyResult, GovernanceRole } from "./types";

const riskyActions = new Set<GovernanceActionType>([
  "public_publish",
  "provider_execution",
  "live_workflow",
  "account_access",
  "automation_trigger",
  "media_render",
  "paid_tool",
  "provider_activation",
  "queue_live_mode",
]);

const executiveOnly = new Set<GovernanceActionType>(["public_publish", "provider_activation", "account_access", "paid_tool"]);

function normalizeRole(role?: GovernanceRole) {
  return role ?? "SYSTEM";
}

function riskForAction(actionType: GovernanceActionType, estimatedCostInr: number) {
  if (actionType === "public_publish" || actionType === "provider_activation" || actionType === "account_access") return "critical" as const;
  if (actionType === "paid_tool" || estimatedCostInr > 0 || actionType === "live_workflow" || actionType === "media_render") return "high" as const;
  if (actionType === "automation_trigger" || actionType === "queue_live_mode" || actionType === "retry_execution") return "medium" as const;
  return "low" as const;
}

export function evaluateGovernancePolicy(input: GovernancePolicyInput): GovernancePolicyResult {
  const estimatedCostInr = Math.max(0, input.estimatedCostInr ?? 0);
  const monthlyBudgetInr = Math.max(0, input.monthlyBudgetInr ?? 1000);
  const reasons: string[] = [];
  const requiredApprovals: string[] = [];
  const controls = ["audit_log_required", "approval_checkpoint_required", "dry_run_default"];
  const actorRole = normalizeRole(input.actorRole);
  const riskLevel = riskForAction(input.actionType, estimatedCostInr);
  const queueDepth = input.queueDepth ?? 0;
  const retryCount = input.retryCount ?? 0;

  if (input.dryRun === true || input.actionType === "sandbox_test") {
    controls.push("sandbox_simulation_enabled");
  }

  if (riskyActions.has(input.actionType)) {
    const approvalSatisfiedForControlledMedia = input.actionType === "media_render" && input.approvalStatus === "approved";
    if (!approvalSatisfiedForControlledMedia) {
      requiredApprovals.push("human_approval");
      reasons.push("Dangerous actions require explicit human approval.");
    }
  }

  if (executiveOnly.has(input.actionType) && actorRole !== "EXECUTIVE") {
    requiredApprovals.push("executive_approval");
    reasons.push("This action requires executive-level approval.");
  }

  if (input.actionType === "public_publish") {
    const publish = canPublishPublicly({
      settings: { allowPublicPublish: false, requireHumanApproval: true },
      approvalStatus: input.approvalStatus,
      contentSafetyStatus: input.safetyStatus,
      copyrightStatus: input.copyrightStatus,
      reviewStatus: input.reviewStatus,
    });
    reasons.push(...publish.reasons);
    controls.push("copyright_gate", "safety_review_gate", "editorial_review_gate");
  }

  if (input.actionType === "paid_tool" || estimatedCostInr > 0) {
    const paid = canUsePaidTool({ settings: { allowPaidTools: false }, approvalStatus: input.approvalStatus });
    reasons.push(...paid.reasons);
    requiredApprovals.push("paid_tool_approval");
    controls.push("budget_guard");
  }

  if (input.actionType === "provider_execution" || input.actionType === "provider_activation") {
    reasons.push("Provider execution and activation are blocked until credentials, approval, and provider-specific guards exist.");
    controls.push("provider_capability_check", "credential_isolation");
    requiredApprovals.push("provider_access_approval");
  }

  if (input.actionType === "live_workflow" || input.actionType === "automation_trigger") {
    reasons.push("Live workflow execution and automation triggers remain disabled by default.");
    controls.push("worker_flag_guard", "n8n_guard");
  }

  if (input.actionType === "media_render") {
    if (input.approvalStatus !== "approved") {
      reasons.push("Live rendering is blocked until media worker approval and sandbox verification exist.");
    }
    controls.push("render_quota_guard", "media_worker_guard");
  }

  if (input.actionType === "account_access") {
    reasons.push("Platform account access requires OAuth approval and least-privilege scope review.");
    controls.push("oauth_scope_review", "account_access_audit");
  }

  if (input.actionType === "queue_live_mode") {
    reasons.push("Live queue mode requires explicit environment setup and worker approval.");
    controls.push("queue_depth_guard", "worker_execution_guard");
  }

  if (queueDepth > 100) {
    reasons.push("Queue depth exceeds the MVP safety limit.");
  }

  if (retryCount > 3) {
    reasons.push("Retry count exceeds the governance retry limit.");
  }

  const budgetReasons: string[] = [];
  if (estimatedCostInr > 0) {
    budgetReasons.push("Any non-zero spend needs paid-tool approval.");
  }
  if (estimatedCostInr > monthlyBudgetInr) {
    budgetReasons.push("Estimated execution cost exceeds the monthly budget.");
  }

  let decision: GovernancePolicyResult["decision"] = "blocked";
  if (input.actionType === "sandbox_test" || input.dryRun === true) {
    decision = reasons.filter((reason) => !reason.includes("Dangerous actions")).length ? "sandbox_only" : "allowed";
  } else if (reasons.length === 0 && requiredApprovals.length === 0) {
    decision = "allowed";
  } else if (input.approvalStatus === "approved" && !budgetReasons.length && !["public_publish", "provider_activation", "account_access"].includes(input.actionType)) {
    decision = "needs_approval";
  }

  const uniqueReasons = Array.from(new Set([...reasons, ...budgetReasons]));

  return {
    decision,
    allowed: decision === "allowed",
    actionType: input.actionType,
    riskLevel,
    reasons: uniqueReasons,
    requiredApprovals: Array.from(new Set(requiredApprovals)),
    controls: Array.from(new Set(controls)),
    budget: {
      estimatedCostInr,
      monthlyBudgetInr,
      status: estimatedCostInr > 0 ? "Needs approval" : "Mock",
      reasons: budgetReasons,
    },
    sandbox: {
      mode: input.actionType === "sandbox_test" || input.dryRun ? "dry_run" : "blocked",
      providerSimulation: input.actionType === "sandbox_test" || input.dryRun === true,
      isolated: true,
    },
    providerAccess: {
      status: input.providerId ? "Blocked" : "Not connected",
      reason: input.providerId ? "Provider access requires approval and credentials." : "No provider selected.",
    },
    queuePolicy: {
      status: queueDepth > 100 || retryCount > 3 ? "Blocked" : "Mock",
      maxQueueDepth: 100,
      maxRetries: 3,
    },
  };
}
