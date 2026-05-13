"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Brain,
  Building2,
  CircuitBoard,
  Clock3,
  GitBranch,
  Layers3,
  LineChart,
  LockKeyhole,
  MessageSquare,
  Network,
  RadioTower,
  Radar,
  Globe2,
  RefreshCw,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AgentNode, AnalyticsMetric, CommandCenterPageId, CommandCenterView, DepartmentNode, InfrastructureNode, StatusTone, TimelineItem, WorkflowNode } from "@/lib/command-center/types";
import { cn } from "@/lib/utils";
import { useCommandCenterStore } from "@/stores/command-center-store";

type CommandCenterPageProps = {
  view: CommandCenterView;
  embedded?: boolean;
};

const pageIcons: Record<CommandCenterPageId, typeof Sparkles> = {
  dashboard: CircuitBoard,
  agents: Users,
  departments: Building2,
  workflows: Workflow,
  "research-intelligence": Search,
  "content-studio": Layers3,
  analytics: LineChart,
  "organizational-memory": Brain,
  automations: Zap,
  "browser-operations": Globe2,
  "incident-center": AlertTriangle,
  infrastructure: Server,
  settings: LockKeyhole,
};

const toneClasses: Record<StatusTone, string> = {
  safe: "text-neon border-neon/25 bg-neon/10",
  info: "text-cyan-100 border-cyan-300/25 bg-cyan-300/10",
  warning: "text-amber-100 border-amber-300/25 bg-amber-300/10",
  danger: "text-rose-100 border-rose-300/25 bg-rose-300/10",
  neutral: "text-muted-foreground border-white/10 bg-white/[0.04]",
  premium: "text-foreground border-neon/35 bg-neon/10 shadow-glow",
};

const statusTone = {
  Live: "safe",
  Mock: "info",
  "Not connected": "warning",
  "Needs approval": "warning",
  Configured: "safe",
  Degraded: "danger",
  Blocked: "danger",
} as const;

function StatusDot({ tone }: { tone: StatusTone }) {
  return <span className={cn("h-2.5 w-2.5 rounded-full", tone === "danger" ? "bg-rose-300" : tone === "warning" ? "bg-amber-300" : tone === "info" ? "bg-cyan-300" : "bg-neon")} />;
}

function StatusBadge({ status }: { status: CommandCenterView["status"] }) {
  return (
    <Badge variant={statusTone[status]}>
      <StatusDot tone={statusTone[status]} />
      {status}
    </Badge>
  );
}

