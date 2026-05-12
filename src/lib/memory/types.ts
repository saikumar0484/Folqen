export type MemoryCategory = "strategic" | "workflow" | "prompt" | "analytics" | "organizational";

export type MemoryStatusLabel = "Mock" | "Not connected" | "Needs approval" | "Configured" | "Blocked";

export type MemoryScope = "organization" | "department" | "agent" | "workflow" | "content" | "experiment";

export type ReflectionKind = "workflow_reflection" | "strategy_reflection" | "analytics_reflection" | "prompt_reflection" | "incident_reflection";

export type ExperimentKind = "ab_test" | "workflow_comparison" | "prompt_comparison" | "hook_comparison" | "metadata_comparison";

export type MemoryProviderStatus = {
  id: "mock" | "openai" | "gemini";
  label: string;
  status: MemoryStatusLabel;
  reason: string;
  liveEmbeddingsEnabled: false;
};

export type MemoryEntryInput = {
  category: MemoryCategory;
  title: string;
  summary: string;
  content: string;
  tags?: string[];
  scope?: MemoryScope;
  subjectType?: string;
  subjectId?: string;
  departmentId?: string;
  agentId?: string;
  importance?: number;
  confidence?: number;
  sourceType?: string;
  sourceId?: string;
  metadata?: Record<string, unknown>;
};

export type MemoryEntryView = Required<Pick<MemoryEntryInput, "category" | "title" | "summary" | "content" | "tags" | "scope" | "importance" | "confidence">> & {
  id: string;
  subjectType?: string;
  subjectId?: string;
  departmentId?: string;
  agentId?: string;
  sourceType: string;
  sourceId?: string;
  embeddingStatus: MemoryStatusLabel;
  retrievalScore?: number;
  createdAt: string;
};

export type MemoryIngestionResult = {
  memory: MemoryEntryView;
  queueJobId: string;
  eventId?: string;
  persisted: boolean;
  providerStatus: MemoryProviderStatus;
  semanticStatus: MemoryStatusLabel;
  message: string;
};

export type MemorySearchInput = {
  query: string;
  categories?: MemoryCategory[];
  departmentId?: string;
  agentId?: string;
  tags?: string[];
  limit?: number;
};

export type MemorySearchResult = {
  query: string;
  mode: "mock_semantic";
  providerStatus: MemoryProviderStatus;
  items: MemoryEntryView[];
  inspectedTags: string[];
  message: string;
};

export type ReflectionInput = {
  objective: string;
  reflectionKind?: ReflectionKind;
  workflowRunId?: string;
  memoryIds?: string[];
  categories?: MemoryCategory[];
  departmentId?: string;
};

export type ReflectionResult = {
  reflectionId: string;
  status: "completed" | "metadata_only";
  mode: "dry_run";
  qualityScore: number;
  bottlenecks: string[];
  recommendations: string[];
  strategyEvolution: string[];
  comparedMemoryIds: string[];
  queueJobId: string;
  memoryCaptureStatus: MemoryStatusLabel;
  providerStatus: MemoryProviderStatus;
  mutationStatus: "no_workflow_mutation";
  createdAt: string;
};

export type ExperimentVariant = {
  key: string;
  label: string;
  description: string;
  metrics?: Record<string, number>;
};

export type ExperimentInput = {
  experimentType: ExperimentKind;
  name: string;
  hypothesis: string;
  variants: ExperimentVariant[];
  memoryId?: string;
  metricFocus?: string;
};

export type ExperimentResult = {
  experimentId: string;
  status: "draft" | "analyzed";
  experimentType: ExperimentKind;
  winnerKey?: string;
  confidence: number;
  recommendation: string;
  persisted: boolean;
  queueJobId: string;
  mutationStatus: "no_automatic_rollout";
};

export type PromptVersionInput = {
  key: string;
  content: string;
  performanceScore?: number;
  optimizationNotes?: string;
  active?: boolean;
};

export type PromptVersionResult = {
  promptId?: string;
  key: string;
  version: number;
  status: "created" | "metadata_only";
  approvalStatus: MemoryStatusLabel;
  message: string;
};

export type MemoryDashboard = {
  categories: Array<{
    id: MemoryCategory;
    label: string;
    description: string;
    count: number;
    status: MemoryStatusLabel;
  }>;
  providerStatus: MemoryProviderStatus;
  semanticSearch: {
    status: MemoryStatusLabel;
    mode: "mock_semantic";
    pgvectorReady: boolean;
    liveEmbeddingsEnabled: false;
  };
  recentMemories: MemoryEntryView[];
  recentReflections: ReflectionResult[];
  experiments: ExperimentResult[];
  recommendations: string[];
};
