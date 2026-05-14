import assert from "node:assert/strict";
import test from "node:test";
import { canExecuteUpgrade, canPublishPublicly, canUsePaidTool } from "./guards";

test("public publishing is blocked by default", () => {
  const decision = canPublishPublicly();

  assert.equal(decision.allowed, false);
  assert.match(decision.reasons.join(" "), /Public publishing is disabled/);
});

test("public publishing is allowed only when every gate passes", () => {
  const decision = canPublishPublicly({
    settings: { allowPublicPublish: true, requireHumanApproval: true },
    approvalStatus: "approved",
    contentSafetyStatus: "passed",
    copyrightStatus: "clear",
    reviewStatus: "passed",
  });

  assert.equal(decision.allowed, true);
  assert.deepEqual(decision.reasons, []);
});

test("paid tools are blocked by default", () => {
  const decision = canUsePaidTool();

  assert.equal(decision.allowed, false);
  assert.match(decision.reasons.join(" "), /Paid tools are disabled/);
});

test("paid tools require both setting and approval", () => {
  const decision = canUsePaidTool({
    settings: { allowPaidTools: true },
    approvalStatus: "approved",
  });

  assert.equal(decision.allowed, true);
});

test("upgrades are blocked by default", () => {
  const decision = canExecuteUpgrade();

  assert.equal(decision.allowed, false);
  assert.match(decision.reasons.join(" "), /Automatic upgrade execution is disabled/);
});

test("upgrades require approval, test plan, and rollback plan", () => {
  const decision = canExecuteUpgrade({
    settings: { autoExecuteUpgrades: true, requireUpgradeApproval: true },
    approvalStatus: "approved",
    hasTestingPlan: true,
    hasRollbackPlan: true,
  });

  assert.equal(decision.allowed, true);
});