function HeroPreview({ view }: { view: CommandCenterView }) {
  const previewAgents = view.agents.slice(0, 4);
  const previewSteps = view.workflows.slice(0, 3);

  return (
    <div className="scanline relative min-h-[300px] min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[rgba(8,13,10,.88)] p-4 shadow-[0_30px_90px_rgba(0,0,0,.38)]">
      <div className="absolute inset-0 bg-[radial-gradient(65%_42%_at_80%_4%,rgba(182,255,59,.16),transparent_62%)]" />
      <div className="relative flex items-center gap-2 border-b border-white/10 pb-3">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-300/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-neon/80" />
        <div className="ml-2 flex-1 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 font-mono text-[10px] text-muted-foreground">
          folqen://{view.id}/operations
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-neon">dry-run</span>
      </div>
      <div className="relative grid gap-4 pt-4 lg:grid-cols-[0.72fr_1fr]">
        <div className="space-y-3">
          <div className="rounded-2xl border border-neon/20 bg-neon/[0.07] p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-neon">AI workforce</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {previewAgents.map((agent) => (
                <div key={agent.id} className="rounded-xl border border-white/10 bg-black/20 p-2">
                  <div className="flex items-center gap-2">
                    <StatusDot tone={statusTone[agent.status]} />
                    <span className="truncate text-xs font-medium">{agent.name}</span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-neon" style={{ width: `${agent.performance}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Runtime</span>
              <span className="text-xs text-neon">Sandbox locked</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {["AI", "Render", "Publish"].map((label) => (
                <div key={label} className="rounded-xl border border-white/10 bg-black/20 px-2 py-2">
                  <div className="font-mono text-[10px] text-muted-foreground">{label}</div>
                  <div className="mt-1 text-xs text-amber-100">Blocked</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {previewSteps.map((workflow, index) => (
            <div key={workflow.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">0{index + 1} / {workflow.owner}</div>
                  <div className="mt-1 text-sm font-medium">{workflow.name}</div>
                </div>
                <StatusBadge status={workflow.status} />
              </div>
              <div className="mt-3">
                <ProgressRail value={workflow.progress} tone={workflow.status === "Not connected" ? "warning" : "safe"} />
              </div>
            </div>
          ))}
          <div className="rounded-2xl border border-neon/20 bg-[linear-gradient(135deg,rgba(182,255,59,.09),rgba(27,214,162,.035))] p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-neon">
              <Radar className="h-4 w-4" />
              Preview deployment posture verified
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Operational dashboards can be viewed while live providers, publishing, rendering, browser execution, workers, and retries stay disabled.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressRail({ value, tone = "safe" }: { value: number; tone?: StatusTone }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]" aria-label={`${value}%`}>
      <div className={cn("h-full rounded-full", tone === "warning" ? "bg-amber-300" : tone === "danger" ? "bg-rose-300" : tone === "info" ? "bg-cyan-300" : "bg-neon")} style={{ width: `${value}%` }} />
    </div>
  );
}

function Sparkline({ values, tone }: { values: number[]; tone: StatusTone }) {
  const max = Math.max(1, ...values);

  return (
    <div className="flex h-14 items-end gap-1" aria-label="Metric trend">
      {values.map((value, index) => (
        <span
          key={`${value}-${index}`}
          className={cn("w-full rounded-t-sm", tone === "warning" ? "bg-amber-300/70" : tone === "info" ? "bg-cyan-300/70" : tone === "danger" ? "bg-rose-300/70" : "bg-neon/70")}
          style={{ height: `${Math.max(18, (value / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

function PageHero({ view }: { view: CommandCenterView }) {
  const Icon = pageIcons[view.id];
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.28 }}
      className="command-panel relative overflow-hidden rounded-3xl p-5 md:p-6 xl:p-7"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon/70 to-transparent" />
      <div className="absolute right-[-12%] top-[-22%] h-80 w-80 rounded-full bg-neon/10 blur-3xl" />
      <div className="relative z-[1] grid gap-6 xl:grid-cols-[0.78fr_1fr] xl:items-end">
        <div className="max-w-3xl min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-neon/25 bg-neon/10 text-neon shadow-glow">
              <Icon className="h-5 w-5" />
            </span>
            <Badge variant="premium">{view.eyebrow}</Badge>
            <StatusBadge status={view.status} />
          </div>
          <h1 className="mt-6 max-w-[12ch] font-display text-3xl font-semibold tracking-[-0.035em] text-foreground sm:max-w-3xl sm:text-4xl md:text-6xl xl:text-7xl">
            {view.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">{view.description}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button type="button" className="max-sm:w-full">
              <Sparkles className="h-4 w-4" />
              {view.primaryAction}
            </Button>
            <Button asChild variant="secondary" className="max-sm:w-full">
              <Link href={view.id === "settings" ? "/settings" : "/approvals"}>
                {view.secondaryAction}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-7 grid gap-2 sm:grid-cols-3">
            {["Providers off", "Workers paused", "Approval gates active"].map((label) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-3 text-xs text-muted-foreground">
                <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-neon shadow-[0_0_10px_rgba(182,255,59,.9)]" />
                {label}
              </div>
            ))}
          </div>
        </div>
        <div className="hidden min-w-0 sm:block">
          <HeroPreview view={view} />
        </div>
      </div>
    </motion.section>
  );
}

function MetricsGrid({ view }: { view: CommandCenterView }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.28 }}
      className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
    >
      {view.metrics.map((metric, index) => (
        <Card key={metric.label} className={cn("overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-neon/25", toneClasses[metric.tone])}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{metric.label}</div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.28, delay: reduceMotion ? 0 : index * 0.04 }}
                  className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em]"
                >
                  {metric.value}
                </motion.div>
              </div>
              <Badge variant={metric.tone}>{metric.delta}</Badge>
            </div>
            <p className="mt-4 min-h-10 text-xs leading-5 text-muted-foreground">{metric.detail}</p>
            <div className="mt-4 flex items-center gap-1.5">
              {Array.from({ length: 18 }).map((_, barIndex) => (
                <span
                  key={barIndex}
                  className={cn("h-1 flex-1 rounded-full", barIndex <= index * 4 + 5 ? "bg-neon/70" : "bg-white/[0.06]")}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </motion.section>
  );
}

function PanelsGrid({ view }: { view: CommandCenterView }) {
  return (
    <section className="grid gap-3 lg:grid-cols-3">
      {view.panels.map((panel) => (
        <Card key={panel.id} className={cn("min-h-44", toneClasses[panel.tone])}>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <Badge variant={panel.tone}>{panel.eyebrow}</Badge>
              <StatusBadge status={panel.status} />
            </div>
            <CardTitle className="mt-3">{panel.title}</CardTitle>
            <CardDescription>{panel.body}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </section>
  );
}

function AgentCard({ agent }: { agent: AgentNode }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{agent.name}</CardTitle>
            <CardDescription>{agent.role}</CardDescription>
          </div>
          <StatusBadge status={agent.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Current action</div>
          <p className="mt-2 text-sm leading-6 text-foreground">{agent.task}</p>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Performance</span>
            <span className="font-mono text-neon">{agent.performance}%</span>
          </div>
          <div className="mt-2">
            <ProgressRail value={agent.performance} tone={agent.performance > 90 ? "safe" : "info"} />
          </div>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">{agent.memory}</p>
      </CardContent>
    </Card>
  );
}

function AgentHierarchy({ agents }: { agents: AgentNode[] }) {
  const executives = agents.filter((agent) => agent.department === "Executive");
  const departments = Array.from(new Set(agents.map((agent) => agent.department).filter((department) => department !== "Executive")));

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-neon" />
          <CardTitle>Agent hierarchy</CardTitle>
        </div>
        <CardDescription>Executive control delegates to specialist departments while safety can block risky execution.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="space-y-3">
            {executives.map((agent) => (
              <div key={agent.id} className="relative overflow-hidden rounded-2xl border border-neon/25 bg-[radial-gradient(70%_70%_at_80%_0%,rgba(182,255,59,.18),rgba(182,255,59,.06))] p-5 shadow-[0_0_45px_rgba(182,255,59,.10)]">
                <div className="absolute right-4 top-4 h-20 w-20 rounded-full border border-neon/20" />
                <div className="absolute right-8 top-8 h-12 w-12 rounded-full border border-neon/30" />
                <div className="font-display text-xl font-semibold tracking-[-0.02em]">{agent.name}</div>
                <div className="mt-1 text-sm text-muted-foreground">{agent.task}</div>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {["Strategy", "Memory", "Safety"].map((label) => (
                    <div key={label} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-center font-mono text-[10px] uppercase tracking-widest text-neon">
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {departments.map((department) => (
              <div key={department} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-neon/25 hover:bg-neon/[0.035]">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{department}</div>
                <div className="mt-3 space-y-2">
                  {agents
                    .filter((agent) => agent.department === department)
                    .map((agent) => (
                      <div key={agent.id} className="flex items-center justify-between gap-2 rounded-xl bg-black/20 px-3 py-2 text-xs">
                        <span className="truncate">{agent.name}</span>
                        <StatusDot tone={statusTone[agent.status]} />
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DepartmentGrid({ departments }: { departments: DepartmentNode[] }) {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {departments.map((department) => (
        <Card key={department.id}>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <Badge variant={statusTone[department.status]}>{department.status}</Badge>
              <span className="font-mono text-xs text-muted-foreground">{department.agents} agents</span>
            </div>
            <CardTitle>{department.name}</CardTitle>
            <CardDescription>{department.mission}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{department.lead}</span>
              <span className="font-mono text-neon">{department.health}%</span>
            </div>
            <div className="mt-3">
              <ProgressRail value={department.health} tone={department.health > 85 ? "safe" : department.health > 70 ? "info" : "warning"} />
            </div>
            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-foreground">{department.activeWork}</div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function WorkflowCards({ workflows }: { workflows: WorkflowNode[] }) {
  return (
    <section className="grid gap-3 lg:grid-cols-2">
      {workflows.map((workflow) => (
        <Card key={workflow.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>{workflow.name}</CardTitle>
                <CardDescription>{workflow.owner}</CardDescription>
              </div>
              <StatusBadge status={workflow.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="text-xs text-muted-foreground">Progress</div>
                <div className="mt-1 font-mono text-lg text-neon">{workflow.progress}%</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="text-xs text-muted-foreground">Retries</div>
                <div className="mt-1 font-mono text-lg text-amber-100">{workflow.retries}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="text-xs text-muted-foreground">Step</div>
                <div className="mt-1 truncate text-sm">{workflow.currentStep}</div>
              </div>
            </div>
            <div className="mt-4">
              <ProgressRail value={workflow.progress} tone={workflow.status === "Not connected" ? "warning" : "safe"} />
            </div>
            <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3 font-mono text-xs leading-5 text-muted-foreground">{workflow.log}</div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function AnalyticsGrid({ metrics }: { metrics: AnalyticsMetric[] }) {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.id}>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <Badge variant={metric.tone}>{metric.label}</Badge>
              <span className="font-display text-2xl font-semibold">{metric.value}</span>
            </div>
          </CardHeader>
          <CardContent>
            <Sparkline values={metric.series} tone={metric.tone} />
            <p className="mt-4 text-xs leading-5 text-muted-foreground">{metric.recommendation}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function InfrastructureGrid({ infrastructure }: { infrastructure: InfrastructureNode[] }) {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {infrastructure.map((node) => (
        <Card key={node.id} className={toneClasses[node.tone]}>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>{node.name}</CardTitle>
                <CardDescription>{node.detail}</CardDescription>
              </div>
              <StatusBadge status={node.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl text-foreground">{node.metric}</div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function RuntimeStatusStrip({ view }: { view: CommandCenterView }) {
  const reduceMotion = useReducedMotion();
  const cells = [
    { label: "AI provider runtime", value: "Mock / approval gated", tone: "warning" as StatusTone },
    { label: "Browser operations", value: view.id === "browser-operations" ? "Sandbox trace only" : "Disabled by policy", tone: "info" as StatusTone },
    { label: "Media rendering", value: "No unrestricted GPU", tone: "warning" as StatusTone },
    { label: "Publishing", value: "Manual packages only", tone: "safe" as StatusTone },
  ];

  return (
    <motion.section
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.28 }}
      className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
    >
      {cells.map((cell) => (
        <div key={cell.label} className={cn("rounded-2xl border px-4 py-3", toneClasses[cell.tone])}>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{cell.label}</span>
          </div>
          <div className="mt-2 text-sm font-medium text-foreground">{cell.value}</div>
        </div>
      ))}
    </motion.section>
  );
}

function Timeline({ title, icon: Icon, items }: { title: string; icon: typeof Clock3; items: TimelineItem[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-neon" />
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="grid grid-cols-[auto_1fr] gap-3">
            <div className="flex flex-col items-center">
              <span className={cn("flex h-8 w-8 items-center justify-center rounded-xl border", toneClasses[item.tone])}>
                <StatusDot tone={item.tone} />
              </span>
              <span className="mt-2 h-full w-px bg-white/10" />
            </div>
            <div className="pb-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{item.time} / {item.actor}</div>
              <div className="mt-1 text-sm font-medium text-foreground">{item.title}</div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.detail}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function IntelligenceBoard({ view }: { view: CommandCenterView }) {
  return (
    <section className="grid gap-3 xl:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <RadioTower className="h-4 w-4 text-neon" />
            <CardTitle>Research signals</CardTitle>
          </div>
          <CardDescription>Trend, competitor, source-confidence, and policy signals stay advisory until approved.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {view.intelligence.map((signal) => (
            <div key={signal.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Badge variant={statusTone[signal.status]}>{signal.source}</Badge>
                <span className="font-mono text-xs text-neon">{signal.confidence}% confidence</span>
              </div>
              <div className="mt-3 font-medium">{signal.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{signal.impact}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <Timeline title="Agent communication feed" icon={MessageSquare} items={view.communications} />
    </section>
  );
}

function OperationalMatrix({ view }: { view: CommandCenterView }) {
  const { selectedDepartment, setSelectedDepartment, density, setDensity } = useCommandCenterStore();
  const departments = useMemo(() => ["all", ...Array.from(new Set(view.agents.map((agent) => agent.department)))], [view.agents]);
  const visibleAgents = selectedDepartment === "all" ? view.agents : view.agents.filter((agent) => agent.department === selectedDepartment);

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {departments.map((department) => (
            <Button key={department} type="button" variant={selectedDepartment === department ? "default" : "secondary"} size="sm" onClick={() => setSelectedDepartment(department)}>
              {department === "all" ? "All departments" : department}
            </Button>
          ))}
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={() => setDensity(density === "comfortable" ? "compact" : "comfortable")}>
          <RefreshCw className="h-3.5 w-3.5" />
          {density}
        </Button>
      </div>
      <div className={cn("grid gap-3", density === "compact" ? "md:grid-cols-2 xl:grid-cols-3" : "lg:grid-cols-2")}>
        {visibleAgents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </section>
  );
}

function SettingsMatrix() {
  const flags = [
    ["Public publishing", "Blocked", "safe"],
    ["Paid tools", "Blocked", "safe"],
    ["Browser automation", "Blocked", "safe"],
    ["Self-improvement research", "Draft proposals only", "premium"],
    ["Provider credentials", "Human required", "warning"],
    ["Production upgrades", "Approval required", "warning"],
  ] as const;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-neon" />
          <CardTitle>Operational guardrails</CardTitle>
        </div>
        <CardDescription>Command center settings are designed around safe autonomy, honest provider status, and human-controlled risk.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {flags.map(([label, value, tone]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="font-display text-lg font-semibold">{value}</span>
              <Badge variant={tone}>{tone === "safe" ? "Safe" : tone === "premium" ? "Research" : "Needs human"}</Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function DashboardComposition({ view }: { view: CommandCenterView }) {
  return (
    <>
      <PanelsGrid view={view} />
      <section className="grid gap-3 xl:grid-cols-[1.1fr_0.9fr]">
        <AgentHierarchy agents={view.agents} />
        <Timeline title="Recent actions feed" icon={Clock3} items={view.timeline} />
      </section>
      <section className="grid gap-3 xl:grid-cols-[1fr_1fr]">
        <WorkflowCards workflows={view.workflows.slice(0, 2)} />
        <InfrastructureGrid infrastructure={view.infrastructure.slice(0, 3)} />
      </section>
      <AnalyticsGrid metrics={view.analytics} />
      <IntelligenceBoard view={view} />
    </>
  );
}

function PageBody({ view }: { view: CommandCenterView }) {
  if (view.id === "dashboard") return <DashboardComposition view={view} />;
  if (view.id === "agents") return <><AgentHierarchy agents={view.agents} /><OperationalMatrix view={view} /><Timeline title="Agent communication feed" icon={MessageSquare} items={view.communications} /></>;
  if (view.id === "departments") return <><DepartmentGrid departments={view.departments} /><OperationalMatrix view={view} /></>;
  if (view.id === "workflows") return <><WorkflowCards workflows={view.workflows} /><Timeline title="Workflow timeline" icon={GitBranch} items={view.timeline} /></>;
  if (view.id === "research-intelligence") return <><IntelligenceBoard view={view} /><PanelsGrid view={view} /></>;
  if (view.id === "content-studio") return <><PanelsGrid view={view} /><OperationalMatrix view={view} /><WorkflowCards workflows={view.workflows.slice(1, 3)} /></>;
  if (view.id === "analytics") return <><AnalyticsGrid metrics={view.analytics} /><IntelligenceBoard view={view} /></>;
  if (view.id === "organizational-memory") return <><OperationalMatrix view={view} /><Timeline title="Memory and decision timeline" icon={Brain} items={view.timeline} /></>;
  if (view.id === "automations") return <><WorkflowCards workflows={view.workflows} /><InfrastructureGrid infrastructure={view.infrastructure.slice(0, 4)} /></>;
  if (view.id === "browser-operations") return <><PanelsGrid view={view} /><OperationalMatrix view={view} /><Timeline title="Browser operation trace feed" icon={Globe2} items={view.timeline} /></>;
  if (view.id === "incident-center") return <><PanelsGrid view={view} /><WorkflowCards workflows={view.workflows.filter((workflow) => workflow.status !== "Configured")} /><Timeline title="Recovery log" icon={AlertTriangle} items={view.timeline} /></>;
  if (view.id === "infrastructure") return <><InfrastructureGrid infrastructure={view.infrastructure} /><WorkflowCards workflows={view.workflows} /></>;
  return <><PanelsGrid view={view} /><SettingsMatrix /></>;
}

export function CommandCenterPage({ view, embedded = false }: CommandCenterPageProps) {
  const { setLastVisitedPage } = useCommandCenterStore();

  useEffect(() => {
    setLastVisitedPage(view.id);
  }, [setLastVisitedPage, view.id]);

  return (
    <div className={cn("space-y-5", embedded ? "" : "pb-24")}>
      <PageHero view={view} />
      <MetricsGrid view={view} />
      <RuntimeStatusStrip view={view} />
      <PageBody view={view} />
    </div>
  );
}
