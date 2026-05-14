import type {
  AgentNode,
  AnalyticsMetric,
  CommandCenterPageId,
  CommandCenterView,
  DepartmentNode,
  InfrastructureNode,
  IntelligenceSignal,
  MetricCard,
  PagePanel,
  TimelineItem,
  WorkflowNode,
} from "@/lib/command-center/types";

const agents: AgentNode[] = [
  {
    id: "cco",
    name: "Chief Creator Officer",
    role: "Executive strategy",
    department: "Executive",
    status: "Mock",
    task: "Ranking folklore topics for the next shorts cycle",
    memory: "Prefers India-safe distribution and sourced mystery narratives",
    performance: 91,
    autonomy: "High automation with approval gates",
  },
  {
    id: "research",
    name: "Folklore Research Agent",
    role: "Source discovery",
    department: "Research Intelligence",
    status: "Mock",
    task: "Collecting source notes for cursed-object episode candidates",
    memory: "Avoid modern copyrighted horror and unsourced tragedy claims",
    performance: 86,
    autonomy: "Draft research only",
  },
  {
    id: "creative",
    name: "Script and Hook Agent",
    role: "Creative packaging",
    department: "Content Studio",
    status: "Mock",
    task: "Preparing three hook variants for a haunted fort short",
    memory: "Shorts perform better with a cold-open question and one reveal",
    performance: 88,
    autonomy: "Can draft, cannot publish",
  },
  {
    id: "ops",
    name: "Workflow Operations Agent",
    role: "Queue supervision",
    department: "Automations",
    status: "Not connected",
    task: "Waiting for Redis and n8n configuration",
    memory: "Use manual posting packages while platform APIs are unavailable",
    performance: 72,
    autonomy: "Blocked until providers are configured",
  },
  {
    id: "safety",
    name: "Safety and Compliance Agent",
    role: "Publishing guard",
    department: "Incident Center",
    status: "Configured",
    task: "Blocking public publishing and paid tools by default",
    memory: "Public publishing requires approval, safety pass, copyright clear, review pass",
    performance: 96,
    autonomy: "Can block actions",
  },
  {
    id: "memory",
    name: "Organizational Memory Agent",
    role: "Knowledge librarian",
    department: "Organizational Memory",
    status: "Mock",
    task: "Indexing decisions, prompt versions, and content learnings",
    memory: "Vector provider is not connected yet",
    performance: 80,
    autonomy: "Read/write mock memory only",
  },
  {
    id: "audience",
    name: "Audience Insight Agent",
    role: "Retention pattern analysis",
    department: "Growth Analytics",
    status: "Mock",
    task: "Comparing drop-off points across 20 recent shorts",
    memory: "Regional language intros raise watch-through in tier-2 cities",
    performance: 83,
    autonomy: "Recommendation-only",
  },
  {
    id: "thumbnail",
    name: "Thumbnail Strategy Agent",
    role: "Visual packaging",
    department: "Content Studio",
    status: "Mock",
    task: "Scoring thumbnail variants against folklore CTR benchmarks",
    memory: "Green-highlighted focal point outperforms text-heavy covers",
    performance: 87,
    autonomy: "Draft-only render plans",
  },
  {
    id: "browser-watch",
    name: "Browser Observation Agent",
    role: "Domain-safe web trace",
    department: "Browser Operations",
    status: "Configured",
    task: "Running dry-run DOM extraction plan for allowed domains",
    memory: "File uploads and credentialed automation remain blocked",
    performance: 90,
    autonomy: "Sandbox traces only",
  },
  {
    id: "incident-triage",
    name: "Incident Triage Agent",
    role: "Failure recovery",
    department: "Incident Center",
    status: "Mock",
    task: "Correlating queue lag with provider not-connected incidents",
    memory: "Escalate when retries exceed policy ceiling",
    performance: 89,
    autonomy: "Escalate and isolate",
  },
  {
    id: "policy",
    name: "Governance Policy Agent",
    role: "Execution policy checks",
    department: "Approvals",
    status: "Configured",
    task: "Verifying preview-safe policy profile before deployment",
    memory: "No live execution with preview public mode",
    performance: 95,
    autonomy: "Can block unsafe actions",
  },
  {
    id: "platform-intel",
    name: "Platform Intelligence Agent",
    role: "Distribution adaptation",
    department: "Platform Operations",
    status: "Mock",
    task: "Preparing per-platform metadata adaptation matrix",
    memory: "Publishing remains manual package only",
    performance: 82,
    autonomy: "No account execution",
  },
];

