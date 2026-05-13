import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { delegateTask, getAgentRegistrySnapshot, runWorkflow } from "./service";
import { getQueueHealth } from "./queue";

describe("Folqen orchestration infrastructure", () => {
  it("models the required departments and hierarchy layers", () => {
    const snapshot = getAgentRegistrySnapshot();

    assert.equal(snapshot.departments.length, 9);
    assert.equal(snapshot.departments.some((department) => department.id === "browser_operations"), true);
    assert.equal(snapshot.hierarchy.executive.some((agent) => agent.id === "chief-creator-officer"), true);
    assert.equal(snapshot.hierarchy.errorRecoveryAgents.some((agent) => agent.id === "recovery-manager"), true);
    assert.equal(snapshot.agents.every((agent) => agent.permissions.length > 0), true);
  });

  it("delegates tasks to an agent with approval and mock-safe queue metadata", async () => {
    const task = await delegateTask({
      title: "Research haunted fort topic",
      description: "Create a sourced research packet for an India-based urban legend episode.",
      departmentId: "research",
      priority: "high",
      approvalRequired: true,
    });

    assert.ok(task.assignedAgentId);
    assert.equal(task.status, "waiting_for_approval");
    assert.match(task.queueJobId ?? "", /^mock_job_/);
    assert.equal(task.metadata.publicPublishing, "blocked");
    assert.equal(task.metadata.paidTools, "blocked");
  });

  it("creates a LangGraph-backed workflow plan with CrewAI-compatible coordination", async () => {
    const workflow = await runWorkflow({
      name: "Create mystery short package",
      objective: "Coordinate research, content, review, and memory capture for a short-form mystery package.",
      departmentId: "content",
      approvalRequired: true,
    });

    assert.equal(workflow.status, "waiting_for_approval");
    assert.equal(workflow.approvalCheckpoint.status, "pending");
    assert.ok(workflow.graphTrace.length > 0);
    assert.equal(workflow.crewPlan.some((step) => step.includes("Approval checkpoint")), true);
  });

  it("reports mock-safe queue health without requiring Redis", async () => {
    const queues = await getQueueHealth();

    assert.ok(queues.length >= 5);
    assert.equal(queues.every((queue) => queue.mode === "mock"), true);
  });
});
