import assert from "node:assert/strict";
import test from "node:test";
import { getProviderConfig } from "@/lib/provider-config";

test("provider config keeps real integrations not connected without secrets", () => {
  const config = getProviderConfig("gpt-5-mini");

  assert.equal(config.storage.googleDrive.status, "not_connected");
  assert.equal(config.ai.openai.selectedModel, "gpt-5-mini");
  assert.equal(config.ai.openai.paidToolGuard, "blocked");
  assert.equal(config.workflow.n8n.webhookConfigured, false);
});

test("provider config reports configured env values without exposing secrets", () => {
  const config = getProviderConfig("gpt-5.2");

  assert.equal(config.ai.openai.selectedModel, "gpt-5.2");
  assert.equal(typeof config.ai.openai.note, "string");
  assert.equal("apiKey" in config.ai.openai, false);
});
