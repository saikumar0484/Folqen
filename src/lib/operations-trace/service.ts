import type { ApprovalStatus, RiskLevel, TaskStatus } from "@prisma/client";

import { isAuthConfigured } from "@/lib/auth/session";
import { getDatabaseStatus, getDb, hasDatabaseUrl } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { getQueueHealth } from "@/lib/orchestration/queue";
import { getProviderConfig } from "@/lib/provider-config";
import type {
  ApprovalLifecycleStep,
  ApprovalReadModel,
  OperationalCorrelation,
  OperationsQueueSnapshot,
  OperationsSafetyPosture,
  OperationsTraceDashboard,
  OperationsTraceItem,
  OperationsTraceSeverity,
  OperationsTraceStatus,
  ProductionDiagnostic,
  TraceIntegrityIssue,
  TraceIntegrityReport,
} from "./types";

const MAX_TRACES = 160;
const DEFAULT_PAGE_SIZE = 40;

type AuditLike = {
  id: string;
  action: string;
  target: string | null;
  riskLevel: RiskLevel;
  metadata?: unknown;
  createdAt: Date;
  actor?: { email: string; role: string } | null;
};

type EventLike = {
  id: string;
  type: string;
  subject: string | null;
  payload?: unknown;
  createdAt: Date;
};

