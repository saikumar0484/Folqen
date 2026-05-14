import { randomUUID } from "crypto";
import { z } from "zod";

import { createCorrelationId, emitOrchestrationEvent, listRecentOrchestrationEvents } from "./event-bus";
import { createCrewCoordinationPlan } from "./crewai-coordination";
import { runLangGraphDryRun } from "./langgraph-flows";
import { captureTaskMemory, captureWorkflowMemory } from "./memory-hooks";
import { enqueueOrchestrationJob, ORCHESTRATION_QUEUES } from "./queue";
import { listAgents, listDepartments, selectAgentForDepartment } from "./registry";
import type { DepartmentId, OrchestrationTask, WorkflowRunPlan } from "./types";

const departmentIdSchema = z.enum([
  "research",
  "content",
  "platform_operations",
  "analytics",
  "optimization",
  "infrastructure",
  "error_recovery",
  "organizational_memory",
]);

const prioritySchema = z.enum(["low", "normal", "high", "urgent"]);

export const taskInputSchema = z.object({
  title: z.string().min(3).max(140),
  description: z.string().min(10).max(2000),
  departmentId: departmentIdSchema,
  priority: prioritySchema.default("normal"),
  riskLevel: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  approvalRequired: z.boolean().default(true),
  dependencies: z.array(z.string()).default([]),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const workflowRunSchema = z.object({
  name: z.string().min(3).max(140),
  objective: z.string().min(10).max(2000),
  departmentId: departmentIdSchema,
  priority: prioritySchema.default("normal"),
  approvalRequired: z.boolean().default(true),
  steps: z.array(z.string()).default([]),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export function getAgentRegistrySnapshot() {
  const departments = listDepartments();
  const agents = listAgents();

  return {
    departments,
    agents,
    hierarchy: {
      executive: agents.filter((agent) => agent.layer === "executive"),
      departmentManagers: agents.filter((agent) => agent.layer === "department_manager"),
      teamLeads: agents.filter((agent) => agent.layer === "team_lead"),
      workers: agents.filter((agent) => agent.layer === "worker"),
      utilityAgents: agents.filter((agent) => agent.layer === "utility"),
      errorRecoveryAgents: agents.filter((agent) => agent.layer === "error_recovery"),
      optimizationAgents: agents.filter((agent) => agent.layer === "optimization"),
    },
  };
}

export async function delegateTask(rawInput: unknown): Promise<OrchestrationTask> {
  const input = taskInputSchema.parse(rawInput);
  const agent = selectAgentForDepartment(input.departmentId);

  if (!agent) {
    throw new Error(`No available agent found for department ${input.departmentId}.`);
  }

  const now = new Date().toISOString();
  const correlationId = createCorrelationId("task");
  const queueResult = await enqueueOrchestrationJob({
    queueName: ORCHESTRATION_QUEUES.tasks,
    name: "task.delegate",
    data: { input, assignedAgentId: agent.id, correlationId },
  });

  const task: OrchestrationTask = {
    id: `task_${randomUUID()}`,
    title: input.title,
    description: input.description,
    departmentId: input.departmentId,
    priority: input.priority,
    riskLevel: input.riskLevel,
    approvalRequired: input.approvalRequired,
    dependencies: input.dependencies,
    metadata: {
      ...input.metadata,
      executionMode: queueResult.mode,
      safety: "mock_safe",
      paidTools: "blocked",
      publicPublishing: "blocked",
    },
    status: input.approvalRequired ? "waiting_for_approval" : "assigned",
    assignedAgentId: agent.id,
    assignedAgentName: agent.name,
    createdAt: now,
    updatedAt: now,
    queueJobId: queueResult.jobId,
    correlationId,
  };

  await emitOrchestrationEvent({
    type: "task.delegated",
    source: "task-orchestration",
    departmentId: input.departmentId,
    agentId: agent.id,
    taskId: task.id,
    correlationId,
    message: `Delegated ${input.title} to ${agent.name}.`,
    metadata: { queue: queueResult, approvalRequired: input.approvalRequired },
  });

  await captureTaskMemory(task);
  return task;
}

export async function runWorkflow(rawInput: unknown): Promise<WorkflowRunPlan> {
  const input = workflowRunSchema.parse(rawInput);
  const correlationId = createCorrelationId("workflow");
  const graphResult = await runLangGraphDryRun({
    objective: input.objective,
    departmentId: input.departmentId as DepartmentId,
    priority: input.priority,
    approvalRequired: input.approvalRequired,
    correlationId,
  });
  const crew = createCrewCoordinationPlan({
    objective: input.objective,
    departmentId: input.departmentId as DepartmentId,
    approvalRequired: input.approvalRequired,
  });
  const queueResult = await enqueueOrchestrationJob({
    queueName: ORCHESTRATION_QUEUES.workflows,
    name: "workflow.execute",
    data: { input, graphResult, crew, correlationId },
  });

  const plan: WorkflowRunPlan = {
    id: `workflow_${randomUUID()}`,
    name: input.name,
    objective: input.objective,
    departmentId: input.departmentId as DepartmentId,
    status: graphResult.status,
    assignedAgents: graphResult.assignedAgents,
    steps: input.steps.length > 0 ? input.steps : crew.plan,
    approvalCheckpoint: graphResult.approvalCheckpoint ?? {
      id: `approval_${correlationId}`,
      reason: "Approval checkpoint was not generated by the graph.",
      riskLevel: "medium",
      requiredRole: "owner",
      status: "pending",
    },
    correlationId,
    graphTrace: graphResult.graphTrace,
    crewPlan: crew.plan,
    queueJobId: queueResult.jobId,
    createdAt: new Date().toISOString(),
  };

  await emitOrchestrationEvent({
    type: "workflow.planned",
    source: "workflow-engine",
    departmentId: plan.departmentId,
    workflowRunId: plan.id,
    correlationId,
    message: `Workflow planned: ${plan.name}.`,
    metadata: {
      status: plan.status,
      queue: queueResult,
      assignedAgents: plan.assignedAgents,
      crewRuntime: crew.runtime,
      liveCrewRuntime: crew.liveRuntime,
    },
  });

  await captureWorkflowMemory(plan);
  return plan;
}

export function getRecentEvents(limit = 50) {
  return listRecentOrchestrationEvents(limit);
}
