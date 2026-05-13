export type BrowserOpsStatus = "Mock" | "Not connected" | "Needs approval" | "Configured" | "Blocked";

export type BrowserActionKind = "open_page" | "navigate" | "click" | "type" | "scroll" | "upload_file" | "capture_screenshot" | "inspect_dom" | "extract_structured_data";

export type BrowserWorkflowKind = "page_observation" | "dom_inspection" | "structured_extraction" | "screenshot_audit" | "safe_navigation_rehearsal";

export type BrowserActionPolicy = {
  action: BrowserActionKind;
  status: BrowserOpsStatus;
  requiresApproval: boolean;
  dryRunOnly: boolean;
  summary: string;
};

export type BrowserGovernanceSnapshot = {
  status: BrowserOpsStatus;
  sandboxMode: boolean;
  dryRunOnly: boolean;
  killSwitch: boolean;
  approvalRequired: boolean;
  liveExecutionEnabled: false;
  allowedDomains: string[];
  blockedDomains: string[];
  maxSessionSeconds: number;
  policies: BrowserActionPolicy[];
  blockedReasons: string[];
};

export type BrowserTraceStep = {
  id: string;
  action: BrowserActionKind;
  status: "simulated" | "blocked" | "needs_approval" | "quarantined";
  target: string;
  summary: string;
  durationMs: number;
  evidence: string[];
  maskedInput?: string;
};

export type BrowserSession = {
  id: string;
  title: string;
  status: "idle" | "planned" | "observing" | "blocked" | "quarantined" | "completed";
  mode: "dry_run" | "sandbox";
  createdAt: string;
  updatedAt: string;
  actorId?: string;
  currentUrl?: string;
  domainStatus: BrowserOpsStatus;
  health: BrowserOpsStatus;
  screenshotPreview?: {
    status: BrowserOpsStatus;
    placeholderUrl: string;
    redacted: boolean;
    summary: string;
  };
  quarantineReason?: string;
};

export type BrowserWorkflowRequest = {
  workflowKind: BrowserWorkflowKind;
  objective: string;
  startUrl: string;
  actions: Array<{
    action: BrowserActionKind;
    target?: string;
    value?: string;
  }>;
  approvalId?: string;
  approvalRequired: boolean;
};

export type BrowserWorkflowResult = {
  runId: string;
  sessionId: string;
  workflowKind: BrowserWorkflowKind;
  status: "simulated" | "blocked" | "needs_approval" | "quarantined";
  mode: "dry_run";
  provider: {
    id: "playwright_controller";
    status: BrowserOpsStatus;
    liveExecutionEnabled: false;
  };
  queueJobId: string;
  traceId: string;
  targetHost: string;
  actions: BrowserTraceStep[];
  observations: string[];
  extractedData: Array<{ label: string; value: string; confidence: number }>;
  screenshotAudit: {
    status: BrowserOpsStatus;
    captured: false;
    redacted: true;
    summary: string;
  };
  governance: BrowserGovernanceSnapshot;
  blockedReasons: string[];
  createdAt: string;
};

export type BrowserControlAction = "kill_switch" | "quarantine_session" | "release_quarantine" | "rollback_to_dry_run" | "recover_session";

export type BrowserControlResult = {
  ok: boolean;
  action: BrowserControlAction;
  status: BrowserOpsStatus;
  sessionId?: string;
  queueJobId?: string;
  message: string;
  blockedReasons: string[];
};

export type BrowserOpsDashboard = {
  mode: "dry_run";
  generatedAt: string;
  department: {
    id: "browser_operations";
    name: "Browser Operations Department";
    status: BrowserOpsStatus;
    mission: string;
  };
  provider: {
    id: "playwright_controller";
    name: "Playwright Controller";
    status: BrowserOpsStatus;
    package: "playwright-core";
    liveExecutionEnabled: false;
    summary: string;
  };
  governance: BrowserGovernanceSnapshot;
  sessions: BrowserSession[];
  recentRuns: BrowserWorkflowResult[];
  queue: {
    name: string;
    traceQueueName: string;
    status: BrowserOpsStatus;
    mode: "mock" | "live";
    waiting: number;
    active: number;
    failed: number;
  };
  observability: {
    traces: number;
    screenshotsAudited: number;
    quarantinedSessions: number;
    secretMasking: BrowserOpsStatus;
    safePreviewReady: BrowserOpsStatus;
  };
  notes: string[];
};