type WorkflowLike = {
  id: string;
  providerId: string | null;
  workflowId: string;
  status: TaskStatus;
  input?: unknown;
  output?: unknown;
  logs: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type ErrorLike = {
  id: string;
  source: string;
  message: string;
  severity: RiskLevel;
  resolved: boolean;
  metadata?: unknown;
  createdAt: Date;
  updatedAt: Date;
};

type ApprovalLike = {
  id: string;
  type: string;
  title: string;
  status: ApprovalStatus;
  riskLevel: RiskLevel;
  reason: string | null;
  payload?: unknown;
  requestedBy: string | null;
  decidedAt: Date | null;
  createdAt: Date;
};

type RenderLike = {
  id: string;
  contentId: string | null;
  status: TaskStatus;
  providerId: string | null;
  outputPath: string | null;
  logs: string | null;
  metadata?: unknown;
  createdAt: Date;
  updatedAt: Date;
};

type AssetLike = {
  id: string;
  contentId: string | null;
  type: string;
  name: string;
  path: string;
  metadata?: unknown;
  createdAt: Date;
};

function iso(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown, key: string): string | undefined {
  if (!isRecord(value)) return undefined;
  const candidate = value[key];
  return typeof candidate === "string" ? candidate : undefined;
}

function readNestedString(value: unknown, path: string[]): string | undefined {
  let current: unknown = value;
  for (const key of path) {
    if (!isRecord(current)) return undefined;
    current = current[key];
  }
  return typeof current === "string" ? current : undefined;
}

function jsonContainsId(value: unknown, id: string) {
  if (!value) return false;

  try {
    return JSON.stringify(value).includes(id);
  } catch {
    return false;
  }
}

export function redactSensitiveText(value: string) {
  return value
    .replace(/bearer\s+[a-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/((api[_-]?key|token|secret|password|authorization)\s*[:=]\s*)([^\s,;]+)/gi, "$1[redacted]")
    .replace(/(sk-[a-zA-Z0-9_-]{8,})/g, "[redacted-api-key]")
    .replace(/\s+/g, " ")
    .trim();
}

export function traceSeverityFromRisk(level: RiskLevel | OperationsTraceItem["riskLevel"]): OperationsTraceSeverity {
  if (level === "CRITICAL") return "critical";
  if (level === "HIGH") return "error";
  if (level === "MEDIUM") return "warning";
  return "info";
}

export function traceStatusFromTask(status: TaskStatus | string): OperationsTraceStatus {
  if (status === "COMPLETED") return "Configured";
  if (status === "RUNNING" || status === "QUEUED") return "Mock";
  if (status === "PAUSED") return "Needs approval";
  if (status === "FAILED" || status === "CANCELED") return "Blocked";
  return "Mock";
}

export function traceStatusFromApproval(status: ApprovalStatus | string): OperationsTraceStatus {
  if (status === "APPROVED") return "Configured";
  if (status === "PENDING") return "Needs approval";
  return "Blocked";
}

export function safeMetadataKeys(value: unknown): string[] {
  if (!isRecord(value)) return [];

  return Object.keys(value)
    .filter((key) => !/(secret|token|password|api[_-]?key|credential|authorization)/i.test(key))
    .slice(0, 8);
}

function summarizeText(message: string, length = 220) {
  return redactSensitiveText(message).slice(0, length);
}

function queueSeverity(queue: OperationsQueueSnapshot): OperationsTraceSeverity {
  if (queue.failed > 0) return "warning";
  if (queue.active > 0 || queue.waiting > 0 || queue.delayed > 0) return "info";
  return "info";
}

function diagnosticStatus(ok: boolean, configuredStatus: OperationsTraceStatus = "Configured"): OperationsTraceStatus {
  return ok ? configuredStatus : "Blocked";
}

function buildSafetyPosture(): OperationsSafetyPosture[] {
  const env = getEnv();

  return [
    {
      id: "public_publishing",
      label: "Public publishing",
      status: env.ALLOW_PUBLIC_PUBLISH ? "Needs approval" : "Blocked",
      description: "Public publishing remains blocked unless env, review, safety, copyright, and human approval gates all pass.",
    },
    {
      id: "paid_tools",
      label: "Paid tools",
      status: env.ALLOW_PAID_TOOLS ? "Needs approval" : "Blocked",
      description: "Paid provider usage requires explicit approval and budget validation.",
    },
    {
      id: "live_ai_execution",
      label: "Live AI execution",
      status: env.ALLOW_LIVE_AI_EXECUTION && env.LIVE_AI_ACTIVATION_STAGE > 0 ? "Needs approval" : "Blocked",
      description: "Gemini live execution is restricted to approved department workflows and kill-switch controls.",
    },
    {
      id: "controlled_media_rendering",
      label: "Controlled media rendering",
      status: env.ALLOW_CONTROLLED_MEDIA_EXECUTION && env.LIVE_MEDIA_ACTIVATION_STAGE > 0 ? "Needs approval" : "Blocked",
      description: "Media rendering requires approval, quota validation, provider health, and sandbox fallback.",
    },
    {
      id: "database",
      label: "Database",
      status: hasDatabaseUrl() ? "Configured" : "Not connected",
      description: "Trace read model uses existing tables only and falls back safely when the database is unavailable.",
    },
  ];
}

function auditMatchesApproval(audit: AuditLike, approvalId: string) {
  return audit.target === approvalId || jsonContainsId(audit.metadata, approvalId);
}

function auditMatchesWorkflow(audit: AuditLike, workflowId: string) {
  return audit.target === workflowId || jsonContainsId(audit.metadata, workflowId);
}

function eventMatchesWorkflow(event: EventLike, workflowId: string) {
  return readString(event.payload, "workflowRunId") === workflowId || readNestedString(event.payload, ["metadata", "runId"]) === workflowId || jsonContainsId(event.payload, workflowId);
}

function workflowProviderLabel(workflow: WorkflowLike) {
  return workflow.providerId ?? "Not connected";
}

export function buildApprovalReadModels(input: { approvals: ApprovalLike[]; audits: AuditLike[]; workflows: WorkflowLike[]; errors: ErrorLike[] }): ApprovalReadModel[] {
  return input.approvals.map((approval) => {
    const relatedAudits = input.audits.filter((audit) => auditMatchesApproval(audit, approval.id));
    const relatedWorkflows = input.workflows.filter((workflow) => jsonContainsId(workflow.input, approval.id) || jsonContainsId(workflow.output, approval.id));
    const relatedErrors = input.errors.filter((error) => jsonContainsId(error.metadata, approval.id));
    const relatedTraceIds = [...relatedAudits.map((audit) => audit.id), ...relatedWorkflows.map((workflow) => workflow.id), ...relatedErrors.map((error) => error.id)];
    const lifecycle: ApprovalLifecycleStep[] = [
      {
        id: `${approval.id}:requested`,
        label: "Approval requested",
        status: "Needs approval",
        createdAt: iso(approval.createdAt),
        actor: approval.requestedBy ?? "system",
        summary: summarizeText(approval.reason ?? approval.type),
        severity: approval.riskLevel === "LOW" ? "info" : "warning",
      },
    ];

    for (const audit of relatedAudits.slice(0, 8)) {
      const actionLabel = audit.action.includes("escalate")
        ? "Escalated"
        : audit.action.includes("retry")
          ? "Retry requested"
          : audit.action.includes("revoke")
            ? "Revoked"
            : audit.action.includes("reject")
              ? "Rejected"
              : audit.action.includes("approve")
                ? "Approved"
                : audit.action.includes("rollback")
                  ? "Rollback noted"
                  : "Audit linked";
      lifecycle.push({
        id: `${approval.id}:audit:${audit.id}`,
        label: actionLabel,
        status: audit.riskLevel === "HIGH" || audit.riskLevel === "CRITICAL" ? "Blocked" : audit.riskLevel === "MEDIUM" ? "Needs approval" : "Configured",
        createdAt: iso(audit.createdAt),
        actor: audit.actor ? `${audit.actor.email} (${audit.actor.role})` : "system",
        summary: summarizeText(audit.target ?? audit.action),
        severity: traceSeverityFromRisk(audit.riskLevel),
      });
    }

    if (approval.status !== "PENDING") {
      lifecycle.push({
        id: `${approval.id}:decision`,
        label: `Decision: ${approval.status.toLowerCase()}`,
        status: traceStatusFromApproval(approval.status),
        createdAt: iso(approval.decidedAt ?? approval.createdAt),
        summary: approval.decidedAt ? "Human decision timestamp recorded." : "Decision exists without a decision timestamp.",
        severity: approval.status === "APPROVED" ? "info" : "warning",
      });
    }

    if (approval.status === "PENDING") {
      lifecycle.push({
        id: `${approval.id}:waiting`,
        label: "Waiting for human review",
        status: "Needs approval",
        createdAt: iso(approval.createdAt),
        summary: "Dangerous action remains gated until a reviewer acts.",
        severity: "warning",
      });
    }

    const verificationReasons: string[] = [];
    if (!relatedAudits.length) verificationReasons.push("No linked audit event was found for this approval.");
    if (approval.status !== "PENDING" && !approval.decidedAt) verificationReasons.push("Approval has a terminal state but no decision timestamp.");
    if (relatedWorkflows.some((workflow) => workflow.status === "FAILED" || workflow.status === "CANCELED")) verificationReasons.push("Linked workflow has a failed or canceled state.");
    if (relatedErrors.length > 0) verificationReasons.push("Linked incident or error record exists.");
    if (!verificationReasons.length) verificationReasons.push("Lifecycle has at least one audit or consistent pending state.");

    const verificationStatus: OperationsTraceStatus =
      verificationReasons.some((reason) => /failed|error|terminal/i.test(reason)) || (approval.status !== "PENDING" && !relatedAudits.length)
        ? "Blocked"
        : verificationReasons.some((reason) => /No linked audit/i.test(reason))
          ? "Needs approval"
          : "Configured";

    return {
      id: approval.id,
      type: approval.type,
      title: approval.title,
      status: traceStatusFromApproval(approval.status),
      rawStatus: approval.status,
      riskLevel: approval.riskLevel,
      reasonSummary: summarizeText(approval.reason ?? "No reason recorded."),
      requestedBy: approval.requestedBy ?? undefined,
      decidedAt: approval.decidedAt ? iso(approval.decidedAt) : undefined,
      verificationStatus,
      verificationReasons,
      lifecycle: lifecycle.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)).slice(0, 12),
      relatedTraceIds,
      rollbackAvailable: approval.type.includes("live_execution") || approval.type.includes("provider") || approval.type.includes("media_render") || approval.status === "APPROVED",
    };
  });
}

