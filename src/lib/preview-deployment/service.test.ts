import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getPreviewDeploymentDashboard } from "./service";

describe("preview deployment governance", () => {
  it("marks preview-safe dry-run configuration as configured", () => {
    const dashboard = getPreviewDeploymentDashboard({
      FOLQEN_RUNTIME_PROFILE: "preview",
      PREVIEW_SAFE_MODE: "true",
      PREVIEW_FORCE_DRY_RUN: "true",
      ALLOW_PUBLIC_PUBLISH: "false",
      ALLOW_PAID_TOOLS: "false",
      ALLOW_BROWSER_AUTOMATION: "false",
      ORCHESTRATION_EXECUTION_MODE: "mock",
      ORCHESTRATION_WORKER_ENABLED: "false",
      ALLOW_LIVE_AI_EXECUTION: "false",
      LIVE_AI_ACTIVATION_STAGE: "0",
      ALLOW_CONTROLLED_MEDIA_EXECUTION: "false",
      ALLOW_LIVE_THUMBNAIL_RENDERING: "false",
      LIVE_MEDIA_ACTIVATION_STAGE: "0",
      LIVE_THUMBNAIL_RENDER_STAGE: "0",
      BROWSER_OPERATIONS_SANDBOX_MODE: "true",
      BROWSER_OPERATIONS_KILL_SWITCH: "false",
      AUTH_SECRET: "preview-secret-that-is-long-enough",
      DATABASE_URL: "postgresql://preview:preview@localhost:5432/preview",
    } as unknown as NodeJS.ProcessEnv);

    assert.equal(dashboard.status, "Configured");
    assert.equal(dashboard.mode, "preview_safe");
    assert.equal(dashboard.summary.blocked, 0);
    assert.ok(dashboard.visibleRoutes.includes("/browser-operations"));
  });

  it("blocks unsafe preview runtime activation flags", () => {
    const dashboard = getPreviewDeploymentDashboard({
      FOLQEN_RUNTIME_PROFILE: "preview",
      PREVIEW_SAFE_MODE: "true",
      PREVIEW_FORCE_DRY_RUN: "false",
      ALLOW_PUBLIC_PUBLISH: "true",
      ALLOW_PAID_TOOLS: "true",
      ALLOW_BROWSER_AUTOMATION: "true",
      ORCHESTRATION_EXECUTION_MODE: "live",
      ORCHESTRATION_WORKER_ENABLED: "true",
      ALLOW_LIVE_AI_EXECUTION: "true",
      LIVE_AI_ACTIVATION_STAGE: "1",
      ALLOW_CONTROLLED_MEDIA_EXECUTION: "true",
      ALLOW_LIVE_THUMBNAIL_RENDERING: "true",
      LIVE_MEDIA_ACTIVATION_STAGE: "1",
      LIVE_THUMBNAIL_RENDER_STAGE: "1",
      BROWSER_OPERATIONS_SANDBOX_MODE: "false",
      BROWSER_OPERATIONS_KILL_SWITCH: "false",
    } as unknown as NodeJS.ProcessEnv);

    assert.equal(dashboard.status, "Blocked");
    assert.ok(dashboard.summary.blocked >= 6);
  });

  it("allows preview demo auth instead of a preview database", () => {
    const dashboard = getPreviewDeploymentDashboard({
      FOLQEN_RUNTIME_PROFILE: "preview",
      PREVIEW_SAFE_MODE: "true",
      PREVIEW_DEMO_AUTH: "true",
      PREVIEW_FORCE_DRY_RUN: "true",
      ALLOW_PUBLIC_PUBLISH: "false",
      ALLOW_PAID_TOOLS: "false",
      ALLOW_BROWSER_AUTOMATION: "false",
      ORCHESTRATION_EXECUTION_MODE: "mock",
      ORCHESTRATION_WORKER_ENABLED: "false",
      ALLOW_LIVE_AI_EXECUTION: "false",
      LIVE_AI_ACTIVATION_STAGE: "0",
      ALLOW_CONTROLLED_MEDIA_EXECUTION: "false",
      ALLOW_LIVE_THUMBNAIL_RENDERING: "false",
      LIVE_MEDIA_ACTIVATION_STAGE: "0",
      LIVE_THUMBNAIL_RENDER_STAGE: "0",
      BROWSER_OPERATIONS_SANDBOX_MODE: "true",
      BROWSER_OPERATIONS_KILL_SWITCH: "false",
      AUTH_SECRET: "preview-secret-that-is-long-enough",
    } as unknown as NodeJS.ProcessEnv);

    assert.equal(dashboard.status, "Configured");
    assert.equal(dashboard.summary.warnings, 0);
    assert.ok(dashboard.requiredEnv.includes("DATABASE_URL or PREVIEW_DEMO_AUTH=true"));
  });
});
