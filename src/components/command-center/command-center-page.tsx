"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Brain,
  Building2,
  CheckCircle2,
  CircleGauge,
  Compass,
  Globe2,
  Layers3,
  LayoutGrid,
  Network,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import type { AgentNode, CommandCenterPageId, CommandCenterView, StatusTone, TimelineItem, WorkflowNode } from "@/lib/command-center/types";
import { toHonestStatus } from "@/lib/status-semantics";
import { cn } from "@/lib/utils";
import { useCommandCenterStore } from "@/stores/command-center-store";

type CommandCenterPageProps = {
  view: CommandCenterView;
  embedded?: boolean;
};

const pageIcons: Record<CommandCenterPageId, typeof Sparkles> = {
  dashboard: LayoutGrid,
  agents: Users,
  departments: Building2,
  workflows: Workflow,
  "research-intelligence": Search,
  "content-studio": Layers3,
  analytics: BarChart3,
  "organizational-memory": Brain,
  automations: Zap,
  "browser-operations": Globe2,
  "incident-center": ShieldCheck,
  infrastructure: Server,
  settings: CircleGauge,
};

const tone = {
  Mock: "info",
  Configured: "safe",
  "Needs approval": "warning",
  "Not connected": "warning",
  Blocked: "danger",
} as const;

function statusVariant(status: string) {
  return tone[toHonestStatus(status)];
}

function Dot({ status }: { status: StatusTone }) {
  return (
    <span
      className={cn(
        "h-2.5 w-2.5 rounded-full",
        status === "danger" && "bg-rose-300",
        status === "warning" && "bg-amber-300",
        status === "info" && "bg-cyan-300",
        (status === "safe" || status === "premium" || status === "neutral") && "bg-neon",
      )}
    />
  );
}