const departments: DepartmentNode[] = [
  { id: "executive", name: "Executive Control", lead: "Chief Creator Officer", mission: "Set content strategy, approve priorities, and coordinate departments.", status: "Mock", agents: 2, activeWork: "Weekly command brief", health: 91 },
  { id: "research", name: "Research Intelligence", lead: "Folklore Research Agent", mission: "Track trends, competitors, sources, and cultural risk.", status: "Mock", agents: 4, activeWork: "Legend source validation", health: 84 },
  { id: "studio", name: "Content Studio", lead: "Script and Hook Agent", mission: "Create scripts, hooks, captions, metadata, and visual prompts.", status: "Mock", agents: 5, activeWork: "Haunted-fort short package", health: 88 },
  { id: "growth", name: "Growth Analytics", lead: "Analytics Agent", mission: "Analyze CTR, retention, engagement, and platform performance.", status: "Mock", agents: 3, activeWork: "Retention diagnosis", health: 79 },
  { id: "reliability", name: "Reliability", lead: "Incident Triage Agent", mission: "Recover from failed workflows and protect operations from unsafe retries.", status: "Configured", agents: 3, activeWork: "Retry policy design", health: 93 },
  { id: "infra", name: "Infrastructure", lead: "Operations Agent", mission: "Track Redis, queues, workers, APIs, and orchestration providers.", status: "Not connected", agents: 2, activeWork: "Provider readiness map", health: 62 },
];

const workflows: WorkflowNode[] = [
  { id: "wf-research", name: "Trend to Topic Brief", owner: "Research Intelligence", status: "Mock", progress: 78, retries: 0, currentStep: "Source confidence scoring", log: "3 signals ranked; copyright scan pending" },
  { id: "wf-studio", name: "Script Package Generator", owner: "Content Studio", status: "Mock", progress: 64, retries: 1, currentStep: "Hook variant review", log: "Retry used for malformed metadata JSON" },
  { id: "wf-publish", name: "Manual Posting Package", owner: "Publishing", status: "Configured", progress: 92, retries: 0, currentStep: "Approval card creation", log: "API upload unavailable, package fallback selected" },
  { id: "wf-render", name: "Local Render Pipeline", owner: "Media Production", status: "Not connected", progress: 24, retries: 2, currentStep: "FFmpeg provider check", log: "Worker endpoint missing; public render blocked" },
  { id: "wf-memory", name: "Reflection and Memory Capture", owner: "Organizational Memory", status: "Mock", progress: 71, retries: 0, currentStep: "Experiment note indexing", log: "Captured quality signals from latest hook trials" },
  { id: "wf-browser", name: "Governed Browser Trace", owner: "Browser Operations", status: "Configured", progress: 88, retries: 0, currentStep: "Screenshot audit write", log: "Dry-run session completed with domain policy checks" },
  { id: "wf-analytics", name: "Feedback Loop Intelligence", owner: "Growth Analytics", status: "Mock", progress: 67, retries: 1, currentStep: "Retention cohort scoring", log: "Low-confidence recommendation held for review" },
];

const intelligence: IntelligenceSignal[] = [
  { id: "sig-1", source: "YouTube Shorts scan", title: "Haunted forts and abandoned hospitals are rising in mystery shorts", confidence: 82, impact: "High topic fit, medium sourcing risk", status: "Mock" },
  { id: "sig-2", source: "Competitor watch", title: "Cold-open questions are outperforming direct narration hooks", confidence: 76, impact: "Update hook templates after approval", status: "Mock" },
  { id: "sig-3", source: "Policy guard", title: "Recent tragedy-adjacent folklore should be treated as sensitive", confidence: 93, impact: "Escalate for human review before scripting", status: "Needs approval" },
];

