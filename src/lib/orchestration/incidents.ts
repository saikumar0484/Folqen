import { randomUUID } from "crypto";

import { emitOrchestrationEvent } from "./event-bus";
import { enqueueOrchestrationJob, ORCHESTRATION_QUEUES } from "./queue";
import type { IncidentReport, IncidentReportInput } from "./types";

export async function reportIncident(input: IncidentReportInput): Promise<IncidentReport> {
  const createdAt = new Date().toISOString();
  const incident: IncidentReport = {
    id: `incident_${randomUUID()}`,
    status: input.severity === "critical" ? "triaged" : "open",
    recoveryPlan: [
      "Capture incident event and preserve workflow context.",
      "Check retry eligibility and prevent duplicate retry storms.",
      "Use mock-safe rollback plan until real provider adapters are configured.",
      "Escalate to human approval before provider switching, public publishing, or paid tool usage.",
    ],
    escalationRequired: input.severity === "critical" || input.severity === "error",
    createdAt,
    input,
  };

  await emitOrchestrationEvent({
    type: "incident.reported",
    severity: input.severity,
    source: "incident-recovery",
    departmentId: input.departmentId ?? "error_recovery",
    agentId: input.agentId,
    taskId: input.taskId,
    workflowRunId: input.workflowRunId,
    message: input.title,
    metadata: {
      summary: input.summary,
      recoveryPlan: incident.recoveryPlan,
      escalationRequired: incident.escalationRequired,
      ...input.metadata,
    },
  });

  await enqueueOrchestrationJob({
    queueName: ORCHESTRATION_QUEUES.incidents,
    name: "incident.recovery.plan",
    data: { incident },
  });

  return incident;
}