function Hero({ view }: { view: CommandCenterView }) {
  const Icon = pageIcons[view.id];
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.3 }}
      className="panel relative overflow-hidden rounded-3xl p-6 md:p-8"
    >
      <div className="absolute inset-0 bg-[radial-gradient(55%_60%_at_85%_2%,rgba(118,243,162,.16),transparent_75%)]" />
      <div className="relative z-[1] grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/12 bg-white/[0.05] text-neon">
              <Icon className="h-4.5 w-4.5" />
            </span>
            <Badge variant="neutral">{view.eyebrow}</Badge>
            <Badge variant={statusVariant(view.status)}>{toHonestStatus(view.status)}</Badge>
          </div>
          <h1 className="mt-4 max-w-[16ch] font-display text-3xl font-semibold tracking-[-0.04em] sm:text-4xl md:max-w-3xl md:text-5xl">
            {view.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">{view.description}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button>
              <Sparkles className="h-4 w-4" />
              {view.primaryAction}
            </Button>
            <Button asChild variant="secondary">
              <Link href={view.id === "settings" ? "/settings" : "/approvals"}>{view.secondaryAction}</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
          {[
            { label: "Execution Model", value: "Dry-run + governance", badge: "Configured", status: "safe" as const },
            { label: "Department Focus", value: "Autonomous coordination", badge: "Operational", status: "info" as const },
            { label: "Safety Controls", value: "Risky paths blocked", badge: "Active", status: "warning" as const },
          ].map((block) => (
            <div key={block.label} className="panel-soft rounded-xl p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{block.label}</div>
              <div className="mt-2 text-sm font-semibold">{block.value}</div>
              <div className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Dot status={block.status} />
                {block.badge}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function CreatorCoachEmpty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="panel-soft">
      <CardContent className="py-6">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricRail({ view }: { view: CommandCenterView }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {view.metrics.slice(0, 4).map((metric) => (
        <Card key={metric.label} className={metric.tone === "premium" ? "panel-highlight" : "panel-soft"}>
          <CardContent>
            <div className="flex items-center justify-between gap-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{metric.label}</div>
              <Badge variant={metric.tone}>{metric.delta}</Badge>
            </div>
            <div className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em]">{metric.value}</div>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">{metric.detail}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function TimelineFeed({ items }: { items: TimelineItem[] }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="panel-soft rounded-xl p-3.5">
          <div className="flex items-center gap-2">
            <Dot status={item.tone} />
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {item.time} / {item.actor}
            </span>
          </div>
          <div className="mt-2 text-sm font-semibold">{item.title}</div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.detail}</p>
        </div>
      ))}
    </div>
  );
}

function AgentList({ agents }: { agents: AgentNode[] }) {
  return (
    <div className="space-y-2">
      {agents.map((agent) => (
        <article key={agent.id} className="panel-soft rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">{agent.name}</h3>
              <p className="text-xs text-muted-foreground">{agent.role}</p>
            </div>
            <Badge variant={statusVariant(agent.status)}>{toHonestStatus(agent.status)}</Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{agent.task}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
            <div className="h-full rounded-full bg-neon/80" style={{ width: `${agent.performance}%` }} />
          </div>
        </article>
      ))}
    </div>
  );
}

function WorkflowList({ workflows }: { workflows: WorkflowNode[] }) {
  return (
    <div className="space-y-2">
      {workflows.map((workflow) => (
        <article key={workflow.id} className="panel-soft rounded-xl p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">{workflow.name}</h3>
            <Badge variant={statusVariant(workflow.status)}>{toHonestStatus(workflow.status)}</Badge>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{workflow.owner}</p>
          <p className="mt-2 text-sm text-muted-foreground">{workflow.currentStep}</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <span className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5">{workflow.progress}%</span>
            <span className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5">{workflow.retries} retries</span>
            <span className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5">trace</span>
          </div>
        </article>
      ))}
    </div>
  );
}

function IntelligenceDeck({ view }: { view: CommandCenterView }) {
  return (
    <div className="space-y-2">
      {view.intelligence.map((insight) => (
        <article key={insight.id} className="panel-soft rounded-xl p-4">
          <div className="flex items-center justify-between gap-2">
            <Badge variant={statusVariant(insight.status)}>{insight.source}</Badge>
            <span className="text-xs text-muted-foreground">{insight.confidence}%</span>
          </div>
          <h3 className="mt-2 text-sm font-semibold">{insight.title}</h3>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">{insight.impact}</p>
        </article>
      ))}
    </div>
  );
}

function AnalyticsDeck({ view }: { view: CommandCenterView }) {
  return (
    <div className="space-y-2">
      {view.analytics.map((metric) => (
        <article key={metric.id} className="panel-soft rounded-xl p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">{metric.label}</h3>
            <Badge variant={metric.tone}>{metric.value}</Badge>
          </div>
          <p className="mt-2 text-xs leading-6 text-muted-foreground">{metric.recommendation}</p>
        </article>
      ))}
    </div>
  );
}

function InfrastructureDeck({ view }: { view: CommandCenterView }) {
  return (
    <div className="space-y-2">
      {view.infrastructure.map((infra) => (
        <article key={infra.id} className="panel-soft rounded-xl p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">{infra.name}</h3>
            <Badge variant={statusVariant(infra.status)}>{toHonestStatus(infra.status)}</Badge>
          </div>
          <p className="mt-2 text-sm">{infra.metric}</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">{infra.detail}</p>
        </article>
      ))}
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  description,
  action,
  children,
}: {
  icon: typeof Sparkles;
  title: string;
  description: string;
  action?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="panel">
      <CardHeader>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Icon className="h-4 w-4 text-neon" />
              {title}
            </div>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          {action ? (
            <Button size="sm" variant="ghost">
              {action}
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function DashboardView({ view }: { view: CommandCenterView }) {
  const { essentialMode } = useCommandCenterStore();

  return (
    <div className="section-space">
      <div className="grid gap-3 md:grid-cols-3">
        {view.panels.slice(0, 3).map((panel) => (
          <article key={panel.id} className="panel-soft rounded-xl p-4">
            <div className="flex items-center justify-between gap-2">
              <Badge variant={panel.tone}>{panel.eyebrow}</Badge>
              <Badge variant={statusVariant(panel.status)}>{toHonestStatus(panel.status)}</Badge>
            </div>
            <h3 className="mt-3 text-sm font-semibold">{panel.title}</h3>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">{panel.body}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Section icon={Compass} title="Intelligence Brief" description="Research and content signals ranked by strategic relevance." action="Inspect">
          <IntelligenceDeck view={view} />
        </Section>
        <Section icon={Activity} title="Operational Timeline" description="Cross-department trace events and execution notes." action="Open traces">
          <TimelineFeed items={view.timeline.slice(0, 6)} />
        </Section>
      </div>

      {essentialMode ? (
        <details className="group rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <summary className="cursor-pointer text-sm font-semibold text-muted-foreground transition group-open:text-foreground">Show advanced operational context</summary>
          <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <Section icon={Workflow} title="Workflow State" description="Execution lanes, retries, and status transitions." action="View pipelines">
              <WorkflowList workflows={view.workflows.slice(0, 6)} />
            </Section>
            <Section icon={Users} title="Agent Communication" description="Intra-organization messaging and task handoffs." action="Open feed">
              <TimelineFeed items={view.communications.slice(0, 6)} />
            </Section>
          </div>
        </details>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <Section icon={Workflow} title="Workflow State" description="Execution lanes, retries, and status transitions." action="View pipelines">
            <WorkflowList workflows={view.workflows.slice(0, 6)} />
          </Section>
          <Section icon={Users} title="Agent Communication" description="Intra-organization messaging and task handoffs." action="Open feed">
            <TimelineFeed items={view.communications.slice(0, 6)} />
          </Section>
        </div>
      )}
    </div>
  );
}

function AgentsView({ view }: { view: CommandCenterView }) {
  const { selectedDepartment, setSelectedDepartment, essentialMode } = useCommandCenterStore();
  const departments = Array.from(new Set(view.agents.map((agent) => agent.department)));
  const filtered = selectedDepartment === "all" ? view.agents : view.agents.filter((agent) => agent.department === selectedDepartment);

  return (
    <div className="section-space">
      <div className="flex flex-wrap gap-2">
        {["all", ...departments].map((department) => (
          <Button key={department} size="sm" variant={selectedDepartment === department ? "default" : "secondary"} onClick={() => setSelectedDepartment(department)}>
            {department === "all" ? "All departments" : department}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Section icon={Users} title="AI Workforce" description="Ownership, task states, and performance signals." action="Assign task">
          <AgentList agents={filtered.slice(0, 8)} />
        </Section>
        {essentialMode ? (
          <details className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <summary className="cursor-pointer text-sm font-semibold text-muted-foreground">Show coordination feed</summary>
            <div className="mt-4">
              <Section icon={Network} title="Coordination Feed" description="Department alignment and escalation chatter." action="Open comms">
                <TimelineFeed items={view.communications.slice(0, 8)} />
              </Section>
            </div>
          </details>
        ) : (
          <Section icon={Network} title="Coordination Feed" description="Department alignment and escalation chatter." action="Open comms">
            <TimelineFeed items={view.communications.slice(0, 8)} />
          </Section>
        )}
      </div>
    </div>
  );
}

function WorkflowsView({ view }: { view: CommandCenterView }) {
  const { essentialMode } = useCommandCenterStore();

  return (
    <div className="section-space">
      <CreatorCoachEmpty
        title="No live automation is running yet"
        description="Start with a creator objective from Dashboard. Folqen will prepare a governed first workflow and show draft outputs here."
      />
      <div className="grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
      <Section icon={Workflow} title="Workflow Lanes" description="Progress tracking and retry indicators." action="View logs">
        <WorkflowList workflows={view.workflows} />
      </Section>
      {essentialMode ? (
        <details className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <summary className="cursor-pointer text-sm font-semibold text-muted-foreground">Show recovery timeline</summary>
          <div className="mt-4">
            <Section icon={Activity} title="Recovery Timeline" description="Failures, retries, and escalation flow." action="Open incident center">
              <TimelineFeed items={view.timeline.slice(0, 8)} />
            </Section>
          </div>
        </details>
      ) : (
        <Section icon={Activity} title="Recovery Timeline" description="Failures, retries, and escalation flow." action="Open incident center">
          <TimelineFeed items={view.timeline.slice(0, 8)} />
        </Section>
      )}
      </div>
    </div>
  );
}

function IntelligenceView({ view }: { view: CommandCenterView }) {
  const { essentialMode } = useCommandCenterStore();

  return (
    <div className="section-space">
      <CreatorCoachEmpty
        title="Creator guidance mode"
        description="Use conversational prompts to generate strategy and content drafts first. Advanced operational telemetry stays secondary."
      />
      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
      <Section icon={Search} title="Signal Intelligence" description="Ranked topics, opportunities, and contextual caveats." action="Run workflow">
        <IntelligenceDeck view={view} />
      </Section>
      {essentialMode ? (
        <details className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <summary className="cursor-pointer text-sm font-semibold text-muted-foreground">Show performance reasoning</summary>
          <div className="mt-4">
            <Section icon={BarChart3} title="Performance Reasoning" description="Analytics-informed recommendations and scoring." action="Explain insight">
              <AnalyticsDeck view={view} />
            </Section>
          </div>
        </details>
      ) : (
        <Section icon={BarChart3} title="Performance Reasoning" description="Analytics-informed recommendations and scoring." action="Explain insight">
          <AnalyticsDeck view={view} />
        </Section>
      )}
      </div>
    </div>
  );
}

function InfrastructureView({ view }: { view: CommandCenterView }) {
  const { essentialMode } = useCommandCenterStore();

  return (
    <div className="section-space">
      <CreatorCoachEmpty
        title="Infrastructure remains in safe preview posture"
        description="Operational diagnostics are available, but publishing, unrestricted rendering, and unrestricted provider execution remain intentionally blocked."
      />
      <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
      <Section icon={Server} title="Runtime Infrastructure" description="Providers, queues, and system health posture." action="Diagnostics">
        <InfrastructureDeck view={view} />
      </Section>
      {essentialMode ? (
        <details className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <summary className="cursor-pointer text-sm font-semibold text-muted-foreground">Show governance trace</summary>
          <div className="mt-4">
            <Section icon={ShieldCheck} title="Governance Trace" description="Execution controls, policy checks, and audit-linked changes." action="Audit center">
              <TimelineFeed items={view.timeline.slice(0, 8)} />
            </Section>
          </div>
        </details>
      ) : (
        <Section icon={ShieldCheck} title="Governance Trace" description="Execution controls, policy checks, and audit-linked changes." action="Audit center">
          <TimelineFeed items={view.timeline.slice(0, 8)} />
        </Section>
      )}
      </div>
    </div>
  );
}

function Body({ view }: { view: CommandCenterView }) {
  if (view.id === "dashboard") return <DashboardView view={view} />;
  if (view.id === "agents" || view.id === "departments") return <AgentsView view={view} />;
  if (view.id === "workflows" || view.id === "automations" || view.id === "incident-center") return <WorkflowsView view={view} />;
  if (view.id === "research-intelligence" || view.id === "content-studio" || view.id === "analytics" || view.id === "organizational-memory")
    return <IntelligenceView view={view} />;
  return <InfrastructureView view={view} />;
}

export function CommandCenterPage({ view, embedded = false }: CommandCenterPageProps) {
  const { essentialMode, toggleEssentialMode, setLastVisitedPage } = useCommandCenterStore();

  useEffect(() => {
    setLastVisitedPage(view.id);
  }, [setLastVisitedPage, view.id]);

  return (
    <div className={cn("section-space", embedded ? "" : "pb-24")}>
      <Hero view={view} />
      <MetricRail view={view} />
      <div className="flex justify-end">
        <Button size="sm" variant="secondary" onClick={toggleEssentialMode}>
          {essentialMode ? "Show advanced panels" : "Essential mode"}
        </Button>
      </div>
      <Body view={view} />
      <div className="panel-soft flex items-start gap-2 rounded-xl px-4 py-3 text-xs text-muted-foreground">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-neon" />
        Folqen remains in governed preview-safe runtime. Publishing, paid provider execution, rendering workers, browser automation, and queue workers stay blocked.
      </div>
    </div>
  );
}