const analytics: AnalyticsMetric[] = [
  { id: "ctr", label: "CTR", value: "8.9%", series: [42, 49, 46, 61, 58, 72, 84], recommendation: "Use curiosity gap thumbnails for folklore explainers.", tone: "safe" },
  { id: "retention", label: "Retention", value: "63%", series: [61, 58, 63, 66, 62, 68, 71], recommendation: "Move the first reveal before second 9 in shorts.", tone: "info" },
  { id: "engagement", label: "Engagement", value: "13.4%", series: [34, 38, 45, 51, 49, 57, 64], recommendation: "End with a question that invites local legend comments.", tone: "premium" },
  { id: "platform", label: "Platform Mix", value: "Manual", series: [20, 32, 27, 35, 39, 41, 43], recommendation: "Keep manual posting packages until APIs are configured.", tone: "warning" },
];

const infrastructure: InfrastructureNode[] = [
  { id: "redis", name: "Redis", status: "Not connected", metric: "0 queues live", detail: "BullMQ-ready UI only; no Redis endpoint configured.", tone: "warning" },
  { id: "queue", name: "Queue Health", status: "Mock", metric: "17 staged jobs", detail: "Mock queue telemetry for frontend readiness.", tone: "info" },
  { id: "providers", name: "API Providers", status: "Not connected", metric: "0 live", detail: "OpenRouter, Gemini, n8n, ComfyUI, FFmpeg remain setup-gated.", tone: "warning" },
  { id: "orchestration", name: "Orchestration", status: "Mock", metric: "LangGraph plan", detail: "Graph and crew execution are planned, not live.", tone: "premium" },
  { id: "workers", name: "Workers", status: "Not connected", metric: "0 online", detail: "Media and analytics workers require endpoint configuration.", tone: "danger" },
  { id: "database", name: "Database", status: "Live", metric: "Supabase", detail: "Database is the only live backend integration in the current checkpoint.", tone: "safe" },
];

const timeline: TimelineItem[] = [
  { id: "tl-1", time: "09:42", title: "Research brief drafted", detail: "Three folklore topics were ranked with source confidence.", actor: "Research Intelligence", tone: "info" },
  { id: "tl-2", time: "10:18", title: "Publishing blocked safely", detail: "Manual package created because social APIs are not connected.", actor: "Safety Agent", tone: "safe" },
  { id: "tl-3", time: "11:05", title: "Render retry queued", detail: "FFmpeg worker is missing, so the retry is advisory only.", actor: "Reliability", tone: "warning" },
  { id: "tl-4", time: "12:31", title: "Upgrade proposal staged", detail: "Redis/BullMQ addition needs implementation review.", actor: "Chief Improvement Agent", tone: "premium" },
  { id: "tl-5", time: "13:14", title: "Browser trace recorded", detail: "Dry-run screenshot path captured with safe-domain policy pass.", actor: "Browser Operations", tone: "info" },
  { id: "tl-6", time: "14:02", title: "Approval queue synced", detail: "Three policy decisions linked to audit traces for review.", actor: "Governance", tone: "safe" },
];

const communications: TimelineItem[] = [
  { id: "com-1", time: "Executive", title: "Prioritize sourced Indian folklore shorts this week.", detail: "Strategy asks research to avoid tragedy-adjacent claims.", actor: "Chief Creator Officer", tone: "premium" },
  { id: "com-2", time: "Research", title: "Need human review for one sensitive topic.", detail: "Confidence is high, but policy risk is not zero.", actor: "Source Quality Agent", tone: "warning" },
  { id: "com-3", time: "Studio", title: "Script package can proceed as draft-only.", detail: "No public posting or paid generation required.", actor: "Script Agent", tone: "safe" },
  { id: "com-4", time: "Analytics", title: "Retention dip isolated to mid-video pacing.", detail: "Recommend moving second reveal earlier for mystery shorts.", actor: "Audience Insight Agent", tone: "info" },
  { id: "com-5", time: "Governance", title: "Preview public mode validated for showcase.", detail: "All live execution switches remain blocked in deployment profile.", actor: "Policy Agent", tone: "safe" },
];