export function buildTraceIntegrityReport(input: {
  traces: OperationsTraceItem[];
  approvals: ApprovalReadModel[];
  workflows: WorkflowLike[];
  events: EventLike[];
  audits: AuditLike[];
  errors: ErrorLike[];
  queues: OperationsQueueSnapshot[];
}): TraceIntegrityReport {
  const issues: TraceIntegrityIssue[] = [];
  const detectedAt = new Date().toISOString();
  let orphanWorkflows = 0;
  let missingAuditLinks = 0;
  let queueMismatches = 0;

  for (const workflow of input.workflows) {
    const hasEvent = input.events.some((event) => eventMatchesWorkflow(event, workflow.id));
    const hasAudit = input.audits.some((audit) => auditMatchesWorkflow(audit, workflow.id));
    const hasError = input.errors.some((error) => jsonContainsId(error.metadata, workflow.id) || error.message.includes(workflow.id));

    if (!hasEvent && !hasAudit) {
      orphanWorkflows += 1;
      issues.push({
        id: `orphan_workflow:${workflow.id}`,
        type: "orphan_workflow",
        severity: workflow.status === "FAILED" || workflow.status === "CANCELED" ? "error" : "warning",
        status: "Needs approval",
        title: "Workflow lacks event or audit correlation",
        summary: `${workflow.workflowId} (${workflow.status}) has no linked EventLog or AuditLog in the current trace window.`,
        relatedIds: [workflow.id],
        detectedAt,
      });
    }

    if ((workflow.status === "FAILED" || workflow.status === "CANCELED") && !hasError) {
      issues.push({
        id: `missing_event:${workflow.id}`,
        type: "missing_event",
        severity: "warning",
        status: "Needs approval",
        title: "Failed workflow lacks incident correlation",
        summary: `${workflow.workflowId} failed or canceled without a matching ErrorLog in the current trace window.`,
        relatedIds: [workflow.id],
        detectedAt,
      });
    }
  }

  for (const approval of input.approvals) {
    if (approval.verificationStatus !== "Configured") {
      missingAuditLinks += 1;
      issues.push({
        id: `approval_mismatch:${approval.id}`,
        type: approval.verificationReasons.some((reason) => /audit/i.test(reason)) ? "missing_audit" : "approval_mismatch",
        severity: approval.verificationStatus === "Blocked" ? "error" : "warning",
        status: approval.verificationStatus,
        title: "Approval lifecycle needs verification",
        summary: approval.verificationReasons[0] ?? "Approval lifecycle has incomplete correlation.",
        relatedIds: [approval.id, ...approval.relatedTraceIds.slice(0, 4)],
        detectedAt,
      });
    }
  }

  for (const queue of input.queues) {
    if (queue.failed > 0) {
      queueMismatches += 1;
      issues.push({
        id: `queue_mismatch:${queue.name}`,
        type: "queue_mismatch",
        severity: "warning",
        status: "Needs approval",
        title: "Queue has failed jobs",
        summary: `${queue.name} reports ${queue.failed} failed jobs. Inspect worker logs before any live execution.`,
        relatedIds: [queue.name],
        detectedAt,
      });
    }
  }

  const openIncidents = input.errors.filter((error) => !error.resolved).length;
  for (const error of input.errors.filter((item) => !item.resolved && (item.severity === "HIGH" || item.severity === "CRITICAL")).slice(0, 8)) {
    issues.push({
      id: `incident_correlation:${error.id}`,
      type: "incident_correlation",
      severity: traceSeverityFromRisk(error.severity),
      status: "Blocked",
      title: "High-risk incident is open",
      summary: summarizeText(error.message),
      relatedIds: [error.id],
      detectedAt,
    });
  }

  const status: OperationsTraceStatus = issues.some((issue) => issue.status === "Blocked") ? "Blocked" : issues.length ? "Needs approval" : "Configured";

  return {
    status,
    checks: {
      totalTraces: input.traces.length,
      correlatedApprovals: input.approvals.filter((approval) => approval.verificationStatus === "Configured").length,
      orphanWorkflows,
      missingAuditLinks,
      queueMismatches,
      openIncidents,
    },
    issues: issues.slice(0, 40),
  };
}

