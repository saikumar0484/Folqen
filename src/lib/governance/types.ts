export type GovernanceStatusLabel = "Mock" | "Not connected" | "Needs approval" | "Configured" | "Blocked";

export type GovernanceActionType =
  | "public_publish"
  | "provider_execution"
  | "live_workflow"
  | "account_access"
  | "automation_trigger"
  | "media_render"
  | "paid_tool"
  | "provider_activation"
  | "queue_live_mode"
  | "retry_execution"
  | "sandbox_test";

export type GovernanceDecision = "allowed" | "blocked" | "needs_approval" | "sandbox_only";

export type GovernanceRole = "EXECUTIVE" | "DEPARTMENT_MANAGER" | "OPERATOR" | "WORKER" | "VIEWER" | "SYSTEM";

export type GovernancePermission =
  | "approve_high_risk"
  | "approve_provider_activation"
  | "approve_public_publishing"
  | "approve_paid_tools"
  | "run_sandbox"
  | "view_audit"
  | "request_approval"
  | "revoke_execution"
  | "escalate_incident";

export type GovernanceApprovalAction = "approve" | "reject" | "escalate" | "retry" | "revoke";

export type GovernancePolicyInput = {
  actionType: GovernanceActionType;
  actorRole?: GovernanceRole;
  providerId?: string;
  platform?: string;
  workflowId?: string;
  contentId?: string;
  approvalStatus?: "pending" | "approved" | "rejected" | "expired" | "not_required";
  reviewStatus?: "pending" | "passed" | "failed";
  safetyStatus?: "pending" | "passed" | "failed";
  copyrightStatus?: "unknown" | "clear" | "blocked" | "needs_review";
  estimatedCostInr?: number;
  monthlyBudgetInr?: number;
  dryRun?: boolean;
  queueDepth?: number;
  retryCount?: number;
};

export type GovernancePolicyResult = {
  decision: GovernanceDecision;
  allowed: boolean;
  actionType: GovernanceActionType;
  riskLevel: "low" | "medium" | "high" | "critical";
  reasons: string[];
  requiredApprovals: string[];
  controls: string[];
  budget: {
    estimatedCostInr: number;
    monthlyBudgetInr: number;
    status: GovernanceStatusLabel;
    reasons: string[];
  };
  sandbox: {
    mode: "dry_run" | "blocked";
    providerSimulation: boolean;
    isolated: boolean;
  };
  providerAccess: {
    status: GovernanceStatusLabel;
    reason: string;
  };
  queuePolicy: {
    status: GovernanceStatusLabel;
    maxQueueDepth: number;
    maxRetries: number;
  };
};

export type GovernanceApprovalRequest = {
  actionType: GovernanceActionType;
  title: string;
  reason: string;
  riskLevel?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  payload?: Record<string, unknown>;
  contentId?: string;
};

export type GovernanceApprovalRecord = {
  id: string;
  title: string;
  type: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  reason: string;
  requestedBy?: string | null;
  createdAt: string;
};

export type GovernanceDashboard = {
  approvalQueue: GovernanceApprovalRecord[];
  policySummary: Array<{
    actionType: GovernanceActionType;
    decision: GovernanceDecision;
    status: GovernanceStatusLabel;
    reason: string;
  }>;
  roleMatrix: Array<{
    role: GovernanceRole;
    permissions: GovernancePermission[];
    restrictions: string[];
  }>;
  executionControls: Array<{
    id: string;
    label: string;
    status: GovernanceStatusLabel;
    description: string;
  }>;
  providerGovernance: Array<{
    providerId: string;
    status: GovernanceStatusLabel;
    allowedActions: string[];
    blockedActions: string[];
  }>;
  costGovernance: {
    monthlyBudgetInr: number;
    estimatedUsedInr: number;
    alertThresholdPercent: number;
    status: GovernanceStatusLabel;
    quotas: Array<{ id: string; label: string; used: number; limit: number; status: GovernanceStatusLabel }>;
  };
  audit: {
    recentEvents: Array<{ id: string; action: string; target?: string | null; riskLevel: string; createdAt: string }>;
    policyViolations: number;
    escalations: number;
  };
  sandbox: {
    mode: "dry_run";
    providers: "simulated";
    liveExecution: "blocked";
  };
};
