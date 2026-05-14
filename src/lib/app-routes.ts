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
  { id: "dashboard", href: "/dashboard", label: "Dashboard", title: "Creator Mission", kicker: "Start here", description: "Set your goal, run your first workflow, and review draft outputs.", status: "Configured" },
  { id: "agents", href: "/agents", label: "Workforce", title: "AI Workforce", kicker: "Roles", description: "See your creator assistant roles and what each one helps you produce.", status: "Configured" },
  { id: "departments", href: "/departments", label: "Templates", title: "Workflow Templates", kicker: "Guided setups", description: "Browse guided workflow setups for different creator needs.", status: "Configured" },
  { id: "research-intelligence", href: "/research-intelligence", label: "Research", title: "Research", kicker: "Find ideas", description: "Generate trend and audience insight for your next content run.", status: "Configured" },
  { id: "content-studio", href: "/content-studio", label: "Script & Thumbnail", title: "Script & Thumbnail", kicker: "Create drafts", description: "Create hooks, scripts, thumbnails, captions, and metadata drafts.", status: "Configured" },
  { id: "organizational-memory", href: "/organizational-memory", label: "History", title: "History", kicker: "Learn over time", description: "Review saved learnings, reflections, and previous outcomes.", status: "Configured" },
  { id: "automations", href: "/automations", label: "Automations", title: "Automations", kicker: "Creator shortcuts", description: "Set creator automations and reminders as new beta features arrive.", status: "Not connected" },
  { id: "browser-operations", href: "/browser-operations", label: "Web Assistant", title: "Web Assistant", kicker: "Early beta feature", description: "Preview guided web actions for research and creator workflows.", status: "Needs approval" },
  { id: "incident-center", href: "/incident-center", label: "Recovery", title: "Recovery", kicker: "Keep momentum", description: "Review issues and continue creator workflows with clear next steps.", status: "Configured" },
  { id: "infrastructure", href: "/infrastructure", label: "Workspace Health", title: "Workspace Health", kicker: "Readiness", description: "Check workspace readiness and setup quality for reliable usage.", status: "Configured" },
  { id: "agent", href: "/agent", label: "Chat", title: "Creator Chat", kicker: "Conversation-first", description: "Talk to Folqen to plan, draft, revise, and prepare your content package.", status: "Configured" },
  { id: "calendar", href: "/calendar", label: "Calendar", title: "Creator Calendar", kicker: "Plan cadence", description: "Plan your content cadence and review schedule suggestions.", status: "Needs approval" },
  { id: "pipeline", href: "/pipeline", label: "Pipeline", title: "Pipeline", kicker: "Progress", description: "Track progress from idea to publish-ready draft package.", status: "Configured" },
  { id: "library", href: "/library", label: "Library", title: "Library", kicker: "Drafts and assets", description: "Review your scripts, thumbnails, files, and packaging outputs.", status: "Configured" },
  { id: "approvals", href: "/approvals", label: "Approvals", title: "Approvals", kicker: "You stay in control", description: "Review and approve sensitive actions with full clarity.", status: "Needs approval" },
  { id: "platforms", href: "/platforms", label: "Publishing", title: "Publishing", kicker: "Connections", description: "Connect platforms and prepare manual publishing packages.", status: "Not connected" },
  { id: "tools", href: "/tools", label: "Integrations", title: "Integrations", kicker: "Connect tools", description: "Manage connected tools and provider setup for creator workflows.", status: "Not connected" },
  { id: "settings", href: "/settings", label: "Settings", title: "Settings", kicker: "Account and workspace", description: "Manage your workspace, access, and product preferences.", status: "Configured" },
  { id: "analytics", href: "/analytics", label: "Analytics", title: "Analytics", kicker: "What worked", description: "Review content performance and guided optimization suggestions.", status: "Configured" },
  { id: "monetization", href: "/monetization", label: "Monetization", title: "Monetization", kicker: "Revenue prep", description: "Prepare monetization readiness as this beta expands.", status: "Needs approval" },
  { id: "brand", href: "/brand", label: "Brand", title: "Brand", kicker: "Voice", description: "Shape your tone, format, and storytelling boundaries.", status: "Configured" },
  { id: "errors", href: "/errors", label: "Issues", title: "Issues", kicker: "Fix quickly", description: "See issues clearly and continue with suggested next actions.", status: "Configured" },
  { id: "audit", href: "/audit", label: "Activity", title: "Activity", kicker: "Account history", description: "Review account actions and workflow history from real records.", status: "Configured" },
  { id: "workflows", href: "/workflows", label: "Workflows", title: "Workflows", kicker: "Build and run", description: "Create guided workflow runs and review draft outcomes.", status: "Configured" },
  { id: "files", href: "/files", label: "Files", title: "Files", kicker: "References", description: "Manage uploaded references and generated files.", status: "Configured" },
  { id: "notifications", href: "/notifications", label: "Updates", title: "Updates", kicker: "Stay informed", description: "Get clear updates tied to your real account activity.", status: "Configured" },
  { id: "upgrades", href: "/upgrades", label: "Roadmap", title: "Roadmap", kicker: "What is next", description: "Track upcoming creator features and beta expansion plans.", status: "Needs approval" },
];

export const routeById = Object.fromEntries(appRoutes.map((route) => [route.id, route])) as Record<AppRouteId, RouteConfig>;