function buildOperationalCorrelations(input: {
  approvals: ApprovalReadModel[];
  workflows: WorkflowLike[];
  events: EventLike[];
  errors: ErrorLike[];
  renders: RenderLike[];
  assets: AssetLike[];
}): OperationalCorrelation[] {
  const correlations: OperationalCorrelation[] = [];

  for (const approval of input.approvals) {
    for (const relatedId of approval.relatedTraceIds.slice(0, 4)) {
      correlations.push({
        id: `approval_to_audit:${approval.id}:${relatedId}`,
        fromId: approval.id,
        toId: relatedId,
        kind: "approval_to_audit",
        label: "Approval has linked trace evidence.",
        status: approval.verificationStatus,
      });
    }
  }

  for (const workflow of input.workflows) {
    const event = input.events.find((item) => eventMatchesWorkflow(item, workflow.id));
    if (event) {
      correlations.push({
        id: `workflow_to_event:${workflow.id}:${event.id}`,
        fromId: workflow.id,
        toId: event.id,
        kind: "workflow_to_event",
        label: `${workflow.workflowId} is linked to an orchestration event.`,
        status: traceStatusFromTask(workflow.status),
      });
    }

    const error = input.errors.find((item) => jsonContainsId(item.metadata, workflow.id) || item.message.includes(workflow.id));
    if (error) {
      correlations.push({
        id: `workflow_to_error:${workflow.id}:${error.id}`,
        fromId: workflow.id,
        toId: error.id,
        kind: "workflow_to_error",
        label: `${workflow.workflowId} is linked to an incident.`,
        status: error.resolved ? "Configured" : "Blocked",
      });
    }
  }

  for (const render of input.renders) {
    const asset = input.assets.find((item) => item.contentId && item.contentId === render.contentId);
    if (asset) {
      correlations.push({
        id: `render_to_asset:${render.id}:${asset.id}`,
        fromId: render.id,
        toId: asset.id,
        kind: "render_to_asset",
        label: "Render metadata is linked to an asset record.",
        status: traceStatusFromTask(render.status),
      });
    }
  }

  return correlations.slice(0, 40);
}

