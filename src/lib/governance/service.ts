import { ApprovalStatus, Prisma, RiskLevel } from "@prisma/client";
import { z } from "zod";

import { createAuditLog } from "@/lib/audit";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { emitOrchestrationEvent } from "@/lib/orchestration/event-bus";
import { enqueueOrchestrationJob, ORCHESTRATION_QUEUES } from "@/lib/orchestration/queue";
import { evaluateGovernancePolicy } from "./policy-engine";
import { governanceActions, roleMatrix } from "./registry";
import type { GovernanceApprovalRecord, GovernanceDashboard, GovernancePolicyInput, GovernancePolicyResult } from "./types";

const governanceActionSchema = z.enum([
  "public_publish",
  "provider_execution",
  "live_workflow",
  "account_access",
  "automation_trigger",
  "media_render",
  "paid_tool",
  "provider_activation",
  "queue_live_mode",
  "retry_execution",
  "sandbox_test",
]);

export const governancePolicySchema = z.object({
  actionType: governanceActionSchema,
  actorRole: z.enum(["EXECUTIVE", "DEPARTMENT_MANAGER", "OPERATOR", "WORKER", "VIEWER", "SYSTEM"]).default("SYSTEM"),
  providerId: z.string().max(120).optional(),
  platform: z.string().max(80).optional(),
  workflowId: z.string().max(160).optional(),
  contentId: z.string().max(160).optional(),
  approvalStatus: z.enum(["pending", "approved", "rejected", "expired", "not_required"]).default("pending"),
  reviewStatus: z.enum(["pending", "passed", "failed"]).default("pending"),
  safetyStatus: z.enum(["pending", "passed", "failed"]).default("pending"),
  copyrightStatus: z.enum(["unknown", "clear", "blocked", "needs_review"]).default("unknown"),
  estimatedCostInr: z.coerce.number().min(0).max(100000).default(0),
  monthlyBudgetInr: z.coerce.number().min(0).max(100000).default(1000),
  dryRun: z.boolean().default(true),
  queueDepth: z.coerce.number().int().min(0).max(100000).default(0),
  retryCount: z.coerce.number().int().min(0).max(100).default(0),
});

export const governanceApprovalRequestSchema = z.object({
  actionType: governanceActionSchema,
  title: z.string().min(5).max(180),
  reason: z.string().min(5).max(1200),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  payload: z.record(z.string(), z.unknown()).default({}),
  contentId: z.string().min(1).max(160).optional(),
});

export const governanceApprovalActionSchema = z.object({
  approvalId: z.string().min(1).max(160),
  action: z.enum(["approve", "reject", "escalate", "retry", "revoke"]),
  note: z.string().max(1000).optional(),
});

export const sandboxExecutionSchema = z.object({
  actionType: governanceActionSchema.default("sandbox_test"),
  objective: z.string().min(5).max(1000),
  providerId: z.string().max(120).optional(),
  workflowId: z.string().max(160).optional(),
  estimatedCostInr: z.coerce.number().min(0).max(100000).default(0),
});

const globalStore = globalThis as typeof globalThis & {
  folqenGovernanceApprovals?: GovernanceApprovalRecord[];
  folqenGovernancePolicies?: GovernancePolicyResult[];
};

const approvalStore = globalStore.folqenGovernanceApprovals ?? [];
const policyStore = globalStore.folqenGovernancePolicies ?? [];
globalStore.folqenGovernanceApprovals = approvalStore;
globalStore.folqenGovernancePolicies = policyStore;

function jsonSafe(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function toApprovalRecord(row: {
  id: string;
  title: string;
  type: string;
  status: ApprovalStatus;
  riskLevel: RiskLevel;
  reason: string | null;
  requestedBy: string | null;
  createdAt: Date;
}): GovernanceApprovalRecord {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    status: row.status,
    riskLevel: row.riskLevel,
    reason: row.reason ?? "No reason provided.",
    requestedBy: row.requestedBy,
    createdAt: row.createdAt.toISOString(),
  };
}

