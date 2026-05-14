import type { ComponentType } from "react";

export type CommandCenterPageId =
  | "dashboard"
  | "agents"
  | "departments"
  | "workflows"
  | "research-intelligence"
  | "content-studio"
  | "analytics"
  | "organizational-memory"
  | "automations"
  | "browser-operations"
  | "incident-center"
  | "infrastructure"
  | "settings";

export type StatusTone = "safe" | "info" | "warning" | "danger" | "neutral" | "premium";

export type OperationalStatus = "Live" | "Mock" | "Not connected" | "Needs approval" | "Configured" | "Degraded" | "Blocked";

export type MetricCard = {
  label: string;
  value: string;
  delta: string;
  tone: StatusTone;
  detail: string;
};

export type TimelineItem = {
  id: string;
  time: string;
  title: string;
  detail: string;
  actor: string;
  tone: StatusTone;
};

export type AgentNode = {
  id: string;
  name: string;
  role: string;
  department: string;
  status: OperationalStatus;
  task: string;
  memory: string;
  performance: number;
  autonomy: string;
};

export type DepartmentNode = {
  id: string;
  name: string;
  lead: string;
  mission: string;
  status: OperationalStatus;
  agents: number;
  activeWork: string;
  health: number;
};

export type WorkflowNode = {
  id: string;
  name: string;
  owner: string;
  status: OperationalStatus;
  progress: number;
  retries: number;
  currentStep: string;
  log: string;
};

export type IntelligenceSignal = {
  id: string;
  source: string;
  title: string;
  confidence: number;
  impact: string;
  status: OperationalStatus;
};

export type AnalyticsMetric = {
  id: string;
  label: string;
  value: string;
  series: number[];
  recommendation: string;
  tone: StatusTone;
};

export type InfrastructureNode = {
  id: string;
  name: string;
  status: OperationalStatus;
  metric: string;
  detail: string;
  tone: StatusTone;
};

export type PagePanel = {
  id: string;
  title: string;
  eyebrow: string;
  body: string;
  status: OperationalStatus;
  tone: StatusTone;
};

export type CommandCenterView = {
  id: CommandCenterPageId;
  title: string;
  eyebrow: string;
  description: string;
  status: OperationalStatus;
  primaryAction: string;
  secondaryAction: string;
  metrics: MetricCard[];
  panels: PagePanel[];
  agents: AgentNode[];
  departments: DepartmentNode[];
  workflows: WorkflowNode[];
  intelligence: IntelligenceSignal[];
  analytics: AnalyticsMetric[];
  infrastructure: InfrastructureNode[];
  timeline: TimelineItem[];
  communications: TimelineItem[];
};

export type IconComponent = ComponentType<{ className?: string }>;
