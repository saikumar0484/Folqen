import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

import { createCorrelationId } from "./event-bus";
import { selectAgentForDepartment } from "./registry";
import type { ApprovalCheckpoint, DepartmentId, OrchestrationPriority, TaskStatus } from "./types";

const FolqenGraphState = Annotation.Root({
  objective: Annotation<string>({
    reducer: (_current, update) => update,
    default: () => "",
  }),
  departmentId: Annotation<DepartmentId>({
    reducer: (_current, update) => update,
    default: () => "research",
  }),
  priority: Annotation<OrchestrationPriority>({
    reducer: (_current, update) => update,
    default: () => "normal",
  }),
  approvalRequired: Annotation<boolean>({
    reducer: (_current, update) => update,
    default: () => true,
  }),
  assignedAgents: Annotation<string[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => [],
  }),
  graphTrace: Annotation<string[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => [],
  }),
  approvalCheckpoint: Annotation<ApprovalCheckpoint | null>({
    reducer: (_current, update) => update,
    default: () => null,
  }),
  status: Annotation<TaskStatus>({
    reducer: (_current, update) => update,
    default: () => "queued",
  }),
  correlationId: Annotation<string>({
    reducer: (_current, update) => update,
    default: () => createCorrelationId("graph"),
  }),
});

export function createFolqenLangGraphDryRun() {
  return new StateGraph(FolqenGraphState)
    .addNode("executive_intake", (state) => ({
      status: "assigned" as TaskStatus,
      graphTrace: [`Executive intake accepted objective: ${state.objective}`],
    }))
    .addNode("department_delegation", (state) => {
      const agent = selectAgentForDepartment(state.departmentId);
      return {
        status: "running" as TaskStatus,
        assignedAgents: agent ? [agent.id] : [],
        graphTrace: [`Department delegation routed to ${agent?.name ?? "fallback agent"}.`],
      };
    })
    .addNode("approval_checkpoint", (state) => ({
      status: state.approvalRequired ? ("waiting_for_approval" as TaskStatus) : ("completed" as TaskStatus),
      approvalCheckpoint: {
        id: `approval_${state.correlationId}`,
        reason: state.approvalRequired
          ? "Human approval required before risky, public, paid, or external actions."
          : "Approval not required for this internal mock-safe run.",
        riskLevel: state.priority === "urgent" || state.priority === "high" ? "high" : "medium",
        requiredRole: "owner",
        status: state.approvalRequired ? "pending" : "not_required",
      },
      graphTrace: ["Approval checkpoint evaluated safety gates."],
    }))
    .addNode("memory_reflection", (state) => ({
      graphTrace: [`Memory reflection queued for ${state.departmentId}.`],
    }))
    .addEdge(START, "executive_intake")
    .addEdge("executive_intake", "department_delegation")
    .addEdge("department_delegation", "approval_checkpoint")
    .addEdge("approval_checkpoint", "memory_reflection")
    .addEdge("memory_reflection", END)
    .compile();
}

export async function runLangGraphDryRun(input: {
  objective: string;
  departmentId: DepartmentId;
  priority: OrchestrationPriority;
  approvalRequired: boolean;
  correlationId?: string;
}) {
  const graph = createFolqenLangGraphDryRun();
  return graph.invoke({
    objective: input.objective,
    departmentId: input.departmentId,
    priority: input.priority,
    approvalRequired: input.approvalRequired,
    correlationId: input.correlationId ?? createCorrelationId("graph"),
  });
}
