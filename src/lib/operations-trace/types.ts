export type OperationsTraceStatus = "Mock" | "Not connected" | "Needs approval" | "Configured" | "Blocked" | "Live";

export type OperationsTraceSeverity = "info" | "warning" | "error" | "critical";

export type OperationsTraceSource = "audit" | "event" | "workflow" | "error" | "approval" | "render" | "asset" | "queue" | "safety";

export type OperationsTraceItem = {
  id: string;
  source: OperationsTraceSource;
  title: string;
  summary: string;
  status: OperationsTraceStatus;
  severity: OperationsTraceSeverity;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  createdAt: string;
  actor?: string;
  target?: string;
  metadataKeys: string[];
};

export type OperationsTraceSummary = {
  audits: number;
  events: number;
  workflows: number;
  errors: number;
  pendingApprovals: number;
  blockedRuns: number;
  renders: number;
  assets: number;
};

export type OperationsSafetyPosture = {
  id: string;
  label: string;
  status: OperationsTraceStatus;
  description: string;
};

export type OperationsQueueSnapshot = {
  name: string;
  mode: "mock" | "live";
  waiting: number;
  active: number;
  delayed: number;
  failed: number;
  completed: number;
  status: string;
};

export type OperationsTraceDashboard = {
  mode: "read_only";
  generatedAt: string;
  databaseStatus: OperationsTraceStatus;
  queueMode: "mock" | "live";
  summary: OperationsTraceSummary;
  safetyPosture: OperationsSafetyPosture[];
  queues: OperationsQueueSnapshot[];
  traces: OperationsTraceItem[];
  notes: string[];
};
