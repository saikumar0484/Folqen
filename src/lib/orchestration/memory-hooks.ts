import { emitOrchestrationEvent } from "./event-bus";
import type { OrchestrationTask, WorkflowRunPlan } from "./types";

export async function captureTaskMemory(task: OrchestrationTask) {
  await emitOrchestrationEvent({
    type: "memory.task_captured",
    source: "organizational-memory",
    departmentId: "organizational_memory",
    taskId: task.id,
    correlationId: task.correlationId,
    message: `Captured task memory for ${task.title}.`,
    metadata: {
      assignedAgentId: task.assignedAgentId,
      vectorStatus: "vector_pending",
      executionMode: "mock_safe",
    },
  });

  return {
    status: "captured" as const,
    vectorStatus: "not_connected" as const,
    message: "Task memory captured as an event. Vector memory is a future adapter hook.",
  };
}

export async function captureWorkflowMemory(plan: WorkflowRunPlan) {
  await emitOrchestrationEvent({
    type: "memory.workflow_captured",
    source: "organizational-memory",
    departmentId: "organizational_memory",
    workflowRunId: plan.id,
    correlationId: plan.correlationId,
    message: `Captured workflow memory for ${plan.name}.`,
    metadata: {
      assignedAgents: plan.assignedAgents,
      graphTrace: plan.graphTrace,
      vectorStatus: "vector_pending",
    },
  });

  return {
    status: "captured" as const,
    vectorStatus: "not_connected" as const,
    message: "Workflow memory captured as an event. Vector storage remains not connected.",
  };
}