async function buildProductionDiagnostics(input: { queues: OperationsQueueSnapshot[]; integrity: TraceIntegrityReport }): Promise<ProductionDiagnostic[]> {
  const env = getEnv();
  const providerConfig = getProviderConfig();
  const database = await getDatabaseStatus();
  const queueFailures = input.queues.reduce((sum, queue) => sum + queue.failed, 0);
  const hasLiveQueue = input.queues.some((queue) => queue.mode === "live");
  const diagnostics: ProductionDiagnostic[] = [
    {
      id: "deployment.vercel",
      category: "deployment",
      label: "Deployment runtime",
      status: process.env.VERCEL ? "Configured" : "Not connected",
      summary: process.env.VERCEL ? "Running inside Vercel runtime." : "Local runtime detected; production deployment status must be verified separately.",
      evidence: [process.env.VERCEL ? "VERCEL runtime flag detected." : "VERCEL runtime flag not present.", process.env.VERCEL_REGION ? "Deployment region metadata is present." : "Deployment region metadata is not present locally."],
      safeAction: "Verify production deployment from Vercel before live activation.",
    },
    {
      id: "deployment.urls",
      category: "environment",
      label: "Application URLs",
      status: env.APP_BASE_URL && env.NEXTAUTH_URL ? "Configured" : "Needs approval",
      summary: "APP_BASE_URL and NEXTAUTH_URL are required for reliable auth redirects and production diagnostics.",
      evidence: [env.APP_BASE_URL ? "APP_BASE_URL configured." : "APP_BASE_URL missing.", env.NEXTAUTH_URL ? "NEXTAUTH_URL configured." : "NEXTAUTH_URL missing."],
      safeAction: "Set URL env values through deployment secrets only.",
    },
    {
      id: "auth.secret",
      category: "auth",
      label: "Authentication secret",
      status: diagnosticStatus(isAuthConfigured()),
      summary: isAuthConfigured() ? "Session signing is configured." : "AUTH_SECRET is missing or still the placeholder value.",
      evidence: [isAuthConfigured() ? "AUTH_SECRET configured." : "AUTH_SECRET unavailable."],
      safeAction: "Configure AUTH_SECRET as a server-only secret before production login testing.",
    },
    {
      id: "database.connection",
      category: "database",
      label: "Database connection",
      status: database.status === "live" ? "Live" : database.status === "not_connected" ? "Not connected" : "Blocked",
      summary: database.message,
      evidence: [database.status],
      safeAction: "Keep database credentials server-only and verify RLS before applying new migrations.",
    },
    {
      id: "queue.runtime",
      category: "queue",
      label: "Queue runtime",
      status: hasLiveQueue ? (queueFailures > 0 ? "Needs approval" : "Configured") : "Mock",
      summary: hasLiveQueue ? "Redis/BullMQ queue mode is live for at least one queue." : "Queues are in mock-safe mode.",
      evidence: [`queueMode=${hasLiveQueue ? "live" : "mock"}`, `failedJobs=${queueFailures}`],
      safeAction: "Do not enable live workers until queue drain, retry, and kill-switch checks are rehearsed.",
    },
    {
      id: "provider.ai",
      category: "provider",
      label: "AI provider readiness",
      status: providerConfig.ai.openai.status === "configured" || env.GEMINI_API_KEY ? "Needs approval" : "Not connected",
      summary: "AI provider credentials alone must not activate execution.",
      evidence: [providerConfig.ai.openai.status === "configured" ? "OpenAI credential configured." : "OpenAI not connected.", env.GEMINI_API_KEY ? "Gemini credential configured." : "Gemini not connected."],
      safeAction: "Require approval, budget validation, activation stage, and kill-switch checks before provider execution.",
    },
    {
      id: "provider.media",
      category: "provider",
      label: "Media provider readiness",
      status: providerConfig.media.comfyui === "configured" || providerConfig.media.ffmpeg === "configured" || providerConfig.media.localWorker === "configured" ? "Needs approval" : "Not connected",
      summary: "Media worker settings are treated as setup state only until governed rendering is explicitly approved.",
      evidence: [`comfyui=${providerConfig.media.comfyui}`, `ffmpeg=${providerConfig.media.ffmpeg}`, `worker=${providerConfig.media.localWorker}`],
      safeAction: "Keep real ComfyUI/FFmpeg execution blocked until worker enforcement and approval gates are verified.",
    },
    {
      id: "governance.defaults",
      category: "governance",
      label: "Governance defaults",
      status: !env.ALLOW_PUBLIC_PUBLISH && !env.ALLOW_PAID_TOOLS && !env.ALLOW_BROWSER_AUTOMATION && env.REQUIRE_HUMAN_APPROVAL ? "Configured" : "Blocked",
      summary: "Production governance defaults should block public publishing, paid tools, and browser automation while requiring approval.",
      evidence: [
        `ALLOW_PUBLIC_PUBLISH=${env.ALLOW_PUBLIC_PUBLISH}`,
        `ALLOW_PAID_TOOLS=${env.ALLOW_PAID_TOOLS}`,
        `ALLOW_BROWSER_AUTOMATION=${env.ALLOW_BROWSER_AUTOMATION}`,
        `REQUIRE_HUMAN_APPROVAL=${env.REQUIRE_HUMAN_APPROVAL}`,
      ],
      safeAction: "Do not loosen governance defaults without an approval record, rollback plan, and audit trail.",
    },
    {
      id: "trace.integrity",
      category: "governance",
      label: "Trace integrity",
      status: input.integrity.status,
      summary: input.integrity.issues.length ? `${input.integrity.issues.length} integrity issue(s) need review.` : "No trace integrity issues detected in the current window.",
      evidence: [`orphanWorkflows=${input.integrity.checks.orphanWorkflows}`, `missingAuditLinks=${input.integrity.checks.missingAuditLinks}`, `openIncidents=${input.integrity.checks.openIncidents}`],
      safeAction: "Resolve trace mismatches before enabling live provider, queue, rendering, or publishing execution.",
    },
  ];

  return diagnostics;
}

