import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";

import { controlBrowserOperations, getBrowserGovernanceSnapshot, getBrowserOpsDashboard, resetBrowserOpsRuntimeForTests, runBrowserWorkflow } from "./service";

describe("browser operations department", () => {
  beforeEach(() => {
    resetBrowserOpsRuntimeForTests();
  });

  it("keeps Playwright browser execution dry-run only by default", async () => {
    const dashboard = await getBrowserOpsDashboard();

    assert.equal(dashboard.provider.id, "playwright_controller");
    assert.equal(dashboard.provider.liveExecutionEnabled, false);
    assert.equal(dashboard.mode, "dry_run");
    assert.equal(dashboard.governance.dryRunOnly, true);
    assert.equal(dashboard.governance.sandboxMode, true);
    assert.ok(dashboard.governance.policies.length >= 9);
  });

  it("simulates allowed-domain browser workflows without launching a browser", async () => {
    const result = await runBrowserWorkflow({
      workflowKind: "dom_inspection",
      objective: "Inspect Folqen dashboard layout in preview mode.",
      startUrl: "https://folqen.vercel.app/dashboard",
      approvalId: "approval_preview_browser",
      approvalRequired: true,
      actions: [
        { action: "open_page", target: "https://folqen.vercel.app/dashboard" },
        { action: "inspect_dom", target: "main" },
        { action: "capture_screenshot", target: "viewport" },
      ],
    });

    assert.equal(result.status, "simulated");
    assert.equal(result.provider.liveExecutionEnabled, false);
    assert.match(result.queueJobId, /^mock_job_/);
    assert.match(result.traceId, /^mock_job_/);
    assert.equal(result.screenshotAudit.captured, false);
    assert.equal(result.actions.every((step) => step.evidence.includes("No browser process was launched.")), true);
  });

  it("blocks navigation to domains outside the allow list", async () => {
    const result = await runBrowserWorkflow({
      workflowKind: "page_observation",
      objective: "Observe a third-party site safely.",
      startUrl: "https://unknown.example.com/page",
      approvalId: "approval_preview_browser",
      approvalRequired: true,
      actions: [{ action: "open_page", target: "https://unknown.example.com/page" }],
    });

    assert.equal(result.status, "blocked");
    assert.ok(result.blockedReasons.some((reason) => reason.includes("not on the allowed-domain list")));
    assert.equal(result.actions[0].status, "blocked");
  });

  it("requires approval for governed browser actions even in dry-run", async () => {
    const result = await runBrowserWorkflow({
      workflowKind: "screenshot_audit",
      objective: "Create a screenshot audit preview.",
      startUrl: "https://folqen.vercel.app/dashboard",
      approvalRequired: true,
      actions: [{ action: "capture_screenshot", target: "viewport" }],
    });

    assert.equal(result.status, "needs_approval");
    assert.ok(result.blockedReasons.includes("Approval ID is required before browser actions can move beyond planning."));
  });

  it("masks secret-like typed values and blocks file upload actions", async () => {
    const result = await runBrowserWorkflow({
      workflowKind: "safe_navigation_rehearsal",
      objective: "Validate secret masking and upload blocking.",
      startUrl: "https://folqen.vercel.app/settings",
      approvalId: "approval_preview_browser",
      approvalRequired: true,
      actions: [
        { action: "type", target: "input[name=apiKey]", value: "api_key=super-secret-value" },
        { action: "upload_file", target: "input[type=file]", value: "C:/Users/208X1/secret.png" },
      ],
    });

    assert.equal(result.status, "blocked");
    assert.equal(result.actions[0].status, "blocked");
    assert.equal(result.actions[0].maskedInput, "api_key=[masked]");
    assert.equal(result.actions[1].status, "blocked");
  });

  it("supports quarantine and rollback controls without enabling execution", async () => {
    const firstRun = await runBrowserWorkflow({
      workflowKind: "dom_inspection",
      objective: "Create a recoverable session.",
      startUrl: "https://folqen.vercel.app/audit",
      approvalId: "approval_preview_browser",
      approvalRequired: true,
      actions: [{ action: "inspect_dom", target: "main" }],
    });
    const quarantined = await controlBrowserOperations({
      action: "quarantine_session",
      reason: "Testing quarantine controls.",
      sessionId: firstRun.sessionId,
    });
    const dashboard = await getBrowserOpsDashboard();
    const rollback = await controlBrowserOperations({
      action: "rollback_to_dry_run",
      reason: "Return preview to dry-run.",
    });

    assert.equal(quarantined.ok, true);
    assert.equal(quarantined.status, "Blocked");
    assert.equal(dashboard.observability.quarantinedSessions > 0, true);
    assert.equal(rollback.status, "Mock");
  });

  it("reports preview safe-mode violations as blocked", () => {
    const governance = getBrowserGovernanceSnapshot({
      PREVIEW_SAFE_MODE: "true",
      PREVIEW_FORCE_DRY_RUN: "false",
      BROWSER_OPERATIONS_SANDBOX_MODE: "true",
      BROWSER_OPERATIONS_KILL_SWITCH: "false",
      BROWSER_OPERATIONS_ALLOWED_DOMAINS: "folqen.vercel.app",
      BROWSER_OPERATIONS_BLOCKED_DOMAINS: "accounts.google.com",
    } as unknown as NodeJS.ProcessEnv);

    assert.equal(governance.status, "Blocked");
    assert.ok(governance.blockedReasons.some((reason) => reason.includes("PREVIEW_FORCE_DRY_RUN=true")));
  });
});
