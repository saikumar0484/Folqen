import assert from "node:assert/strict";
import test from "node:test";

import { createFallbackOperationsTraceDashboard, safeMetadataKeys, traceSeverityFromRisk, traceStatusFromApproval, traceStatusFromTask } from "./service";

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
