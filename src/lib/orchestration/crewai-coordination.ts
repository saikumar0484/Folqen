import { listAgents } from "./registry";
import type { DepartmentId } from "./types";

export function createCrewCoordinationPlan(input: {
  objective: string;
  departmentId: DepartmentId;
  approvalRequired: boolean;
}) {
  const departmentAgents = listAgents().filter((agent) => agent.departmentId === input.departmentId);
  const executive = listAgents().find((agent) => agent.layer === "executive");
  const recovery = listAgents().find((agent) => agent.layer === "error_recovery");
  const memory = listAgents().find((agent) => agent.departmentId === "organizational_memory");

  const crew = [executive, ...departmentAgents, recovery, memory].filter(Boolean);

  return {
    runtime: "crewai-compatible-plan",
    liveRuntime: "not_connected",
    objective: input.objective,
    hierarchy: crew.map((agent) => ({
      id: agent!.id,
      role: agent!.role,
      layer: agent!.layer,
      permissions: agent!.permissions,
    })),
    plan: [
      "Executive receives objective and validates safety boundaries.",
      "Department manager decomposes work into assignable tasks.",
      "Team and worker agents prepare mock-safe outputs.",
      "Organizational Memory captures decisions, traces, and reflection hooks.",
      input.approvalRequired
        ? "Approval checkpoint blocks risky, public, paid, or publishing actions."
        : "Execution remains internal-only because public publishing and paid tools are disabled.",
      "Error Recovery monitors failures and proposes retries or escalation.",
    ],
  };
}
