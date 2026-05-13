import assert from "node:assert/strict";
import test from "node:test";
import { isPreviewDemoAuthEnabled, validatePreviewDemoCredentials } from "@/lib/auth/preview-demo";

const safePreviewEnv = {
  PREVIEW_DEMO_AUTH: "true",
  PREVIEW_SAFE_MODE: "true",
  PREVIEW_FORCE_DRY_RUN: "true",
  FOLQEN_RUNTIME_PROFILE: "preview",
  ALLOW_PUBLIC_PUBLISH: "false",
  ALLOW_PAID_TOOLS: "false",
  ALLOW_BROWSER_AUTOMATION: "false",
  ORCHESTRATION_EXECUTION_MODE: "mock",
  ORCHESTRATION_WORKER_ENABLED: "false",
  ALLOW_LIVE_AI_EXECUTION: "false",
  ALLOW_CONTROLLED_MEDIA_EXECUTION: "false",
  ALLOW_LIVE_THUMBNAIL_RENDERING: "false",
} as unknown as NodeJS.ProcessEnv;

test("preview demo auth enables only in forced dry-run preview mode", () => {
  assert.equal(isPreviewDemoAuthEnabled(safePreviewEnv), true);
  assert.equal(isPreviewDemoAuthEnabled({ ...safePreviewEnv, PREVIEW_FORCE_DRY_RUN: "false" }), false);
  assert.equal(isPreviewDemoAuthEnabled({ ...safePreviewEnv, FOLQEN_RUNTIME_PROFILE: "local", VERCEL_ENV: undefined }), false);
});

test("preview demo auth blocks dangerous execution flags", () => {
  assert.equal(isPreviewDemoAuthEnabled({ ...safePreviewEnv, ALLOW_PUBLIC_PUBLISH: "true" }), false);
  assert.equal(isPreviewDemoAuthEnabled({ ...safePreviewEnv, ORCHESTRATION_EXECUTION_MODE: "live" }), false);
  assert.equal(isPreviewDemoAuthEnabled({ ...safePreviewEnv, ALLOW_LIVE_AI_EXECUTION: "true" }), false);
  assert.equal(isPreviewDemoAuthEnabled({ ...safePreviewEnv, ALLOW_LIVE_THUMBNAIL_RENDERING: "true" }), false);
});

test("preview demo credentials are explicit and scoped to the safe preview gate", () => {
  assert.equal(validatePreviewDemoCredentials("admin@example.com", "ChangeMe123!", safePreviewEnv), true);
  assert.equal(validatePreviewDemoCredentials("admin@example.com", "wrong-password", safePreviewEnv), false);
  assert.equal(validatePreviewDemoCredentials("admin@example.com", "ChangeMe123!", { ...safePreviewEnv, PREVIEW_DEMO_AUTH: "false" }), false);
});
