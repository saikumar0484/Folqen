import assert from "node:assert/strict";
import test from "node:test";

import { buildDeploymentGovernanceDashboard } from "./service";

const safeBaseEnv: NodeJS.ProcessEnv = {
  NODE_ENV: "development",
  ALLOW_PUBLIC_PUBLISH: "false",
  REQUIRE_HUMAN_APPROVAL: "true",
  ALLOW_PAID_TOOLS: "false",
  ALLOW_BROWSER_AUTOMATION: "false",
  DEFAULT_UPLOAD_PRIVACY: "private",
  FOLQEN_RUNTIME_PROFILE: "local",
  REQUIRE_STARTUP_VALIDATION: "true",
  STARTUP_DRY_RUN_MODE: "true",
  STARTUP_ROLLBACK_MODE: "false",
  STARTUP_QUARANTINE_MODE: "false",
  STARTUP_KILL_SWITCH: "false",
  ORCHESTRATION_EXECUTION_MODE: "mock",
  ORCHESTRATION_WORKER_ENABLED: "false",
  ALLOW_LIVE_AI_EXECUTION: "false",
  LIVE_AI_ACTIVATION_STAGE: "0",
  ALLOW_CONTROLLED_MEDIA_EXECUTION: "false",
  LIVE_MEDIA_ACTIVATION_STAGE: "0",
};

test("deployment governance defaults remain mock-safe and do not require local secrets", () => {
  const dashboard = buildDeploymentGovernanceDashboard(safeBaseEnv);

  assert.equal(dashboard.mode, "read_only");
  assert.equal(dashboard.runtimeProfile, "local");
  assert.equal(dashboard.productionSafe, true);
  assert.equal(dashboard.readinessStatus, "Mock");
  assert.equal(dashboard.environment.find((item) => item.id === "public_publish_guard")?.status, "Configured");
  assert.equal(dashboard.environment.find((item) => item.id === "paid_tool_guard")?.status, "Configured");
});

test("production profiles block missing required secrets and placeholder secrets", () => {
  const dashboard = buildDeploymentGovernanceDashboard({
    ...safeBaseEnv,
    FOLQEN_RUNTIME_PROFILE: "vps",
    AUTH_SECRET: "replace-with-a-secure-random-secret",
    DATABASE_URL: "postgresql://folqen:folqen_password@localhost:5432/folqen",
  });

  assert.equal(dashboard.readinessStatus, "Blocked");
  assert.equal(dashboard.secrets.find((item) => item.envKey === "AUTH_SECRET")?.status, "Blocked");
  assert.equal(dashboard.secrets.find((item) => item.envKey === "DATABASE_URL")?.status, "Blocked");
  assert.equal(dashboard.environment.find((item) => item.id === "production_local_database")?.status, "Blocked");
});

test("secret governance masks configured values and never exposes raw API keys", () => {
  const apiKey = "gemini_live_key_1234567890";
  const dashboard = buildDeploymentGovernanceDashboard({
    ...safeBaseEnv,
    GEMINI_API_KEY: apiKey,
    AUTH_SECRET: "x".repeat(40),
  });
  const gemini = dashboard.secrets.find((item) => item.envKey === "GEMINI_API_KEY");

  assert.equal(gemini?.status, "Needs approval");
  assert.notEqual(gemini?.maskedValue, apiKey);
  assert.equal(JSON.stringify(dashboard).includes(apiKey), false);
});

test("live queue startup requires Redis governance before deployment", () => {
  const dashboard = buildDeploymentGovernanceDashboard({
    ...safeBaseEnv,
    FOLQEN_RUNTIME_PROFILE: "docker",
    AUTH_SECRET: "x".repeat(40),
    CREDENTIAL_ENCRYPTION_KEY: "y".repeat(40),
    DATABASE_URL: "postgresql://folqen:strong_password@postgres:5432/folqen",
    ORCHESTRATION_EXECUTION_MODE: "live",
    ORCHESTRATION_WORKER_ENABLED: "true",
  });

  assert.equal(dashboard.environment.find((item) => item.id === "queue_startup")?.status, "Blocked");
  assert.equal(dashboard.secrets.find((item) => item.envKey === "REDIS_URL")?.status, "Blocked");
});

test("startup kill switch blocks production startup while rollback controls remain visible", () => {
  const dashboard = buildDeploymentGovernanceDashboard({
    ...safeBaseEnv,
    FOLQEN_RUNTIME_PROFILE: "coolify",
    STARTUP_KILL_SWITCH: "true",
    AUTH_SECRET: "x".repeat(40),
    CREDENTIAL_ENCRYPTION_KEY: "y".repeat(40),
    DATABASE_URL: "postgresql://folqen:strong_password@postgres:5432/folqen",
  });

  assert.equal(dashboard.startupMode, "kill_switch");
  assert.equal(dashboard.startupIntegrity.find((item) => item.id === "startup_kill_switch")?.status, "Blocked");
  assert.equal(dashboard.rollbackReadiness.some((item) => item.id === "rollback_to_dry_run"), true);
});