function emptyIntegrity(): TraceIntegrityReport {
  return {
    status: "Not connected",
    checks: {
      totalTraces: 1,
      correlatedApprovals: 0,
      orphanWorkflows: 0,
      missingAuditLinks: 0,
      queueMismatches: 0,
      openIncidents: 0,
    },
    issues: [],
  };
}

export function createFallbackOperationsTraceDashboard(reason = "Database unavailable or trace read failed."): OperationsTraceDashboard {
  const queues: OperationsQueueSnapshot[] = [];
  const integrity = emptyIntegrity();

  return {
    mode: "read_only",
    generatedAt: new Date().toISOString(),
    databaseStatus: hasDatabaseUrl() ? "Configured" : "Not connected",
    queueMode: "mock",
    summary: {
      audits: 0,
      events: 0,
      workflows: 0,
      errors: 0,
      pendingApprovals: 0,
      verifiedApprovals: 0,
      blockedRuns: 0,
      renders: 0,
      assets: 0,
      integrityIssues: 0,
    },
    safetyPosture: buildSafetyPosture(),
    queues,
    approvals: [],
    integrity,
    diagnostics: [],
    correlations: [],
    traces: [
      {
        id: "operations_trace_fallback",
        source: "safety",
        title: "Operations trace fallback",
        summary: reason,
        status: hasDatabaseUrl() ? "Blocked" : "Not connected",
        severity: "warning",
        riskLevel: "MEDIUM",
        createdAt: new Date().toISOString(),
        target: "operations_trace",
        metadataKeys: [],
      },
    ],
    pagination: { total: 1, returned: 1, pageSize: DEFAULT_PAGE_SIZE },
    notes: [
      "Read-only surface: no workflow, provider, publishing, rendering, or platform execution is triggered.",
      "Raw metadata values are not exposed here; only safe metadata key names are shown.",
    ],
  };
}

