import type { ApprovalStatus, RiskLevel, TaskStatus } from "@prisma/client";

import { hasDatabaseUrl, getDb } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { getQueueHealth } from "@/lib/orchestration/queue";
import type { OperationsQueueSnapshot, OperationsSafetyPosture, OperationsTraceDashboard, OperationsTraceItem, OperationsTraceSeverity, OperationsTraceStatus } from "./types";

const MAX_TRACES = 140;

function iso(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
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
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];

  return Object.keys(value)
    .filter((key) => !/(secret|token|password|api[_-]?key|credential|authorization)/i.test(key))
    .slice(0, 8);
}

function summarizeError(message: string) {
  return message.replace(/\s+/g, " ").slice(0, 220);
}

function queueSeverity(queue: OperationsQueueSnapshot): OperationsTraceSeverity {
  if (queue.failed > 0) return "warning";
  if (queue.active > 0 || queue.waiting > 0 || queue.delayed > 0) return "info";
  return "info";
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

export function createFallbackOperationsTraceDashboard(reason = "Database unavailable or trace read failed."): OperationsTraceDashboard {
  const queues: OperationsQueueSnapshot[] = [];

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
      blockedRuns: 0,
      renders: 0,
      assets: 0,
    },
    safetyPosture: buildSafetyPosture(),
    queues,
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
    return {
      ...createFallbackOperationsTraceDashboard("DATABASE_URL is not configured, so only mock queue and safety posture can be shown."),
      queues,
      queueMode: queues.some((queue) => queue.mode === "live") ? "live" : "mock",
    };
  }

  try {
    const db = getDb();
    const [audits, events, workflows, errors, approvals, renders, assets] = await Promise.all([
      db.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        include: { actor: { select: { email: true, role: true } } },
        take: 40,
      }),
      db.eventLog.findMany({ orderBy: { createdAt: "desc" }, take: 40 }),
      db.workflowRun.findMany({ orderBy: { updatedAt: "desc" }, take: 40 }),
      db.errorLog.findMany({ orderBy: [{ resolved: "asc" }, { createdAt: "desc" }], take: 30 }),
      db.approval.findMany({ orderBy: [{ status: "asc" }, { createdAt: "desc" }], take: 30 }),
      db.render.findMany({ orderBy: { updatedAt: "desc" }, take: 24 }),
      db.asset.findMany({ orderBy: { createdAt: "desc" }, take: 24 }),
    ]);

    const traces: OperationsTraceItem[] = [
      ...audits.map((item): OperationsTraceItem => ({
        id: item.id,
        source: "audit",
        title: item.action,
        summary: item.target ?? "System audit event",
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
        summary: item.subject ?? "Orchestration event",
        status: "Mock",
        severity: "info",
        riskLevel: "LOW",
        createdAt: iso(item.createdAt),
        target: item.subject ?? undefined,
        metadataKeys: safeMetadataKeys(item.payload),
      })),
      ...workflows.map((item): OperationsTraceItem => ({
        id: item.id,
        source: "workflow",
        title: item.workflowId,
        summary: item.logs ? summarizeError(item.logs) : `Workflow status is ${item.status}.`,
        status: traceStatusFromTask(item.status),
        severity: item.status === "FAILED" || item.status === "CANCELED" ? "error" : item.status === "PAUSED" ? "warning" : "info",
        riskLevel: item.status === "FAILED" || item.status === "CANCELED" ? "HIGH" : item.status === "PAUSED" ? "MEDIUM" : "LOW",
        createdAt: iso(item.updatedAt),
        target: item.providerId ?? undefined,
        metadataKeys: [...safeMetadataKeys(item.input), ...safeMetadataKeys(item.output)].slice(0, 8),
      })),
      ...errors.map((item): OperationsTraceItem => ({
        id: item.id,
        source: "error",
        title: item.source,
        summary: summarizeError(item.message),
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
        summary: item.reason ?? item.type,
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
        summary: item.logs ? summarizeError(item.logs) : `Render status is ${item.status}.`,
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
        summary: `${item.type} asset registered at ${item.path}`,
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
        blockedRuns: workflows.filter((item) => item.status === "FAILED" || item.status === "CANCELED").length,
        renders: renders.length,
        assets: assets.length,
      },
      safetyPosture: buildSafetyPosture(),
      queues,
      traces: sortedTraces,
      notes: [
        "Read-only surface: no workflow, provider, publishing, rendering, or platform execution is triggered.",
        "Raw metadata values are not exposed here; only safe metadata key names are shown.",
        "Mock queue status means Redis/BullMQ live processing is not enabled for this environment.",
      ],
    };
  } catch {
    return {
      ...createFallbackOperationsTraceDashboard("Database trace read failed; Folqen returned a safe fallback instead of exposing partial or unsafe state."),
      queues,
      queueMode: queues.some((queue) => queue.mode === "live") ? "live" : "mock",
    };
  }
}