const baseMetrics: MetricCard[] = [
  { label: "Active agents", value: "12", delta: "+4 this phase", tone: "premium", detail: "All execution is mock or approval-gated." },
  { label: "Workflow health", value: "86%", delta: "2 monitored", tone: "info", detail: "Render and worker paths are not connected." },
  { label: "Approval gates", value: "On", delta: "0 bypasses", tone: "safe", detail: "Publishing and paid tools are blocked." },
  { label: "Incidents", value: "4", delta: "3 advisory", tone: "warning", detail: "No live automation was attempted." },
];

const basePanels: PagePanel[] = [
  { id: "overview", title: "Autonomous HQ overview", eyebrow: "Command layer", body: "A modular operations surface for agents, departments, workflows, memory, analytics, incidents, and infrastructure.", status: "Mock", tone: "premium" },
  { id: "guard", title: "Risk boundaries", eyebrow: "Safety state", body: "Public publishing, paid tools, browser automation, and production upgrades remain blocked until approval.", status: "Configured", tone: "safe" },
  { id: "fallback", title: "Manual fallback", eyebrow: "Platform truth", body: "Disconnected social platforms generate manual posting packages instead of fake upload claims.", status: "Configured", tone: "info" },
];

const pageCopy: Record<CommandCenterPageId, Pick<CommandCenterView, "title" | "eyebrow" | "description" | "status" | "primaryAction" | "secondaryAction">> = {
  dashboard: {
    title: "Operational Command Center",
    eyebrow: "Autonomous media company HQ",
    description: "A live-feeling, mock-data command surface for Folqen's AI organization: agents, workflows, incidents, analytics, queues, and infrastructure health.",
    status: "Mock",
    primaryAction: "Create content package",
    secondaryAction: "Open approvals",
  },
  agents: {
    title: "Agent Hierarchy",
    eyebrow: "Organizational intelligence",
    description: "Visualize executive, research, creative, safety, operations, and memory agents with tasks, memory summaries, and performance signals.",
    status: "Mock",
    primaryAction: "Assign task",
    secondaryAction: "Review memory",
  },
  departments: {
    title: "Departments",
    eyebrow: "Company operating model",
    description: "Inspect Folqen's AI departments as modular organizational units with ownership, missions, health, and active work.",
    status: "Mock",
    primaryAction: "Open department brief",
    secondaryAction: "Balance workload",
  },
  workflows: {
    title: "Workflow Engine",
    eyebrow: "Pipelines and retries",
    description: "Track workflow cards, execution status, retry indicators, timeline progress, pipeline health, and readable logs.",
    status: "Mock",
    primaryAction: "Retry safe step",
    secondaryAction: "View workflow logs",
  },
  "research-intelligence": {
    title: "Research Intelligence",
    eyebrow: "Trends, sources, competitors",
    description: "Monitor trend signals, competitor patterns, source confidence, topic risk, and research recommendations for folklore content.",
    status: "Mock",
    primaryAction: "Draft research brief",
    secondaryAction: "Escalate sensitive topic",
  },
  "content-studio": {
    title: "Content Studio",
    eyebrow: "Scripts, hooks, media packages",
    description: "Coordinate scripts, hooks, captions, metadata, thumbnail prompts, draft packages, and review readiness.",
    status: "Mock",
    primaryAction: "Generate draft package",
    secondaryAction: "Review latest script",
  },
  analytics: {
    title: "Growth Analytics",
    eyebrow: "Performance intelligence",
    description: "Read CTR, retention, engagement, platform signals, and optimization recommendations without requiring live platform APIs.",
    status: "Mock",
    primaryAction: "Explain analytics",
    secondaryAction: "Compare hooks",
  },
  "organizational-memory": {
    title: "Organizational Memory",
    eyebrow: "Long-term operating memory",
    description: "Track brand memory, decisions, prompt versions, content learnings, incident fixes, and future vector memory readiness.",
    status: "Mock",
    primaryAction: "Search memory",
    secondaryAction: "Add decision note",
  },
  automations: {
    title: "Automation Layer",
    eyebrow: "n8n, queues, workers",
    description: "Observe automation plans, queue health, retry policy, n8n readiness, and guarded execution states.",
    status: "Not connected",
    primaryAction: "Test connection",
    secondaryAction: "Create manual fallback",
  },
  "browser-operations": {
    title: "Browser Operations",
    eyebrow: "Governed web interaction",
    description: "Monitor isolated Playwright session plans, domain policies, screenshot audits, browser traces, quarantine controls, and dry-run web interaction workflows.",
    status: "Mock",
    primaryAction: "Run dry trace",
    secondaryAction: "Review policy",
  },
  "incident-center": {
    title: "Incident Center",
    eyebrow: "Failures and recovery",
    description: "Review failed workflows, retries, escalations, logs, recovery suggestions, and human approval triggers.",
    status: "Mock",
    primaryAction: "Open recovery plan",
    secondaryAction: "Escalate incident",
  },
  infrastructure: {
    title: "Infrastructure",
    eyebrow: "Provider and worker health",
    description: "Monitor Redis readiness, queue metrics, API provider health, orchestration status, worker health, and database state.",
    status: "Mock",
    primaryAction: "Inspect providers",
    secondaryAction: "Open setup",
  },
  settings: {
    title: "Command Settings",
    eyebrow: "Autonomy and guardrails",
    description: "Review autonomy, approval gates, provider setup state, cost controls, research permissions, and operational preferences.",
    status: "Configured",
    primaryAction: "Review safe defaults",
    secondaryAction: "Open credentials wizard",
  },
};

