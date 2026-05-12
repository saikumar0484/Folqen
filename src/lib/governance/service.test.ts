import assert from "node:assert/strict";
import test from "node:test";

import { FOLQEN_MUTATION_HEADER, FOLQEN_MUTATION_HEADER_VALUE } from "@/lib/security/mutation-headers";
import { resolveGovernanceMutationAccess } from "./api-handler";
import { evaluateGovernancePolicy } from "./policy-engine";
import { governanceActions, roleMatrix } from "./registry";
import { actOnGovernanceApproval, getGovernanceCapabilities, getGovernanceDashboard, requestGovernanceApproval, runSandboxExecution } from "./service";

const operator = { id: "user_operator", email: "operator@example.com", name: "Operator", role: "OPERATOR" as const };
const viewer = { id: "user_viewer", email: "viewer@example.com", name: "Viewer", role: "VIEWER" as const };

test("governance registry exposes critical action and role coverage", () => {
  assert.deepEqual(
    governanceActions.map((action) => action.actionType),
    [
      "public_publish",
      "provider_execution",
      "live_workflow",
      "account_access",
      "automation_trigger",
      "media_render",
      "paid_tool",
      "provider_activation",
      "queue_live_mode",
      "retry_execution",
      "sandbox_test",
    ],
  );
  assert.equal(roleMatrix.some((role) => role.role === "EXECUTIVE" && role.permissions.includes("approve_public_publishing")), true);
  assert.equal(roleMatrix.some((role) => role.role === "VIEWER" && role.restrictions.includes("Read-only governance visibility.")), true);
});

test("policy engine blocks public publishing even with partial approval state", () => {
  const result = evaluateGovernancePolicy({
    actionType: "public_publish",
    actorRole: "EXECUTIVE",
    approvalStatus: "approved",
    safetyStatus: "passed",
    copyrightStatus: "clear",
    reviewStatus: "passed",
    dryRun: false,
  });

  assert.equal(result.allowed, false);
  assert.equal(result.decision, "blocked");
  assert.equal(result.reasons.some((reason) => reason.includes("Public publishing is disabled")), true);
  assert.equal(result.requiredApprovals.includes("human_approval"), true);
});

test("policy engine blocks paid tools and provider execution by default", () => {
  const paid = evaluateGovernancePolicy({ actionType: "paid_tool", estimatedCostInr: 50, approvalStatus: "approved", dryRun: false });
  const provider = evaluateGovernancePolicy({ actionType: "provider_activation", providerId: "openrouter", actorRole: "EXECUTIVE", dryRun: false });

  assert.equal(paid.allowed, false);
  assert.equal(paid.budget.status, "Needs approval");
  assert.equal(provider.allowed, false);
  assert.equal(provider.providerAccess.status, "Blocked");
});

test("sandbox execution remains dry-run and queues mock metadata", async () => {
  const result = await runSandboxExecution({
    actionType: "sandbox_test",
    objective: "Simulate OpenRouter prompt execution without calling provider.",
    providerId: "openrouter",
  });

  assert.equal(result.mode, "dry_run");
  assert.equal(result.simulation.liveExecution, false);
  assert.match(result.queueJobId, /^mock_job_/);
});

test("approval request creates governance queue metadata and approval record", async () => {
  const result = await requestGovernanceApproval({
    actionType: "provider_execution",
    title: "Approve OpenRouter sandbox promotion",
    reason: "Need human review before any future provider execution.",
    riskLevel: "HIGH",
    payload: { providerId: "openrouter" },
  });

  assert.equal(result.mode, "dry_run");
  assert.equal(result.approval.status, "PENDING");
  assert.match(result.queueJobId, /^mock_job_/);
  assert.equal(result.policy.allowed, false);
});

test("approval actions support approve reject escalate retry and revoke without live execution", async () => {
  const created = await requestGovernanceApproval({
    actionType: "media_render",
    title: "Approve render worker test",
    reason: "Need approval before future media worker execution.",
    riskLevel: "HIGH",
  });

  for (const action of ["escalate", "retry", "revoke"] as const) {
    const result = await actOnGovernanceApproval({ approvalId: created.approval.id, action, note: "Governance test action." });
    assert.equal(result.mode, "dry_run");
    assert.match(result.queueJobId, /^mock_job_/);
    assert.match(result.message, /No provider/);
  }
});

test("governance dashboard exposes approvals policies budget audit and sandbox state", async () => {
  const dashboard = await getGovernanceDashboard();

  assert.equal(dashboard.executionControls.some((control) => control.id === "public_publishing" && control.status === "Blocked"), true);
  assert.equal(dashboard.costGovernance.monthlyBudgetInr, 1000);
  assert.equal(dashboard.sandbox.liveExecution, "blocked");
  assert.equal(dashboard.providerGovernance.some((provider) => provider.blockedActions.includes("public_publish")), true);
});

test("governance capabilities remain safe by default", () => {
  const capabilities = getGovernanceCapabilities();

  assert.equal(capabilities.safety.publicPublishing, "blocked");
  assert.equal(capabilities.safety.paidTools, "blocked");
  assert.equal(capabilities.safety.providerActivation, "blocked");
  assert.equal(capabilities.safety.sandboxMode, "mock");
});

test("governance mutation access covers anonymous, viewer, missing marker, and operator", () => {
  assert.deepEqual(resolveGovernanceMutationAccess({ user: null }), { ok: false, status: 401, error: "Login required." });
  assert.deepEqual(resolveGovernanceMutationAccess({ user: viewer }), { ok: false, status: 403, error: "Only admins and operators can use governance controls." });
  assert.deepEqual(resolveGovernanceMutationAccess({ user: operator, safetyError: { status: 403, error: "Mutation must be sent from the Folqen app UI." } }), {
    ok: false,
    status: 403,
    error: "Mutation must be sent from the Folqen app UI.",
  });
  assert.equal(resolveGovernanceMutationAccess({ user: operator }).ok, true);

  const request = new Request("http://localhost:3000/api/governance/policy/evaluate", {
    headers: { [FOLQEN_MUTATION_HEADER]: FOLQEN_MUTATION_HEADER_VALUE },
  });
  assert.equal(request.headers.get(FOLQEN_MUTATION_HEADER), FOLQEN_MUTATION_HEADER_VALUE);
});
