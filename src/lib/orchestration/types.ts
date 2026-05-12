export type AgentLayer =
  | "executive"
  | "department_manager"
  | "team_lead"
  | "worker"
  | "utility"
  | "error_recovery"
  | "optimization";

export type DepartmentId =
  | "research"
  | "content"
  | "platform_operations"
  | "analytics"
  | "optimization"
  | "infrastructure"
  | "error_recovery"
  | "organizational_memory";

export type AgentStatus = "active" | "idle" | "paused" | "degraded" | "offline";

export type TaskStatus =
  | "queued"
  | "assigned"
  | "running"
  | "waiting_for_approval"
  | "retrying"
  | "escalated"
  | "completed"
  | "failed"
  | "blocked";

export type EventSeverity = "info" | "warning" | "error" | "critical";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type OrchestrationPriority = "low" | "normal" | "high" | "urgent";

export type Permission =
  | "research.read"
  | "research.write"
  | "content.draft"
  | "content.review"
  | "platform.package"
  | "platform.publish.request"
  | "analytics.read"
  | "optimization.propose"
  | "infrastructure.read"
  | "infrastructure.operate"
  | "memory.read"
  | "memory.write"
  | "incident.report"
  | "incident.recover"
  | "approval.request";

export type CommunicationChannel =
  | "executive-briefing"
  | "department-ops"
  | "workflow-events"
  | "incident-response"
  | "memory-reflection"
  | "approval-gate";

export interface AgentKpi {
  name: string;
  value: number;
  unit: "%" | "score" | "count" | "ms" | "ratio";
  target: number;
  trend: "up" | "down" | "flat";
}

export interface AgentWorkload {
  queuedTasks: number;
  activeTasks: number;
  capacity: number;
}

export interface AgentDefinition {
  id: string;
  name: string;
  layer: AgentLayer;
  role: string;
  goals: string[];
  memorySummary: string;
  tools: string[];
  permissions: Permission[];
  kpis: AgentKpi[];
  departmentId: DepartmentId;
  status: AgentStatus;
  currentState: string;
  taskExecutionState: TaskStatus;
  workload: AgentWorkload;
  communicationChannels: CommunicationChannel[];
  managerAgentId?: string;
}

export interface DepartmentDefinition {
  id: DepartmentId;
  name: string;
  mission: string;
  managerAgentId: string;
  channels: CommunicationChannel[];
  escalationAgentId: string;
}

export interface OrchestrationEvent {
  id: string;
  type: string;
  severity: EventSeverity;
  source: string;
  departmentId?: DepartmentId;
  agentId?: string;
  taskId?: string;
  workflowRunId?: string;
  correlationId: string;
  message: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface OrchestrationTaskInput {
  title: string;
  description: string;
  departmentId: DepartmentId;
  priority?: OrchestrationPriority;
  riskLevel?: RiskLevel;
  approvalRequired?: boolean;
  dependencies?: string[];
  metadata?: Record<string, unknown>;
}

export interface OrchestrationTask extends Required<Omit<OrchestrationTaskInput, "metadata">> {
  id: string;
  status: TaskStatus;
  assignedAgentId: string;
  assignedAgentName: string;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
  queueJobId?: string;
  correlationId: string;
}

export interface WorkflowRunInput {
  name: string;
  objective: string;
  departmentId: DepartmentId;
  priority?: OrchestrationPriority;
  approvalRequired?: boolean;
  steps?: string[];
  metadata?: Record<string, unknown>;
}

export interface ApprovalCheckpoint {
  id: string;
  reason: string;
  riskLevel: RiskLevel;
  requiredRole: "owner" | "admin" | "editor";
  status: "pending" | "approved" | "rejected" | "not_required";
}

export interface WorkflowRunPlan {
  id: string;
  name: string;
  objective: string;
  departmentId: DepartmentId;
  status: TaskStatus;
  assignedAgents: string[];
  steps: string[];
  approvalCheckpoint: ApprovalCheckpoint;
  correlationId: string;
  graphTrace: string[];
  crewPlan: string[];
  queueJobId?: string;
  createdAt: string;
}

export interface IncidentReportInput {
  title: string;
  summary: string;
  severity: EventSeverity;
  departmentId?: DepartmentId;
  agentId?: string;
  workflowRunId?: string;
  taskId?: string;
  metadata?: Record<string, unknown>;
}

export interface IncidentReport {
  id: string;
  status: "open" | "triaged" | "recovering" | "resolved";
  recoveryPlan: string[];
  escalationRequired: boolean;
  createdAt: string;
  input: IncidentReportInput;
}

export type QueueMode = "mock" | "live";

export interface QueueEnqueueResult {
  mode: QueueMode;
  queueName: string;
  jobId: string;
  status: "queued" | "mocked";
}