function viewPanels(pageId: CommandCenterPageId): PagePanel[] {
  if (pageId === "incident-center") {
    return [
      { id: "failed", title: "Failed workflows", eyebrow: "Recovery", body: "Render and external automation failures are shown as recoverable incidents, not hidden errors.", status: "Mock", tone: "warning" },
      { id: "retry", title: "Retry policy", eyebrow: "Control", body: "Retries must respect idempotency, provider readiness, approvals, and cost guards.", status: "Configured", tone: "safe" },
      { id: "escalation", title: "Escalations", eyebrow: "Human gate", body: "Risky recovery steps stop and ask for human approval instead of expanding scope.", status: "Needs approval", tone: "danger" },
    ];
  }

  if (pageId === "infrastructure") {
    return [
      { id: "redis", title: "Redis and queues", eyebrow: "Planned", body: "BullMQ and Redis are visualized for readiness, but no Redis endpoint is configured yet.", status: "Not connected", tone: "warning" },
      { id: "workers", title: "Worker fleet", eyebrow: "Media and analytics", body: "Render, research, analytics, and platform workers remain future services behind adapters.", status: "Not connected", tone: "danger" },
      { id: "database", title: "Database", eyebrow: "System of record", body: "Supabase/Postgres remains the live source of truth for the current app state.", status: "Live", tone: "safe" },
    ];
  }

  if (pageId === "settings") {
    return [
      { id: "autonomy", title: "Autonomy level", eyebrow: "Default", body: "High automation with approval gates. Risky execution remains off.", status: "Configured", tone: "safe" },
      { id: "research", title: "Self-improvement", eyebrow: "Allowed", body: "Research and proposals are allowed; execution is blocked until approval.", status: "Configured", tone: "premium" },
      { id: "provider", title: "Provider activation", eyebrow: "Gated", body: "Credentials, paid tools, browser automation, and public publishing require human decisions.", status: "Needs approval", tone: "warning" },
    ];
  }

  return basePanels;
}

export function getCommandCenterView(pageId: CommandCenterPageId): CommandCenterView {
  return {
    id: pageId,
    ...pageCopy[pageId],
    metrics: baseMetrics,
    panels: viewPanels(pageId),
    agents,
    departments,
    workflows,
    intelligence,
    analytics,
    infrastructure,
    timeline,
    communications,
  };
}

export const commandCenterPageIds = Object.keys(pageCopy) as CommandCenterPageId[];
