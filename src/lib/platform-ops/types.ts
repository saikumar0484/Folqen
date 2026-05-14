export type PlatformOpsStatusLabel = "Mock" | "Not connected" | "Needs approval" | "Configured" | "Blocked";

export type PlatformOpsPlatform = "YOUTUBE" | "INSTAGRAM" | "THREADS" | "TIKTOK" | "LINKEDIN" | "X_TWITTER";

export type PlatformOpsWorkflowKind =
  | "scheduled_publishing"
  | "multi_platform_distribution"
  | "publishing_retry_recovery"
  | "failed_upload_recovery"
  | "platform_adaptation"
  | "analytics_collection"
  | "engagement_monitoring";

export type PlatformOpsProviderId =
  | "mock"
  | "n8n"
  | "youtube_api"
  | "instagram_graph"
  | "threads_api"
  | "tiktok_api"
  | "linkedin_api"
  | "x_api";

export type PlatformOpsProviderStatus = {
  id: PlatformOpsProviderId;
  label: string;
  status: PlatformOpsStatusLabel;
  capabilities: string[];
  reason: string;
  livePublishingEnabled: false;
};

export type PlatformProfile = {
  id: PlatformOpsPlatform;
  label: string;
  tier: "primary" | "secondary" | "requested_placeholder";
  defaultAspectRatios: string[];
  maxTitleLength: number;
  maxCaptionLength: number;
  hashtagLimit: number;
  apiProviderId: PlatformOpsProviderId;
  manualFallback: true;
  notes: string[];
};

export type PublishingWorkflowDefinition = {
  kind: PlatformOpsWorkflowKind;
  name: string;
  description: string;
  queue: "publishing" | "scheduling" | "retry";
  approvalReason: string;
  retryable: boolean;
};

export type PlatformOperationInput = {
  workflowKind: PlatformOpsWorkflowKind;
  objective: string;
  contentId?: string;
  title?: string;
  caption?: string;
  description?: string;
  hashtags?: string[];
  platforms?: PlatformOpsPlatform[];
  scheduledAt?: string;
  assetIds?: string[];
  approvalRequired?: boolean;
};

export type PlatformAdaptation = {
  platform: PlatformOpsPlatform;
  title: string;
  caption: string;
  hashtags: string[];
  aspectRatio: string;
  metadata: {
    description: string;
    visibility: "private_draft" | "manual_package_only";
    category: string;
    region: "India" | "Global";
    template: string;
  };
  checks: {
    titleLength: number;
    captionLength: number;
    hashtagCount: number;
    policy: PlatformOpsStatusLabel;
    publishing: PlatformOpsStatusLabel;
  };
};

export type DeploymentPlan = {
  deploymentId: string;
  platform: PlatformOpsPlatform;
  status: "queued_mock" | "blocked_needs_approval" | "failed_recoverable" | "analytics_pending";
  queueJobId: string;
  scheduledAt: string;
  retryPolicy: {
    enabled: true;
    maxAttempts: number;
    backoffMs: number;
    escalationAfterAttempts: number;
  };
  recoverySteps: string[];
  logs: string[];
};

export type AnalyticsIngestionPlan = {
  metrics: Array<"views" | "ctr" | "retention" | "engagement" | "followers" | "watch_time">;
  status: PlatformOpsStatusLabel;
  source: "manual_import" | "future_platform_api";
  notes: string[];
};

export type MonetizationMonitor = {
  status: PlatformOpsStatusLabel;
  copyrightIncidents: "manual_review_required";
  platformWarnings: "manual_review_required";
  strikeMonitoring: "not_connected";
  policyMonitoring: "mock_watchlist";
};

export type PlatformOperationResult = {
  runId: string;
  workflowKind: PlatformOpsWorkflowKind;
  status: "waiting_for_approval" | "completed_mock" | "blocked";
  mode: "dry_run";
  platforms: PlatformOpsPlatform[];
  providerStatus: PlatformOpsProviderStatus;
  adaptations: PlatformAdaptation[];
  deployments: DeploymentPlan[];
  analyticsPlan: AnalyticsIngestionPlan;
  monetizationMonitor: MonetizationMonitor;
  recommendations: string[];
  risks: string[];
  approvalCheckpoint: {
    id: string;
    status: "pending" | "not_required";
    reason: string;
    riskLevel: "low" | "medium" | "high";
  };
  queueJobIds: string[];
  eventId?: string;
  persisted: boolean;
  createdAt: string;
};

export type PlatformOpsDashboard = {
  platforms: PlatformProfile[];
  workflows: PublishingWorkflowDefinition[];
  providers: PlatformOpsProviderStatus[];
  recentDeployments: DeploymentPlan[];
  failedDeployments: DeploymentPlan[];
  analyticsPlans: AnalyticsIngestionPlan[];
  monetization: MonetizationMonitor;
  observability: {
    mode: "mock_safe";
    publicPublishing: "blocked";
    accountAutomation: "blocked";
    scraping: "blocked";
    credentials: "not_connected";
  };
};
