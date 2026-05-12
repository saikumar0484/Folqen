import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";

import { createAuditLog } from "@/lib/audit";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import type { DepartmentId, EventSeverity, OrchestrationEvent } from "./types";

const globalStore = globalThis as typeof globalThis & {
  folqenOrchestrationEvents?: OrchestrationEvent[];
};

const eventStore = globalStore.folqenOrchestrationEvents ?? [];
globalStore.folqenOrchestrationEvents = eventStore;

export function createCorrelationId(prefix = "corr") {
  return `${prefix}_${randomUUID()}`;
}

export function createOrchestrationEvent(input: {
  type: string;
  severity?: EventSeverity;
  source: string;
  message: string;
  departmentId?: DepartmentId;
  agentId?: string;
  taskId?: string;
  workflowRunId?: string;
  correlationId?: string;
  metadata?: Record<string, unknown>;
}): OrchestrationEvent {
  return {
    id: `evt_${randomUUID()}`,
    type: input.type,
    severity: input.severity ?? "info",
    source: input.source,
    departmentId: input.departmentId,
    agentId: input.agentId,
    taskId: input.taskId,
    workflowRunId: input.workflowRunId,
    correlationId: input.correlationId ?? createCorrelationId(),
    message: input.message,
    metadata: input.metadata ?? {},
    createdAt: new Date().toISOString(),
  };
}

export async function publishOrchestrationEvent(event: OrchestrationEvent) {
  eventStore.unshift(event);
  eventStore.splice(250);

  if (hasDatabaseUrl()) {
    try {
      const eventPayload = JSON.parse(JSON.stringify(event)) as Prisma.InputJsonValue;
      await getDb().eventLog.create({
        data: {
          type: event.type,
          subject: event.source,
          payload: eventPayload,
        },
      });

      if (event.severity === "warning" || event.severity === "error" || event.severity === "critical") {
        await createAuditLog({
          action: `orchestration.${event.type}`,
          target: event.id,
          riskLevel: event.severity === "critical" ? "CRITICAL" : event.severity === "error" ? "HIGH" : "MEDIUM",
          metadata: eventPayload,
        });
      }
    } catch (error) {
      eventStore.unshift(
        createOrchestrationEvent({
          type: "event_persistence_failed",
          severity: "warning",
          source: "event-bus",
          message: "Event persisted in memory only because database write failed.",
          correlationId: event.correlationId,
          metadata: { error: error instanceof Error ? error.message : "Unknown error" },
        }),
      );
    }
  }

  return event;
}

export async function emitOrchestrationEvent(input: Parameters<typeof createOrchestrationEvent>[0]) {
  return publishOrchestrationEvent(createOrchestrationEvent(input));
}

export function listRecentOrchestrationEvents(limit = 50) {
  return eventStore.slice(0, limit);
}
