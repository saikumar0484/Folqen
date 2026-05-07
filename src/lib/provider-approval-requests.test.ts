import assert from "node:assert/strict";
import test from "node:test";
import { buildProviderApprovalRequest, providerApprovalRequestTypes } from "@/lib/provider-approval-requests";

test("provider approval requests never include secrets", () => {
  for (const requestType of providerApprovalRequestTypes) {
    const request = buildProviderApprovalRequest(requestType);
    const payload = request.payload;

    assert.equal(payload.secretsIncluded, false);
    assert.equal(payload.safetyDefaults.publicPublishing, "blocked");
    assert.equal(payload.safetyDefaults.browserAutomation, "blocked");
    assert.ok(payload.requiredSecrets.length > 0);
  }
});

test("paid OpenAI request remains high risk and approval gated", () => {
  const request = buildProviderApprovalRequest("openai_paid_agent");

  assert.equal(request.riskLevel, "HIGH");
  assert.match(request.reason, /paid-tool/i);
  assert.ok(request.payload.blockedActions.includes("ungated_paid_generation"));
});
