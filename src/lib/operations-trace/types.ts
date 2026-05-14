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
  verifiedApprovals: number;
  blockedRuns: number;
  renders: number;
  assets: number;
  integrityIssues: number;
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

export type ApprovalLifecycleStep = {
  id: string;
  label: string;
  status: OperationsTraceStatus;
  createdAt: string;
  actor?: string;
  summary: string;
  severity: OperationsTraceSeverity;
};

export type ApprovalReadModel = {
  id: string;
  type: string;
  title: string;
  status: OperationsTraceStatus;
  rawStatus: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  reasonSummary: string;
  requestedBy?: string;
  decidedAt?: string;
  verificationStatus: OperationsTraceStatus;
  verificationReasons: string[];
  lifecycle: ApprovalLifecycleStep[];
  relatedTraceIds: string[];
  rollbackAvailable: boolean;
};

export type TraceIntegrityIssueType = "missing_event" | "orphan_workflow" | "queue_mismatch" | "approval_mismatch" | "missing_audit" | "incident_correlation" | "diagnostic";

export type TraceIntegrityIssue = {
  id: string;
  type: TraceIntegrityIssueType;
  severity: OperationsTraceSeverity;
  status: OperationsTraceStatus;
  title: string;
  summary: string;
  relatedIds: string[];
  detectedAt: string;
};

export type TraceIntegrityReport = {
  status: OperationsTraceStatus;
  checks: {
    totalTraces: number;
    correlatedApprovals: number;
    orphanWorkflows: number;
    missingAuditLinks: number;
    queueMismatches: number;
    openIncidents: number;
  };
  issues: TraceIntegrityIssue[];
};

export type ProductionDiagnostic = {
  id: string;
  category: "deployment" | "auth" | "database" | "queue" | "environment" | "provider" | "governance";
  label: string;
  status: OperationsTraceStatus;
  summary: string;
  evidence: string[];
  safeAction: string;
};

export type OperationalCorrelation = {
  id: string;
  fromId: string;
  toId: string;
  kind: "approval_to_audit" | "workflow_to_event" | "workflow_to_error" | "render_to_asset" | "incident_to_governance";
  label: string;
  status: OperationsTraceStatus;
};

export type OperationsTraceDashboard = {
  mode: "read_only";
  generatedAt: string;
  databaseStatus: OperationsTraceStatus;
  queueMode: "mock" | "live";
  summary: OperationsTraceSummary;
  safetyPosture: OperationsSafetyPosture[];
  queues: OperationsQueueSnapshot[];
  approvals: ApprovalReadModel[];
  integrity: TraceIntegrityReport;
  diagnostics: ProductionDiagnostic[];
  correlations: OperationalCorrelation[];
  traces: OperationsTraceItem[];
  pagination: {
    total: number;
    returned: number;
    pageSize: number;
  };
  notes: string[];
};
