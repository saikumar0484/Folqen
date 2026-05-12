export type IntelligenceDepartmentId = "research" | "content";

export type IntelligenceAgentId =
  | "trend-research-agent"
  | "competitor-analysis-agent"
  | "viral-opportunity-agent"
  | "audience-insight-agent"
  | "platform-intelligence-agent"
  | "topic-selection-agent"
  | "hook-generation-agent"
  | "script-generation-agent"
  | "thumbnail-strategy-agent"
  | "caption-generation-agent"
  | "metadata-optimization-agent";

export type IntelligenceWorkflowKind =
  | "trend_discovery"
  | "competitor_analysis"
  | "viral_opportunity"
  | "topic_selection"
  | "hook_optimization"
  | "script_generation"
  | "thumbnail_planning"
  | "metadata_optimization";

export type IntelligenceOperationalStatus = "Mock" | "Not connected" | "Needs approval" | "Configured" | "Blocked";

export type IntelligenceProviderId = "mock" | "openrouter" | "gemini";

export type IntelligencePlatform = "YOUTUBE" | "INSTAGRAM" | "FACEBOOK" | "SNAPCHAT" | "THREADS" | "SUBSTACK" | "LINKEDIN" | "BLUESKY" | "LEMON8" | "KICK";

export interface IntelligenceAgentDefinition {
  id: IntelligenceAgentId;
  name: string;
  departmentId: IntelligenceDepartmentId;
  role: string;
  responsibilities: string[];
  tools: string[];
  status: IntelligenceOperationalStatus;
  autonomy: string;
}

export interface IntelligenceWorkflowDefinition {
  kind: IntelligenceWorkflowKind;
  name: string;
  departmentId: IntelligenceDepartmentId;
  ownerAgentIds: IntelligenceAgentId[];
  description: string;
  approvalReason: string;
}

export interface IntelligenceRunInput {
  workflowKind: IntelligenceWorkflowKind;
  objective: string;
  region?: string;
  brandContext?: string;
  platforms?: IntelligencePlatform[];
  seedTopics?: string[];
  competitors?: string[];
  audienceNotes?: string[];
  sourceReferences?: string[];
  approvalRequired?: boolean;
  providerId?: IntelligenceProviderId;
}

export interface RankedIntelligenceItem {
  id: string;
  title: string;
  score: number;
  rationale: string;
  platformFit: IntelligencePlatform[];
  risk: "low" | "medium" | "high";
}

export interface DraftArtifact {
  type: "topic" | "hook" | "script" | "thumbnail_plan" | "caption" | "metadata" | "research_summary";
  title: string;
  body: string;
  status: IntelligenceOperationalStatus;
}

export interface IntelligenceProviderStatus {
  id: IntelligenceProviderId;
  label: string;
  status: IntelligenceOperationalStatus;
  configured: boolean;
  paidToolGuard: "blocked" | "not_required";
  message: string;
}

export interface IntelligenceApprovalCheckpoint {
  id: string;
  status: "pending" | "not_required";
  reason: string;
  riskLevel: "low" | "medium" | "high";
}

export interface IntelligenceRunResult {
  runId: string;
  workflowKind: IntelligenceWorkflowKind;
  departmentId: IntelligenceDepartmentId;
  status: "completed" | "waiting_for_approval" | "blocked";
  assignedAgents: IntelligenceAgentId[];
  rankedItems: RankedIntelligenceItem[];
  recommendations: string[];
  draftArtifacts: DraftArtifact[];
  confidence: number;
  risks: string[];
  approvalCheckpoint: IntelligenceApprovalCheckpoint;
  providerStatus: IntelligenceProviderStatus;
  queueJobId: string;
  memoryCaptureStatus: "captured" | "not_connected";
  graphTrace: string[];
  createdAt: string;
}

export interface IntelligenceDepartmentSummary {
  id: IntelligenceDepartmentId;
  name: string;
  mission: string;
  agents: IntelligenceAgentDefinition[];
  workflows: IntelligenceWorkflowDefinition[];
  status: IntelligenceOperationalStatus;
}
