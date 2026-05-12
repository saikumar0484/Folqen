import assert from "node:assert/strict";
import test from "node:test";
import { commandCenterPageIds, getCommandCenterView } from "@/lib/command-center/mock-service";

test("command center exposes all operational pages with mock-safe data", () => {
  assert.deepEqual(commandCenterPageIds, [
    "dashboard",
    "agents",
    "departments",
    "workflows",
    "research-intelligence",
    "content-studio",
    "analytics",
    "organizational-memory",
    "automations",
    "incident-center",
    "infrastructure",
    "settings",
  ]);

  for (const pageId of commandCenterPageIds) {
    const view = getCommandCenterView(pageId);
    assert.equal(view.id, pageId);
    assert.ok(view.metrics.length >= 4);
    assert.ok(view.agents.length >= 6);
    assert.ok(view.workflows.some((workflow) => workflow.status === "Not connected"));
    assert.ok(view.infrastructure.some((node) => node.status === "Not connected"));
  }
});

test("command center keeps risky execution visibly blocked", () => {
  const dashboard = getCommandCenterView("dashboard");
  const settings = getCommandCenterView("settings");

  assert.ok(dashboard.panels.some((panel) => panel.title === "Risk boundaries" && panel.status === "Configured"));
  assert.ok(settings.panels.some((panel) => panel.title === "Provider activation" && panel.status === "Needs approval"));
});
