export type AppRouteId =
  | "dashboard"
  | "agents"
  | "departments"
  | "research-intelligence"
  | "content-studio"
  | "organizational-memory"
  | "automations"
  | "browser-operations"
  | "incident-center"
  | "infrastructure"
  | "agent"
  | "calendar"
  | "pipeline"
  | "library"
  | "approvals"
  | "platforms"
  | "tools"
  | "settings"
  | "analytics"
  | "monetization"
  | "brand"
  | "errors"
  | "audit"
  | "workflows"
  | "files"
  | "notifications"
  | "upgrades";

export type RouteStatus = "Configured" | "Not connected" | "Needs approval" | "Blocked";

export type RouteConfig = {
  id: AppRouteId;
  href: string;
  label: string;
  title: string;
  kicker: string;
  description: string;
  status: RouteStatus;
};

export const appRoutes: RouteConfig[] = [
  { id: "dashboard", href: "/dashboard", label: "Dashboard", title: "Creator Mission Control", kicker: "Primary workspace", description: "Set mission, run your first workflow, and review draft-safe outcomes.", status: "Configured" },
  { id: "agents", href: "/agents", label: "Agents", title: "Agent Hierarchy", kicker: "Workforce overview", description: "See how Folqen roles are organized and guided for creator workflows.", status: "Configured" },
  { id: "departments", href: "/departments", label: "Departments", title: "Departments", kicker: "Operational groups", description: "Research, content, analytics, safety, and infrastructure roles in one view.", status: "Configured" },
  { id: "research-intelligence", href: "/research-intelligence", label: "Research Intel", title: "Research Intelligence", kicker: "Strategic signals", description: "Generate trend, competitor, and audience insight with governed controls.", status: "Configured" },
  { id: "content-studio", href: "/content-studio", label: "Content Studio", title: "Content Studio", kicker: "Draft creation", description: "Create hooks, scripts, thumbnails, captions, and metadata in guided flows.", status: "Configured" },
  { id: "organizational-memory", href: "/organizational-memory", label: "Memory", title: "Organizational Memory", kicker: "Learning layer", description: "Capture approved learnings, prompt versions, and reflection notes.", status: "Configured" },
  { id: "automations", href: "/automations", label: "Automations", title: "Automations", kicker: "Workflow execution", description: "Automation setup and readiness with safe execution restrictions.", status: "Not connected" },
  { id: "browser-operations", href: "/browser-operations", label: "Browser Ops", title: "Browser Operations", kicker: "Sandbox browser layer", description: "Governed browser operations in dry-run and approval-safe mode.", status: "Needs approval" },
  { id: "incident-center", href: "/incident-center", label: "Incidents", title: "Incident Center", kicker: "Recovery and escalation", description: "Track failures, escalation needs, and safe recovery guidance.", status: "Configured" },
  { id: "infrastructure", href: "/infrastructure", label: "Infrastructure", title: "Infrastructure", kicker: "Environment readiness", description: "Deployment, startup integrity, and preview safety diagnostics.", status: "Configured" },
  { id: "agent", href: "/agent", label: "Agent", title: "Agent Chat", kicker: "Conversation workspace", description: "Chat with Folqen for guided drafting and operational clarity.", status: "Configured" },
  { id: "calendar", href: "/calendar", label: "Calendar", title: "Content Calendar", kicker: "Planning cadence", description: "Plan publishing windows and approvals with draft-safe scheduling.", status: "Needs approval" },
  { id: "pipeline", href: "/pipeline", label: "Pipeline", title: "Content Pipeline", kicker: "Workflow progress", description: "Track task and run progression from ideation to draft package.", status: "Configured" },
  { id: "library", href: "/library", label: "Library", title: "Content Library", kicker: "Assets and drafts", description: "Review generated drafts, assets, files, and manual posting packages.", status: "Configured" },
  { id: "approvals", href: "/approvals", label: "Approvals", title: "Approval Center", kicker: "Human-in-the-loop", description: "Approve, reject, revoke, and escalate risky operational actions.", status: "Needs approval" },
  { id: "platforms", href: "/platforms", label: "Platforms", title: "Platform Manager", kicker: "Connection management", description: "Connect and govern platform accounts with safe defaults.", status: "Not connected" },
  { id: "tools", href: "/tools", label: "Tools", title: "Tool Registry", kicker: "Provider readiness", description: "Track local tools, provider setup, and governed execution capability.", status: "Not connected" },
  { id: "settings", href: "/settings", label: "Settings", title: "Settings", kicker: "System controls", description: "Manage workspace settings, provider setup, and beta access safely.", status: "Configured" },
  { id: "analytics", href: "/analytics", label: "Analytics", title: "Analytics Intelligence", kicker: "Feedback cognition", description: "Interpret performance and generate governed optimization recommendations.", status: "Configured" },
  { id: "monetization", href: "/monetization", label: "Monetization", title: "Monetization", kicker: "Revenue readiness", description: "View monetization readiness without direct account control.", status: "Needs approval" },
  { id: "brand", href: "/brand", label: "Brand", title: "Brand System", kicker: "Voice and boundaries", description: "Define tone, niche constraints, and content safety direction.", status: "Configured" },
  { id: "errors", href: "/errors", label: "Errors", title: "Error Center", kicker: "Recovery discipline", description: "Track errors and apply safe recovery practices.", status: "Configured" },
  { id: "audit", href: "/audit", label: "Audit", title: "Audit Trail", kicker: "Trace verification", description: "Inspect operational traces, approvals, and governance correlations.", status: "Configured" },
  { id: "workflows", href: "/workflows", label: "Workflows", title: "Workflow Hub", kicker: "Run orchestration", description: "Create and inspect governed workflow runs and traces.", status: "Configured" },
  { id: "files", href: "/files", label: "Files", title: "File Manager", kicker: "Private storage", description: "Manage uploaded and generated files with strict safety boundaries.", status: "Configured" },
  { id: "notifications", href: "/notifications", label: "Notifications", title: "Notifications", kicker: "Signals and alerts", description: "Receive meaningful alerts tied to real account events only.", status: "Configured" },
  { id: "upgrades", href: "/upgrades", label: "Upgrades", title: "Upgrade Center", kicker: "Research-only improvements", description: "Review improvement proposals with approval and rollback requirements.", status: "Needs approval" },
];

export const routeById = Object.fromEntries(appRoutes.map((route) => [route.id, route])) as Record<AppRouteId, RouteConfig>;
