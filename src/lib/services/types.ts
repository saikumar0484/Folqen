export type ServiceStatus = "not_connected" | "mock" | "configured" | "live" | "failed" | "disabled";

export type ServiceResult<T> = {
  ok: boolean;
  status: ServiceStatus;
  message: string;
  data?: T;
};

export type AgentService = {
  createMessage(input: { userId?: string; content: string; pageContext?: string }): Promise<ServiceResult<{ reply: string }>>;
  runCommand(command: string): Promise<ServiceResult<{ queued: boolean }>>;
};

export type WorkflowService = {
  testConnection(): Promise<ServiceResult<{ provider: string }>>;
  triggerWorkflow(input: { workflowId: string; payload: unknown }): Promise<ServiceResult<{ runId?: string }>>;
};

export type RenderService = {
  renderDraft(input: { contentId: string; format: string }): Promise<ServiceResult<{ outputPath?: string }>>;
};

export type PublishingService = {
  createPostingPackage(input: { contentId: string; platform: string }): Promise<ServiceResult<{ packageId: string; mode: "manual" }>>;
  publishPublicly(input: { contentId: string; platform: string; approvalId?: string }): Promise<ServiceResult<never>>;
};

export type AnalyticsService = {
  readMetrics(input: { platform?: string; period: string }): Promise<ServiceResult<Array<{ metric: string; value: number }>>>;
};

export type StorageService = {
  validateUpload(input: { name: string; mimeType: string; sizeBytes: number }): Promise<ServiceResult<{ sanitizedName: string }>>;
  storeUpload(input: { name: string; mimeType: string; sizeBytes: number }): Promise<ServiceResult<{ fileId?: string }>>;
};

export type NotificationService = {
  notify(input: { title: string; body: string; userId?: string }): Promise<ServiceResult<{ delivered: boolean }>>;
};

export type FolqenServices = {
  agent: AgentService;
  workflow: WorkflowService;
  render: RenderService;
  publishing: PublishingService;
  analytics: AnalyticsService;
  storage: StorageService;
  notifications: NotificationService;
};
