import assert from "node:assert/strict";
import test from "node:test";

import { buildApprovalReadModels, buildTraceIntegrityReport, createFallbackOperationsTraceDashboard, redactSensitiveText, safeMetadataKeys, traceSeverityFromRisk, traceStatusFromApproval, traceStatusFromTask } from "./service";

test("operations trace maps risk, task, and approval statuses to honest labels", () => {
  assert.equal(traceSeverityFromRisk("CRITICAL"), "critical");
  assert.equal(traceSeverityFromRisk("HIGH"), "error");
  assert.equal(traceSeverityFromRisk("MEDIUM"), "warning");
  assert.equal(traceSeverityFromRisk("LOW"), "info");

  assert.equal(traceStatusFromTask("COMPLETED"), "Configured");
  assert.equal(traceStatusFromTask("QUEUED"), "Mock");
  assert.equal(traceStatusFromTask("FAILED"), "Blocked");

  assert.equal(traceStatusFromApproval("PENDING"), "Needs approval");
  assert.equal(traceStatusFromApproval("APPROVED"), "Configured");
  assert.equal(traceStatusFromApproval("REJECTED"), "Blocked");
});

test("operations trace metadata exposes safe keys only", () => {
  assert.deepEqual(safeMetadataKeys({ workflowKind: "x", apiKey: "secret", token: "hidden", queueJobId: "job_1", nested: { ok: true } }), ["workflowKind", "queueJobId", "nested"]);
  assert.deepEqual(safeMetadataKeys(null), []);
  assert.deepEqual(safeMetadataKeys(["not", "a", "record"]), []);
  assert.equal(redactSensitiveText("token=abc123 Bearer live-secret sk-test-secret-value"), "token=[redacted] Bearer [redacted] [redacted-api-key]");
});

test("fallback operations trace dashboard is read-only and execution safe", () => {
  const dashboard = createFallbackOperationsTraceDashboard("No database in this test.");

  assert.equal(dashboard.mode, "read_only");
  assert.equal(dashboard.queueMode, "mock");
  assert.equal(dashboard.summary.audits, 0);
  assert.equal(dashboard.traces[0].status === "Not connected" || dashboard.traces[0].status === "Blocked", true);
  assert.equal(dashboard.notes.some((note) => note.includes("no workflow")), true);
  assert.equal(dashboard.safetyPosture.some((item) => item.id === "public_publishing" && item.status === "Blocked"), true);
  assert.equal(dashboard.safetyPosture.some((item) => item.id === "paid_tools" && item.status === "Blocked"), true);
});

test("approval read model builds lifecycle and verification indicators", () => {
  const createdAt = new Date("2026-05-13T10:00:00.000Z");
  const approvals = [
    {
      id: "approval_1",
      type: "governance.provider_activation",
      title: "Approve provider activation",
      status: "APPROVED" as const,
      riskLevel: "HIGH" as const,
      reason: "Operator approved controlled dry-run rollback path.",
      requestedBy: "user_1",
      decidedAt: new Date("2026-05-13T10:10:00.000Z"),
      createdAt,
      payload: { providerId: "gemini" },
    },
  ];
  const audits = [
    {
      id: "audit_1",
      action: "governance.approval_approve",
      target: "approval_1",
      riskLevel: "HIGH" as const,
      metadata: { approvalId: "approval_1", token: "hidden" },
      createdAt: new Date("2026-05-13T10:11:00.000Z"),
      actor: { email: "admin@example.com", role: "ADMIN" },
    },
  ];

  const models = buildApprovalReadModels({ approvals, audits, workflows: [], errors: [] });

  assert.equal(models[0].status, "Configured");
  assert.equal(models[0].verificationStatus, "Configured");
  assert.equal(models[0].rollbackAvailable, true);
  assert.equal(models[0].lifecycle.some((step) => step.label === "Approved"), true);
});

test("trace integrity detects orphan workflows, approval mismatches, and queue failures", () => {
  const workflows = [
    {
      id: "workflow_1",
      providerId: "mock",
      workflowId: "ai_gateway.provider_execution",
      status: "FAILED" as const,
      input: {},
      output: {},
      logs: "failed without event",
      createdAt: new Date("2026-05-13T10:00:00.000Z"),
      updatedAt: new Date("2026-05-13T10:01:00.000Z"),
    },
  ];
  const approvals = buildApprovalReadModels({
    approvals: [
      {
        id: "approval_2",
        type: "governance.media_render",
        title: "Approve render",
        status: "APPROVED" as const,
        riskLevel: "HIGH" as const,
        reason: "Needs render approval.",
        requestedBy: "user_1",
        decidedAt: null,
        createdAt: new Date("2026-05-13T10:02:00.000Z"),
        payload: {},
      },
    ],
    audits: [],
    workflows,
    errors: [],
  });

  const integrity = buildTraceIntegrityReport({
    traces: [],
    approvals,
    workflows,
    events: [],
    audits: [],
    errors: [],
    queues: [
      {
        name: "folqen.ai.runtime",
        mode: "mock",
        waiting: 0,
        active: 0,
        delayed: 0,
        failed: 2,
        completed: 0,
        status: "mock_safe",
      },
    ],
  });

  assert.equal(integrity.status, "Blocked");
  assert.equal(integrity.checks.orphanWorkflows, 1);
  assert.equal(integrity.checks.queueMismatches, 1);
  assert.equal(integrity.issues.some((issue) => issue.type === "missing_audit"), true);
});