export async function getOperationsTraceDashboard(): Promise<OperationsTraceDashboard> {
  const queueHealth = await getQueueHealth();
  const queues: OperationsQueueSnapshot[] = queueHealth.map((queue) => ({
    name: queue.name,
    mode: queue.mode,
    waiting: queue.waiting,
    active: queue.active,
    delayed: queue.delayed,
    failed: queue.failed,
    completed: queue.completed,
    status: queue.status,
  }));

  if (!hasDatabaseUrl()) {
    const fallback = createFallbackOperationsTraceDashboard("DATABASE_URL is not configured, so only mock queue and safety posture can be shown.");
    const integrity = buildTraceIntegrityReport({ traces: fallback.traces, approvals: [], workflows: [], events: [], audits: [], errors: [], queues });
    return {
      ...fallback,
      queues,
      queueMode: queues.some((queue) => queue.mode === "live") ? "live" : "mock",
      integrity,
      diagnostics: await buildProductionDiagnostics({ queues, integrity }),
    };
  }

  try {
    const db = getDb();
    const [audits, events, workflows, errors, approvals, renders, assets] = await Promise.all([
      db.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        include: { actor: { select: { email: true, role: true } } },
        take: 80,
      }),
      db.eventLog.findMany({ orderBy: { createdAt: "desc" }, take: 80 }),
      db.workflowRun.findMany({ orderBy: { updatedAt: "desc" }, take: 80 }),
      db.errorLog.findMany({ orderBy: [{ resolved: "asc" }, { createdAt: "desc" }], take: 60 }),
      db.approval.findMany({ orderBy: [{ status: "asc" }, { createdAt: "desc" }], take: 60 }),
      db.render.findMany({ orderBy: { updatedAt: "desc" }, take: 40 }),
      db.asset.findMany({ orderBy: { createdAt: "desc" }, take: 40 }),
    ]);

    const approvalModels = buildApprovalReadModels({ approvals, audits, workflows, errors });
    const traces: OperationsTraceItem[] = [
      ...audits.map((item): OperationsTraceItem => ({
        id: item.id,
        source: "audit",
        title: item.action,
        summary: summarizeText(item.target ?? "System audit event"),
        status: item.riskLevel === "LOW" ? "Configured" : item.riskLevel === "MEDIUM" ? "Needs approval" : "Blocked",
        severity: traceSeverityFromRisk(item.riskLevel),
        riskLevel: item.riskLevel,
        createdAt: iso(item.createdAt),
        actor: item.actor ? `${item.actor.email} (${item.actor.role})` : "system",
        target: item.target ?? undefined,
        metadataKeys: safeMetadataKeys(item.metadata),
      })),
      ...events.map((item): OperationsTraceItem => ({
        id: item.id,
        source: "event",
        title: item.type,
        summary: summarizeText(item.subject ?? readString(item.payload, "message") ?? "Orchestration event"),
        status: "Mock",
        severity: "info",
        riskLevel: "LOW",
        createdAt: iso(item.createdAt),
        target: item.subject ?? readString(item.payload, "correlationId"),
        metadataKeys: safeMetadataKeys(item.payload),
      })),
      ...workflows.map((item): OperationsTraceItem => ({
        id: item.id,
        source: "workflow",
        title: item.workflowId,
        summary: item.logs ? summarizeText(item.logs) : `Workflow status is ${item.status}.`,
        status: traceStatusFromTask(item.status),
        severity: item.status === "FAILED" || item.status === "CANCELED" ? "error" : item.status === "PAUSED" ? "warning" : "info",
        riskLevel: item.status === "FAILED" || item.status === "CANCELED" ? "HIGH" : item.status === "PAUSED" ? "MEDIUM" : "LOW",
        createdAt: iso(item.updatedAt),
        target: workflowProviderLabel(item),
        metadataKeys: [...safeMetadataKeys(item.input), ...safeMetadataKeys(item.output)].slice(0, 8),
      })),
      ...errors.map((item): OperationsTraceItem => ({
        id: item.id,
        source: "error",
        title: item.source,
        summary: summarizeText(item.message),
        status: item.resolved ? "Configured" : "Blocked",
        severity: item.resolved ? "info" : traceSeverityFromRisk(item.severity),
        riskLevel: item.severity,
        createdAt: iso(item.createdAt),
        target: item.resolved ? "resolved" : "open",
        metadataKeys: safeMetadataKeys(item.metadata),
      })),
      ...approvals.map((item): OperationsTraceItem => ({
        id: item.id,
        source: "approval",
        title: item.title,
        summary: summarizeText(item.reason ?? item.type),
        status: traceStatusFromApproval(item.status),
        severity: item.status === "PENDING" ? "warning" : item.status === "APPROVED" ? "info" : "error",
        riskLevel: item.riskLevel,
        createdAt: iso(item.createdAt),
        target: item.type,
        metadataKeys: safeMetadataKeys(item.payload),
      })),
      ...renders.map((item): OperationsTraceItem => ({
        id: item.id,
        source: "render",
        title: item.providerId ?? "render-provider-not-connected",
        summary: item.logs ? summarizeText(item.logs) : `Render status is ${item.status}.`,
        status: traceStatusFromTask(item.status),
        severity: item.status === "FAILED" ? "error" : item.status === "QUEUED" || item.status === "RUNNING" ? "warning" : "info",
        riskLevel: item.status === "FAILED" ? "HIGH" : item.status === "QUEUED" || item.status === "RUNNING" ? "MEDIUM" : "LOW",
        createdAt: iso(item.updatedAt),
        target: item.outputPath ?? item.contentId ?? undefined,
        metadataKeys: safeMetadataKeys(item.metadata),
      })),
      ...assets.map((item): OperationsTraceItem => ({
        id: item.id,
        source: "asset",
        title: item.name,
        summary: summarizeText(`${item.type} asset registered at ${item.path}`),
        status: "Mock",
        severity: "info",
        riskLevel: "LOW",
        createdAt: iso(item.createdAt),
        target: item.contentId ?? undefined,
        metadataKeys: safeMetadataKeys(item.metadata),
      })),
      ...queues.map((queue): OperationsTraceItem => ({
        id: `queue_${queue.name}`,
        source: "queue",
        title: queue.name,
        summary: `${queue.mode} queue: ${queue.waiting} waiting, ${queue.active} active, ${queue.failed} failed.`,
        status: queue.mode === "live" ? "Configured" : "Mock",
        severity: queueSeverity(queue),
        riskLevel: queue.failed > 0 ? "MEDIUM" : "LOW",
        createdAt: new Date().toISOString(),
        target: queue.status,
        metadataKeys: ["waiting", "active", "delayed", "failed", "completed"],
      })),
    ];

    const sortedTraces = traces.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, MAX_TRACES);
    const integrity = buildTraceIntegrityReport({ traces: sortedTraces, approvals: approvalModels, workflows, events, audits, errors, queues });
    const correlations = buildOperationalCorrelations({ approvals: approvalModels, workflows, events, errors, renders, assets });

    return {
      mode: "read_only",
      generatedAt: new Date().toISOString(),
      databaseStatus: "Configured",
      queueMode: queues.some((queue) => queue.mode === "live") ? "live" : "mock",
      summary: {
        audits: audits.length,
        events: events.length,
        workflows: workflows.length,
        errors: errors.filter((item) => !item.resolved).length,
        pendingApprovals: approvals.filter((item) => item.status === "PENDING").length,
        verifiedApprovals: approvalModels.filter((item) => item.verificationStatus === "Configured").length,
        blockedRuns: workflows.filter((item) => item.status === "FAILED" || item.status === "CANCELED").length,
        renders: renders.length,
        assets: assets.length,
        integrityIssues: integrity.issues.length,
      },
      safetyPosture: buildSafetyPosture(),
      queues,
      approvals: approvalModels,
      integrity,
      diagnostics: await buildProductionDiagnostics({ queues, integrity }),
      correlations,
      traces: sortedTraces,
      pagination: { total: traces.length, returned: sortedTraces.length, pageSize: DEFAULT_PAGE_SIZE },
      notes: [
        "Read-only surface: no workflow, provider, publishing, rendering, or platform execution is triggered.",
        "Raw metadata values are not exposed here; only safe metadata key names are shown.",
        "Mock queue status means Redis/BullMQ live processing is not enabled for this environment.",
        "Integrity issues are diagnostic prompts for review, not automatic retry, rollback, or mutation instructions.",
      ],
    };
  } catch {
    const fallback = createFallbackOperationsTraceDashboard("Database trace read failed; Folqen returned a safe fallback instead of exposing partial or unsafe state.");
    const integrity = buildTraceIntegrityReport({ traces: fallback.traces, approvals: [], workflows: [], events: [], audits: [], errors: [], queues });
    return {
      ...fallback,
      queues,
      queueMode: queues.some((queue) => queue.mode === "live") ? "live" : "mock",
      integrity,
      diagnostics: await buildProductionDiagnostics({ queues, integrity }),
    };
  }
}