async function listApprovalQueue(): Promise<GovernanceApprovalRecord[]> {
  if (!hasDatabaseUrl()) return approvalStore.slice(0, 20);

  try {
    const approvals = await getDb().approval.findMany({
      where: { status: ApprovalStatus.PENDING },
      orderBy: [{ riskLevel: "desc" }, { createdAt: "desc" }],
      take: 30,
    });
    return approvals.map(toApprovalRecord);
  } catch {
    return approvalStore.slice(0, 20);
  }
}

async function listRecentAudit() {
  if (!hasDatabaseUrl()) return [];

  try {
    const rows = await getDb().auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
    });
    return rows.map((row) => ({
      id: row.id,
      action: row.action,
      target: row.target,
      riskLevel: row.riskLevel,
      createdAt: row.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function evaluatePolicy(rawInput: unknown, actorId?: string) {
  const input = governancePolicySchema.parse(rawInput) as GovernancePolicyInput;
  const result = evaluateGovernancePolicy(input);
  policyStore.unshift(result);
  policyStore.splice(100);

  await emitOrchestrationEvent({
    type: `governance.policy.${result.decision}`,
    severity: result.allowed ? "info" : result.riskLevel === "critical" || result.riskLevel === "high" ? "warning" : "info",
    source: "governance",
    departmentId: "infrastructure",
    message: `Governance policy evaluated for ${result.actionType}: ${result.decision}.`,
    metadata: { result },
  });

  await createAuditLog({
    actorId,
    action: "governance.policy_evaluated",
    target: result.actionType,
    riskLevel: result.riskLevel === "critical" ? "CRITICAL" : result.riskLevel === "high" ? "HIGH" : result.riskLevel === "medium" ? "MEDIUM" : "LOW",
    metadata: jsonSafe(result),
  });

  return result;
}

export async function requestGovernanceApproval(rawInput: unknown, actorId?: string) {
  const input = governanceApprovalRequestSchema.parse(rawInput);
  const policy = evaluateGovernancePolicy({
    actionType: input.actionType,
    approvalStatus: "pending",
    dryRun: true,
    estimatedCostInr: Number(input.payload.estimatedCostInr ?? 0),
  });
  const queue = await enqueueOrchestrationJob({
    queueName: ORCHESTRATION_QUEUES.governance,
    name: `governance.approval.${input.actionType}`,
    data: { actionType: input.actionType, mockSafe: true, approvalRequired: true, publicExecution: false },
  });

  let approval: GovernanceApprovalRecord;
  if (hasDatabaseUrl()) {
    const row = await getDb().approval.create({
      data: {
        type: `governance.${input.actionType}`,
        title: input.title,
        reason: input.reason,
        riskLevel: input.riskLevel,
        requestedBy: actorId,
        contentId: input.contentId,
        payload: jsonSafe({ ...input.payload, policy, queueJobId: queue.jobId, liveExecution: false }),
      },
    });
    approval = toApprovalRecord(row);
  } else {
    approval = {
      id: `approval_${Date.now()}`,
      title: input.title,
      type: `governance.${input.actionType}`,
      status: "PENDING",
      riskLevel: input.riskLevel,
      reason: input.reason,
      requestedBy: actorId,
      createdAt: new Date().toISOString(),
    };
    approvalStore.unshift(approval);
  }

  await emitOrchestrationEvent({
    type: "governance.approval.requested",
    severity: input.riskLevel === "CRITICAL" || input.riskLevel === "HIGH" ? "warning" : "info",
    source: "governance",
    departmentId: "infrastructure",
    message: `Governance approval requested: ${input.title}.`,
    metadata: { approval, queueJobId: queue.jobId, policy },
  });

  await createAuditLog({
    actorId,
    action: "governance.approval_requested",
    target: approval.id,
    riskLevel: input.riskLevel,
    metadata: jsonSafe({ actionType: input.actionType, queueJobId: queue.jobId, policy }),
  });

  return { approval, policy, queueJobId: queue.jobId, mode: "dry_run" as const };
}

export async function actOnGovernanceApproval(rawInput: unknown, actorId?: string) {
  const input = governanceApprovalActionSchema.parse(rawInput);
  const queue = await enqueueOrchestrationJob({
    queueName: input.action === "retry" ? ORCHESTRATION_QUEUES.governance : ORCHESTRATION_QUEUES.incidents,
    name: `governance.approval.${input.action}`,
    data: { approvalId: input.approvalId, action: input.action, mockSafe: true, liveExecution: false },
  });

  let status: ApprovalStatus | "ESCALATED" | "RETRY_PLANNED" = "RETRY_PLANNED";
  let riskLevel: RiskLevel = "MEDIUM";

  if (hasDatabaseUrl()) {
    const db = getDb();
    const existing = await db.approval.findUnique({ where: { id: input.approvalId } });
    if (!existing) throw new Error("Approval not found.");
    riskLevel = existing.riskLevel;

    if (input.action === "approve" || input.action === "reject" || input.action === "revoke") {
      status = input.action === "approve" ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED;
      await db.approval.update({
        where: { id: input.approvalId },
        data: {
          status,
          decidedById: actorId,
          decidedAt: new Date(),
          payload: jsonSafe({
            previousPayload: existing.payload ?? {},
            governanceAction: input.action,
            note: input.note,
            liveExecution: false,
            queueJobId: queue.jobId,
          }),
        },
      });
    }

    if (input.action === "escalate") {
      status = "ESCALATED";
      riskLevel = existing.riskLevel === "CRITICAL" ? "CRITICAL" : "HIGH";
      await db.approval.update({
        where: { id: input.approvalId },
        data: {
          riskLevel,
          payload: jsonSafe({
            previousPayload: existing.payload ?? {},
            governanceAction: "escalate",
            note: input.note,
            queueJobId: queue.jobId,
          }),
        },
      });
    }
  }

  await emitOrchestrationEvent({
    type: `governance.approval.${input.action}`,
    severity: input.action === "escalate" || input.action === "revoke" ? "warning" : "info",
    source: "governance",
    departmentId: "infrastructure",
    message: `Governance approval action recorded: ${input.action}.`,
    metadata: { approvalId: input.approvalId, status, note: input.note, queueJobId: queue.jobId, liveExecution: false },
  });

  await createAuditLog({
    actorId,
    action: `governance.approval_${input.action}`,
    target: input.approvalId,
    riskLevel,
    metadata: jsonSafe({ note: input.note, status, queueJobId: queue.jobId, liveExecution: false }),
  });

  return {
    ok: true,
    mode: "dry_run" as const,
    approvalId: input.approvalId,
    action: input.action,
    status,
    queueJobId: queue.jobId,
    message: "Governance action recorded. No provider, workflow, rendering, publishing, or account execution occurred.",
  };
}

export async function runSandboxExecution(rawInput: unknown, actorId?: string) {
  const input = sandboxExecutionSchema.parse(rawInput);
  const policy = await evaluatePolicy(
    {
      actionType: input.actionType,
      providerId: input.providerId,
      workflowId: input.workflowId,
      estimatedCostInr: input.estimatedCostInr,
      dryRun: true,
      approvalStatus: "not_required",
    },
    actorId,
  );
  const queue = await enqueueOrchestrationJob({
    queueName: ORCHESTRATION_QUEUES.sandbox,
    name: `governance.sandbox.${input.actionType}`,
    data: {
      actionType: input.actionType,
      objective: input.objective,
      providerId: input.providerId,
      workflowId: input.workflowId,
      mockSafe: true,
      liveExecution: false,
      estimatedCostInr: 0,
    },
  });

  await emitOrchestrationEvent({
    type: "governance.sandbox.planned",
    severity: "info",
    source: "governance",
    departmentId: "infrastructure",
    message: "Sandbox execution simulation was queued in mock-safe mode.",
    metadata: { input, policy, queueJobId: queue.jobId },
  });

  return {
    ok: true,
    mode: "dry_run" as const,
    queueJobId: queue.jobId,
    policy,
    simulation: {
      isolated: true,
      providers: "simulated",
      liveExecution: false,
      costInr: 0,
      steps: ["validate_policy", "simulate_provider", "capture_audit_event", "return_mock_result"],
    },
  };
}

export async function getGovernanceDashboard(): Promise<GovernanceDashboard> {
  const approvalQueue = await listApprovalQueue();
  const recentEvents = await listRecentAudit();
  const samplePolicies = governanceActions.map((action) => {
    const policy = evaluateGovernancePolicy({ actionType: action.actionType, dryRun: true, approvalStatus: "pending" });
    return {
      actionType: action.actionType,
      decision: policy.decision,
      status: policy.allowed ? ("Configured" as const) : policy.decision === "sandbox_only" ? ("Mock" as const) : ("Blocked" as const),
      reason: policy.reasons[0] ?? action.description,
    };
  });

  return {
    approvalQueue,
    policySummary: samplePolicies,
    roleMatrix,
    executionControls: [
      { id: "public_publishing", label: "Public publishing", status: "Blocked", description: "Requires approval, content safety, copyright, and editorial gates." },
      { id: "paid_tools", label: "Paid tools", status: "Blocked", description: "Requires explicit paid-tool approval and budget checks." },
      { id: "provider_activation", label: "Provider activation", status: "Blocked", description: "Requires credentials, approval, least-privilege scopes, and provider guards." },
      { id: "sandbox", label: "Sandbox execution", status: "Mock", description: "Dry-run provider simulation is allowed for safe tests." },
    ],
    providerGovernance: [
      { providerId: "openrouter", status: "Blocked", allowedActions: ["request_approval", "sandbox_test"], blockedActions: ["paid_tool_execution", "live_generation"] },
      { providerId: "gemini", status: "Blocked", allowedActions: ["request_approval", "sandbox_test"], blockedActions: ["paid_tool_execution", "live_generation"] },
      { providerId: "n8n", status: "Not connected", allowedActions: ["connection_test"], blockedActions: ["live_workflow", "public_publish"] },
      { providerId: "comfyui_ffmpeg", status: "Blocked", allowedActions: ["sandbox_test"], blockedActions: ["live_render", "gpu_execution"] },
      { providerId: "platform_apis", status: "Not connected", allowedActions: ["manual_package"], blockedActions: ["account_access", "public_publish", "analytics_read"] },
    ],
    costGovernance: {
      monthlyBudgetInr: 1000,
      estimatedUsedInr: 0,
      alertThresholdPercent: 80,
      status: "Mock",
      quotas: [
        { id: "paid_api", label: "Paid API spend", used: 0, limit: 1000, status: "Blocked" },
        { id: "render_jobs", label: "Live render jobs", used: 0, limit: 0, status: "Blocked" },
        { id: "queue_jobs", label: "Mock queue plans", used: policyStore.length, limit: 100, status: "Mock" },
      ],
    },
    audit: {
      recentEvents,
      policyViolations: policyStore.filter((policy) => policy.decision === "blocked").length,
      escalations: recentEvents.filter((event) => event.action.includes("escalate")).length,
    },
    sandbox: {
      mode: "dry_run",
      providers: "simulated",
      liveExecution: "blocked",
    },
  };
}

export function getGovernanceCapabilities() {
  return {
    actions: governanceActions,
    roles: roleMatrix,
    safety: {
      publicPublishing: "blocked",
      paidTools: "blocked",
      providerActivation: "blocked",
      liveWorkflowExecution: "blocked",
      mediaRendering: "blocked",
      sandboxMode: "mock",
    },
  };
}
