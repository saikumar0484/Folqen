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

export type RouteStatus = "Mock" | "Not connected" | "Needs approval" | "Configured";

export type RouteConfig = {
  id: AppRouteId;
  href: string;
  label: string;
  title: string;
  kicker: string;
  description: string;
  status: RouteStatus;
  stats: Array<{ label: string; value: string; hint: string; tone: "safe" | "warning" | "premium" | "neutral" }>;
  panels: Array<{ title: string; description: string; status: RouteStatus }>;
  actions: string[];
};

export const appRoutes: RouteConfig[] = [
  {
    id: "dashboard",
    href: "/dashboard",
    label: "Dashboard",
    title: "Command overview",
    kicker: "Live workspace shell",
    description: "Track agent activity, drafts, approvals, platform health, limits, analytics, and improvement ideas from one control surface.",
    status: "Mock",
    stats: [
      { label: "Active jobs", value: "3", hint: "Draft pipeline placeholders", tone: "premium" },
      { label: "Pending approvals", value: "4", hint: "Publishing remains blocked", tone: "warning" },
      { label: "Safety gates", value: "On", hint: "Human approval required", tone: "safe" },
    ],
    panels: [
      { title: "Agent activity", description: "Script draft, thumbnail prompt, and metadata package are staged as mock jobs.", status: "Mock" },
      { title: "Platform status", description: "YouTube, Instagram, Facebook, Snapchat, and Threads are intentionally not connected.", status: "Not connected" },
      { title: "Improvement opportunities", description: "Upgrade proposals can be researched, but execution requires approval.", status: "Needs approval" },
    ],
    actions: ["Create content package", "Review latest draft", "Show tool limits"],
  },
  {
    id: "agent",
    href: "/agent",
    label: "Agent",
    title: "Agent chat",
    kicker: "Full conversation surface",
    description: "Talk to the Folqen content agent using text now, with voice, image, and file inputs clearly marked as placeholders.",
    status: "Mock",
    stats: [
      { label: "Mode", value: "High", hint: "Automation with gates", tone: "premium" },
      { label: "Uploads", value: "Mock", hint: "Validation arrives later", tone: "neutral" },
      { label: "Risky actions", value: "Blocked", hint: "Approval required", tone: "safe" },
    ],
    panels: [
      { title: "Chat history", description: "Mock research and content planning exchanges for urban legends content.", status: "Mock" },
      { title: "Current task", description: "Prepare a folklore shorts package without publishing publicly.", status: "Mock" },
      { title: "Memory", description: "Future vector memory provider remains a replaceable interface.", status: "Not connected" },
    ],
    actions: ["Research a topic", "Draft a script", "Explain a blocker"],
  },
  {
    id: "calendar",
    href: "/calendar",
    label: "Calendar",
    title: "Content calendar",
    kicker: "Scheduling placeholder",
    description: "Plan topics, posting windows, approvals, and reschedules without connecting live platform calendars yet.",
    status: "Mock",
    stats: [
      { label: "This week", value: "9", hint: "Mock content slots", tone: "premium" },
      { label: "Blocked posts", value: "4", hint: "Need approvals", tone: "warning" },
      { label: "Auto schedule", value: "Off", hint: "Safe default", tone: "safe" },
    ],
    panels: [
      { title: "Calendar view", description: "Daily and weekly slots will be backed by database records in a later phase.", status: "Mock" },
      { title: "Approval windows", description: "Public posts cannot leave draft state until approved.", status: "Needs approval" },
      { title: "Platform scheduler", description: "No live platform scheduler is connected.", status: "Not connected" },
    ],
    actions: ["Add topic", "Filter approvals", "Export plan"],
  },
  {
    id: "pipeline",
    href: "/pipeline",
    label: "Pipeline",
    title: "Content pipeline",
    kicker: "Workflow visibility",
    description: "Follow each content job from topic research through review, render, posting package, and analytics handoff.",
    status: "Mock",
    stats: [
      { label: "Running", value: "3", hint: "Mock jobs", tone: "premium" },
      { label: "Failed", value: "1", hint: "Needs review", tone: "warning" },
      { label: "Publishing", value: "Locked", hint: "Guard active", tone: "safe" },
    ],
    panels: [
      { title: "Step progress", description: "Strategy, research, script, storyboard, render, and review stages are represented.", status: "Mock" },
      { title: "Retry controls", description: "Retries will call service interfaces after providers exist.", status: "Mock" },
      { title: "n8n workflow", description: "Self-hosted n8n is not connected in this foundation.", status: "Not connected" },
    ],
    actions: ["Pause automation", "Retry failed step", "View logs"],
  },
  {
    id: "library",
    href: "/library",
    label: "Library",
    title: "Content library",
    kicker: "Asset inventory",
    description: "Store scripts, storyboards, thumbnails, captions, metadata, rendered drafts, and posting packages.",
    status: "Mock",
    stats: [
      { label: "Draft assets", value: "18", hint: "Seed-style placeholders", tone: "premium" },
      { label: "Downloads", value: "Manual", hint: "Posting package flow", tone: "neutral" },
      { label: "Delete", value: "Confirm", hint: "Destructive actions gated", tone: "safe" },
    ],
    panels: [
      { title: "Asset cards", description: "Future records will include media type, tags, status, and platform readiness.", status: "Mock" },
      { title: "Preview panel", description: "Images, videos, documents, and captions will receive safe previews later.", status: "Mock" },
      { title: "Posting packages", description: "Manual packages are used when APIs are unavailable.", status: "Mock" },
    ],
    actions: ["Search assets", "Create package", "Archive selected"],
  },
  {
    id: "approvals",
    href: "/approvals",
    label: "Approvals",
    title: "Approval center",
    kicker: "Human decision gate",
    description: "Review public publishing, paid tools, account connections, sensitive topics, copyright uncertainty, and upgrades.",
    status: "Needs approval",
    stats: [
      { label: "Open items", value: "4", hint: "Mock approvals", tone: "warning" },
      { label: "Auto execute", value: "Never", hint: "Blocked by design", tone: "safe" },
      { label: "Audit trail", value: "Ready", hint: "Helper planned", tone: "premium" },
    ],
    panels: [
      { title: "Publishing requests", description: "Public publishing requires safe content, clear copyright, review pass, and approval.", status: "Needs approval" },
      { title: "Paid tool requests", description: "Paid usage stays blocked unless explicitly approved.", status: "Needs approval" },
      { title: "Upgrade requests", description: "System upgrades can be researched but not executed automatically.", status: "Needs approval" },
    ],
    actions: ["Review queue", "Reject risky item", "Open audit log"],
  },
  {
    id: "platforms",
    href: "/platforms",
    label: "Platforms",
    title: "Platform manager",
    kicker: "India-first distribution",
    description: "Manage YouTube, Instagram, Facebook, Snapchat, Threads, Substack, LinkedIn, Bluesky, Lemon8, and Kick statuses.",
    status: "Not connected",
    stats: [
      { label: "Primary", value: "5", hint: "All not connected", tone: "warning" },
      { label: "Secondary", value: "5", hint: "Manual package ready", tone: "neutral" },
      { label: "TikTok", value: "Skipped", hint: "India rule", tone: "safe" },
    ],
    panels: [
      { title: "API support", description: "No platform API is configured, so no upload claims are made.", status: "Not connected" },
      { title: "Manual fallback", description: "Posting packages will carry captions, hashtags, thumbnails, and instructions.", status: "Mock" },
      { title: "Approval rules", description: "Public posting remains blocked by default.", status: "Needs approval" },
    ],
    actions: ["View setup", "Create manual package", "Check policy"],
  },
  {
    id: "tools",
    href: "/tools",
    label: "Tools",
    title: "Tool registry",
    kicker: "Local-first stack",
    description: "Track ComfyUI, FFmpeg, local hardware, TTS, storage, disabled cloud tools, limits, costs, and fallback priority.",
    status: "Not connected",
    stats: [
      { label: "ComfyUI", value: "Off", hint: "Not connected", tone: "warning" },
      { label: "FFmpeg", value: "Off", hint: "Path not configured", tone: "warning" },
      { label: "Paid tools", value: "Off", hint: "Safe default", tone: "safe" },
    ],
    panels: [
      { title: "Tool status", description: "Providers expose status, cost model, capabilities, and safe fallback behavior.", status: "Mock" },
      { title: "Local render", description: "FFmpeg integration is a placeholder until configured.", status: "Not connected" },
      { title: "Cost control", description: "Free and local options are preferred before paid tools.", status: "Needs approval" },
    ],
    actions: ["Test connection", "Show limits", "Add provider"],
  },
  {
    id: "settings",
    href: "/settings",
    label: "Settings",
    title: "System settings",
    kicker: "Safe defaults",
    description: "Control brand, country, timezone, autonomy, publishing rules, local tools, security, notifications, and self-improvement.",
    status: "Configured",
    stats: [
      { label: "Country", value: "India", hint: "Platform rules applied", tone: "safe" },
      { label: "Autonomy", value: "High", hint: "Approval gates active", tone: "premium" },
      { label: "Secrets", value: "Masked", hint: "Never exposed", tone: "safe" },
    ],
    panels: [
      { title: "Publishing rules", description: "Public publishing, paid tools, and browser automation default to false.", status: "Configured" },
      { title: "Provider config", description: "Provider settings will validate through Zod and remain server-side.", status: "Mock" },
      { title: "Dangerous changes", description: "Security, production prompts, and destructive actions require confirmation.", status: "Needs approval" },
    ],
    actions: ["Review flags", "Mask secrets", "Open security"],
  },
  {
    id: "analytics",
    href: "/analytics",
    label: "Analytics",
    title: "Analytics",
    kicker: "Performance insight",
    description: "Inspect views, retention, CTR, engagement, platform mix, best hooks, best topics, and monetization progress.",
    status: "Mock",
    stats: [
      { label: "Views", value: "42K", hint: "Mock data", tone: "premium" },
      { label: "Retention", value: "61%", hint: "Sample metric", tone: "neutral" },
      { label: "Live reads", value: "Off", hint: "No analytics API", tone: "warning" },
    ],
    panels: [
      { title: "Topic trends", description: "Urban legends, haunted sites, and mystery explainers are represented as placeholders.", status: "Mock" },
      { title: "Platform analytics", description: "Live platform analytics are not connected.", status: "Not connected" },
      { title: "Agent recommendations", description: "Recommendations remain explainable and non-executing.", status: "Mock" },
    ],
    actions: ["Explain analytics", "Compare hooks", "Export report"],
  },
  {
    id: "monetization",
    href: "/monetization",
    label: "Monetization",
    title: "Monetization",
    kicker: "Approval protected",
    description: "Track monetization readiness without touching payment settings, credentials, ads, or paid accounts.",
    status: "Needs approval",
    stats: [
      { label: "Payment access", value: "Off", hint: "Human required", tone: "safe" },
      { label: "Revenue data", value: "Mock", hint: "No live account", tone: "warning" },
      { label: "Actions", value: "Review", hint: "No automation", tone: "neutral" },
    ],
    panels: [
      { title: "Readiness checklist", description: "Track creator eligibility and content milestones without changing accounts.", status: "Mock" },
      { title: "Payment settings", description: "Payment and monetization actions require explicit human approval.", status: "Needs approval" },
      { title: "Sponsor tracker", description: "Future CRM-style sponsorship notes can live here.", status: "Mock" },
    ],
    actions: ["View checklist", "Explain status", "Open approvals"],
  },
  {
    id: "brand",
    href: "/brand",
    label: "Brand",
    title: "Brand system",
    kicker: "Identity controls",
    description: "Manage voice, visual rules, folklore niche boundaries, content policy notes, and reusable brand assets.",
    status: "Mock",
    stats: [
      { label: "Brand changes", value: "Gated", hint: "Permanent changes need approval", tone: "safe" },
      { label: "Niche", value: "Mystery", hint: "Folklore and legends", tone: "premium" },
      { label: "Policy notes", value: "Active", hint: "Avoid risky claims", tone: "safe" },
    ],
    panels: [
      { title: "Voice guide", description: "Documentary mystery tone with careful sourcing and no fake factual claims.", status: "Mock" },
      { title: "Visual kit", description: "Neon cyber command-center look is the current UI direction.", status: "Configured" },
      { title: "Copyright policy", description: "Modern copyrighted horror stories require permission or avoidance.", status: "Needs approval" },
    ],
    actions: ["Edit tone", "Review assets", "Flag risk"],
  },
  {
    id: "errors",
    href: "/errors",
    label: "Errors",
    title: "Error center",
    kicker: "Recoverable failures",
    description: "Capture failed jobs, provider issues, validation problems, and safe recovery steps.",
    status: "Mock",
    stats: [
      { label: "Open errors", value: "1", hint: "Mock render failure", tone: "warning" },
      { label: "Recovery", value: "Logged", hint: "Checkpoint rule", tone: "safe" },
      { label: "Escalation", value: "Human", hint: "Unsafe fixes stop", tone: "safe" },
    ],
    panels: [
      { title: "Failure log", description: "Future errors will include source, severity, message, and rollback notes.", status: "Mock" },
      { title: "Recovery playbook", description: "The referenced playbook file is currently missing from the repo.", status: "Needs approval" },
      { title: "Provider failures", description: "Not connected providers cannot fail live jobs yet.", status: "Not connected" },
    ],
    actions: ["Inspect error", "Document risk", "Retry safe job"],
  },
  {
    id: "audit",
    href: "/audit",
    label: "Audit",
    title: "Audit trail",
    kicker: "Accountability",
    description: "Review governed traces, approval lifecycles, operational correlations, diagnostics, blocked actions, and handoff checkpoints.",
    status: "Configured",
    stats: [
      { label: "Traces", value: "Live", hint: "Database read model", tone: "premium" },
      { label: "Integrity", value: "Checked", hint: "Read-only diagnostics", tone: "safe" },
      { label: "Secrets", value: "Hidden", hint: "No frontend exposure", tone: "safe" },
    ],
    panels: [
      { title: "Approval timelines", description: "Track lifecycle, escalation, retry, revoke, rollback, and verification indicators.", status: "Configured" },
      { title: "Trace explorer", description: "Search and filter normalized audit, event, workflow, queue, incident, render, and asset traces.", status: "Configured" },
      { title: "Production diagnostics", description: "Inspect deployment, auth, queue, environment, provider, database, and governance readiness.", status: "Configured" },
    ],
    actions: ["Filter traces", "Review integrity", "Open risk log"],
  },
  {
    id: "workflows",
    href: "/workflows",
    label: "Workflows",
    title: "Workflow hub",
    kicker: "n8n placeholder",
    description: "Prepare workflow triggers, status views, webhook tests, and fallback task plans for self-hosted automation.",
    status: "Not connected",
    stats: [
      { label: "n8n", value: "Off", hint: "Webhook not configured", tone: "warning" },
      { label: "Runs", value: "Mock", hint: "No live engine", tone: "neutral" },
      { label: "Secrets", value: "Required", hint: "Later setup", tone: "warning" },
    ],
    panels: [
      { title: "Workflow provider", description: "n8n is default, but the service layer stays replaceable.", status: "Mock" },
      { title: "Webhook test", description: "Test endpoint arrives after settings and provider config.", status: "Not connected" },
      { title: "Fallback plan", description: "Manual content packages remain available when automation is unavailable.", status: "Mock" },
    ],
    actions: ["Test webhook", "View runs", "Create workflow"],
  },
  {
    id: "files",
    href: "/files",
    label: "Files",
    title: "File manager",
    kicker: "Safe uploads later",
    description: "Upload, preview, tag, search, validate, archive, and audit project files once validation is implemented.",
    status: "Mock",
    stats: [
      { label: "Storage", value: "Local", hint: "Future first choice", tone: "premium" },
      { label: "Uploads", value: "Off", hint: "Validation pending", tone: "warning" },
      { label: "Privacy", value: "Private", hint: "Safe default", tone: "safe" },
    ],
    panels: [
      { title: "Upload zone", description: "Drag and drop is represented, but route validation arrives later.", status: "Mock" },
      { title: "MIME validation", description: "Images, video, audio, docs, captions, data, and text files must be checked server-side.", status: "Needs approval" },
      { title: "Archive flow", description: "Delete and archive operations require confirmation and audit logs.", status: "Needs approval" },
    ],
    actions: ["Upload file", "Search files", "Archive item"],
  },
  {
    id: "notifications",
    href: "/notifications",
    label: "Notifications",
    title: "Notifications",
    kicker: "Signal center",
    description: "Surface approvals, blocked actions, failed renders, tool limits, upgrade proposals, and scheduling reminders.",
    status: "Mock",
    stats: [
      { label: "Unread", value: "5", hint: "Mock alerts", tone: "premium" },
      { label: "Critical", value: "2", hint: "Needs human review", tone: "warning" },
      { label: "Channels", value: "Local", hint: "No push provider", tone: "neutral" },
    ],
    panels: [
      { title: "Approval alerts", description: "Important actions will appear here before anything risky executes.", status: "Mock" },
      { title: "Provider alerts", description: "Connected provider health will be shown after integration setup.", status: "Not connected" },
      { title: "Research reports", description: "Weekly upgrade reports can be generated by the improvement agent.", status: "Mock" },
    ],
    actions: ["Mark read", "Open approvals", "Mute low risk"],
  },
  {
    id: "upgrades",
    href: "/upgrades",
    label: "Upgrades",
    title: "Upgrade center",
    kicker: "Self-improvement research",
    description: "Review research findings and upgrade proposals with risk, cost, benefit, test plan, rollback, and approval status.",
    status: "Needs approval",
    stats: [
      { label: "Proposals", value: "2", hint: "Mock drafts", tone: "premium" },
      { label: "Auto execute", value: "Off", hint: "Required", tone: "safe" },
      { label: "Paid research", value: "0 INR", hint: "Budget protected", tone: "safe" },
    ],
    panels: [
      { title: "Research findings", description: "The agent may research official docs and trusted sources automatically.", status: "Mock" },
      { title: "Upgrade proposals", description: "Real implementation requires approval, branch workflow, testing, and rollback plan.", status: "Needs approval" },
      { title: "Cost protection", description: "Free and local alternatives are shown before paid recommendations.", status: "Configured" },
    ],
    actions: ["Show proposals", "Research tools", "Defer upgrade"],
  },
  {
    id: "agents",
    href: "/agents",
    label: "Agents",
    title: "Agent hierarchy",
    kicker: "Organizational intelligence",
    description: "Visualize Folqen's executive, research, creative, operations, safety, and memory agents with current work and performance.",
    status: "Mock",
    stats: [
      { label: "Agents", value: "6", hint: "Mock operational hierarchy", tone: "premium" },
      { label: "Safety", value: "Gated", hint: "Risky execution blocked", tone: "safe" },
      { label: "Memory", value: "Mock", hint: "Vector provider pending", tone: "neutral" },
    ],
    panels: [
      { title: "Executive layer", description: "Strategy delegates to specialist departments.", status: "Mock" },
      { title: "Safety authority", description: "Compliance can block publishing and paid actions.", status: "Configured" },
      { title: "Performance view", description: "Agent cards show mock performance indicators.", status: "Mock" },
    ],
    actions: ["Assign task", "Review memory", "Open hierarchy"],
  },
  {
    id: "departments",
    href: "/departments",
    label: "Departments",
    title: "Departments",
    kicker: "AI company structure",
    description: "Inspect Folqen's AI departments, missions, owners, active work, and health signals.",
    status: "Mock",
    stats: [
      { label: "Departments", value: "6", hint: "Executive to infrastructure", tone: "premium" },
      { label: "Health", value: "83%", hint: "Mock average", tone: "neutral" },
      { label: "Execution", value: "Gated", hint: "No live automation", tone: "safe" },
    ],
    panels: [
      { title: "Research", description: "Trend and competitor intelligence.", status: "Mock" },
      { title: "Studio", description: "Scripts, hooks, captions, metadata.", status: "Mock" },
      { title: "Reliability", description: "Incidents, retries, recovery.", status: "Configured" },
    ],
    actions: ["Open department", "Balance load", "View agents"],
  },
  {
    id: "research-intelligence",
    href: "/research-intelligence",
    label: "Research Intel",
    title: "Research intelligence",
    kicker: "Trends and sources",
    description: "Track folklore trends, competitor signals, source confidence, policy risk, and topic opportunities.",
    status: "Mock",
    stats: [
      { label: "Signals", value: "3", hint: "Mock research feed", tone: "premium" },
      { label: "Sensitive", value: "1", hint: "Needs human review", tone: "warning" },
      { label: "Sources", value: "Draft", hint: "No browser automation", tone: "safe" },
    ],
    panels: [
      { title: "Trend signals", description: "Surface topic momentum.", status: "Mock" },
      { title: "Competitor watch", description: "Watch hooks and formats.", status: "Mock" },
      { title: "Policy risk", description: "Escalate sensitive topics.", status: "Needs approval" },
    ],
    actions: ["Draft brief", "Escalate topic", "Compare competitors"],
  },
  {
    id: "content-studio",
    href: "/content-studio",
    label: "Content Studio",
    title: "Content studio",
    kicker: "Creator production floor",
    description: "Coordinate scripts, hooks, captions, metadata, thumbnail prompts, and review-ready posting packages.",
    status: "Mock",
    stats: [
      { label: "Packages", value: "4", hint: "Mock drafts", tone: "premium" },
      { label: "Review", value: "Required", hint: "Public publishing blocked", tone: "safe" },
      { label: "Render", value: "Off", hint: "Worker missing", tone: "warning" },
    ],
    panels: [
      { title: "Script desk", description: "Drafts are generated as mock work.", status: "Mock" },
      { title: "Media prompts", description: "ComfyUI remains not connected.", status: "Not connected" },
      { title: "Posting package", description: "Manual fallback remains available.", status: "Configured" },
    ],
    actions: ["Generate draft", "Review package", "Create metadata"],
  },
  {
    id: "organizational-memory",
    href: "/organizational-memory",
    label: "Memory",
    title: "Organizational memory",
    kicker: "Institutional knowledge",
    description: "Track brand memory, decisions, prompt versions, incident learnings, and content performance notes.",
    status: "Mock",
    stats: [
      { label: "Memories", value: "12", hint: "Mock entries", tone: "premium" },
      { label: "Vector DB", value: "Off", hint: "Provider pending", tone: "warning" },
      { label: "Audit", value: "On", hint: "Decisions logged", tone: "safe" },
    ],
    panels: [
      { title: "Brand memory", description: "Store voice and niche preferences.", status: "Mock" },
      { title: "Prompt versions", description: "Version prompts before production changes.", status: "Mock" },
      { title: "Incident learning", description: "Recovery notes become operational memory.", status: "Mock" },
    ],
    actions: ["Search memory", "Add decision", "Review prompts"],
  },
  {
    id: "automations",
    href: "/automations",
    label: "Automations",
    title: "Automation layer",
    kicker: "Queues and workflows",
    description: "Monitor n8n, Redis/BullMQ readiness, retry policies, and workflow execution states without enabling live automation.",
    status: "Not connected",
    stats: [
      { label: "n8n", value: "Off", hint: "Secret required", tone: "warning" },
      { label: "Redis", value: "Off", hint: "Not configured", tone: "warning" },
      { label: "Fallback", value: "Manual", hint: "Posting packages", tone: "safe" },
    ],
    panels: [
      { title: "Workflow provider", description: "n8n is planned behind an adapter.", status: "Not connected" },
      { title: "Queue health", description: "BullMQ UI is mock-ready.", status: "Mock" },
      { title: "Retry policy", description: "Retries must respect approvals and cost guards.", status: "Configured" },
    ],
    actions: ["Test connection", "View queue", "Create fallback"],
  },
  {
    id: "browser-operations",
    href: "/browser-operations",
    label: "Browser Ops",
    title: "Browser operations",
    kicker: "Governed web interaction",
    description: "Plan isolated Playwright browser sessions, domain validation, screenshot audits, DOM inspection, extraction traces, quarantine controls, and dry-run browser workflows.",
    status: "Mock",
    stats: [
      { label: "Execution", value: "Dry-run", hint: "No browser process launched", tone: "safe" },
      { label: "Provider", value: "Playwright", hint: "Controller prepared only", tone: "premium" },
      { label: "Domains", value: "Guarded", hint: "Allow/block lists enforced", tone: "safe" },
    ],
    panels: [
      { title: "Session manager", description: "Browser sessions are planned and observable but never opened in preview mode.", status: "Mock" },
      { title: "Action validation", description: "Navigate, click, type, upload, screenshot, DOM inspect, and extraction actions are validated before simulation.", status: "Configured" },
      { title: "Quarantine controls", description: "Suspicious sessions can be isolated, recovered, or rolled back to dry-run mode.", status: "Configured" },
    ],
    actions: ["Run dry trace", "Inspect policy", "Quarantine session"],
  },
  {
    id: "incident-center",
    href: "/incident-center",
    label: "Incidents",
    title: "Incident center",
    kicker: "Failure recovery",
    description: "Review failed workflows, retry states, escalations, logs, and recovery suggestions.",
    status: "Mock",
    stats: [
      { label: "Incidents", value: "3", hint: "Mock failure queue", tone: "warning" },
      { label: "Escalations", value: "1", hint: "Human needed", tone: "warning" },
      { label: "Recovery", value: "Safe", hint: "No scope expansion", tone: "safe" },
    ],
    panels: [
      { title: "Failed workflows", description: "Failed jobs remain visible and recoverable.", status: "Mock" },
      { title: "Retry status", description: "Retries stay advisory until workers exist.", status: "Mock" },
      { title: "Human gate", description: "Unsafe recovery stops for approval.", status: "Needs approval" },
    ],
    actions: ["Open recovery", "Escalate", "View logs"],
  },
  {
    id: "infrastructure",
    href: "/infrastructure",
    label: "Infrastructure",
    title: "Infrastructure",
    kicker: "Operational health",
    description: "Track Redis, queue metrics, API provider health, orchestration health, worker health, and database status.",
    status: "Mock",
    stats: [
      { label: "Database", value: "Live", hint: "Supabase", tone: "safe" },
      { label: "Workers", value: "0", hint: "Not connected", tone: "warning" },
      { label: "Providers", value: "0 live", hint: "Setup-gated", tone: "warning" },
    ],
    panels: [
      { title: "Redis", description: "Not configured yet.", status: "Not connected" },
      { title: "Workers", description: "Media and analytics workers need endpoints.", status: "Not connected" },
      { title: "Orchestration", description: "LangGraph/CrewAI plans are frontend-ready.", status: "Mock" },
    ],
    actions: ["Inspect providers", "View workers", "Open setup"],
  },
];

export const routeById = Object.fromEntries(appRoutes.map((route) => [route.id, route])) as Record<AppRouteId, RouteConfig>;
