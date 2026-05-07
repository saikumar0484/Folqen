import type { PlatformName, RiskLevel, TaskStatus, UpgradeStatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db";
import { getIntegrationStatus } from "@/lib/integrations/status";

function formatDate(date: Date) {
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function riskTone(level: RiskLevel) {
  if (level === "HIGH" || level === "CRITICAL") return "danger" as const;
  if (level === "MEDIUM") return "warning" as const;
  return "safe" as const;
}

function taskTone(status: TaskStatus) {
  if (status === "COMPLETED") return "safe" as const;
  if (status === "FAILED" || status === "CANCELED") return "danger" as const;
  if (status === "PAUSED") return "warning" as const;
  return "premium" as const;
}

function upgradeTone(status: UpgradeStatus) {
  if (status === "APPROVED" || status === "IMPLEMENTED") return "safe" as const;
  if (status === "REJECTED" || status === "ROLLED_BACK") return "danger" as const;
  if (status === "NEEDS_HUMAN_REVIEW" || status === "TESTING") return "warning" as const;
  return "premium" as const;
}

function formatPlatform(platform: PlatformName | null) {
  if (!platform) return "All platforms";
  return platform.charAt(0) + platform.slice(1).toLowerCase();
}

export async function getNotificationsData() {
  const user = await getCurrentUser();
  const notifications = await getDb().notification.findMany({
    where: user ? { OR: [{ userId: user.id }, { userId: null }] } : undefined,
    orderBy: [{ read: "asc" }, { createdAt: "desc" }],
    take: 60,
  });

  const unread = notifications.filter((item) => !item.read).length;
  const critical = notifications.filter((item) => item.riskLevel === "HIGH" || item.riskLevel === "CRITICAL").length;

  return {
    stats: [
      { label: "Notifications", value: String(notifications.length), hint: "Visible database records", tone: "premium" as const },
      { label: "Unread", value: String(unread), hint: "Read state from Supabase", tone: unread > 0 ? ("warning" as const) : ("safe" as const) },
      { label: "Critical", value: String(critical), hint: "High or critical risk", tone: critical > 0 ? ("warning" as const) : ("safe" as const) },
    ],
    notifications: notifications.map((item) => ({
      id: item.id,
      title: item.title,
      body: item.body,
      read: item.read,
      riskLevel: item.riskLevel,
      riskTone: riskTone(item.riskLevel),
      createdAt: formatDate(item.createdAt),
    })),
  };
}

export async function getAnalyticsData() {
  const records = await getDb().analyticsRecord.findMany({
    orderBy: { createdAt: "desc" },
    take: 80,
  });

  const totalValue = records.reduce((sum, record) => sum + record.value, 0);
  const connectedPlatforms = await getDb().platformConnection.count({ where: { status: { in: ["CONFIGURED", "LIVE"] } } });

  return {
    stats: [
      { label: "Records", value: String(records.length), hint: "AnalyticsRecord rows", tone: "premium" as const },
      { label: "Total value", value: String(Math.round(totalValue)), hint: "Sum of visible metrics", tone: "neutral" as const },
      { label: "Live platforms", value: String(connectedPlatforms), hint: "Analytics APIs connected", tone: connectedPlatforms > 0 ? ("safe" as const) : ("warning" as const) },
    ],
    records: records.map((record) => ({
      id: record.id,
      metric: record.metric,
      value: record.value,
      period: record.period,
      platform: formatPlatform(record.platform),
      createdAt: formatDate(record.createdAt),
    })),
  };
}

export async function getErrorsData() {
  const errors = await getDb().errorLog.findMany({
    orderBy: [{ resolved: "asc" }, { createdAt: "desc" }],
    take: 80,
  });

  const open = errors.filter((error) => !error.resolved).length;
  const highRisk = errors.filter((error) => error.severity === "HIGH" || error.severity === "CRITICAL").length;

  return {
    stats: [
      { label: "Errors", value: String(errors.length), hint: "ErrorLog rows", tone: "premium" as const },
      { label: "Open", value: String(open), hint: "Unresolved issues", tone: open > 0 ? ("warning" as const) : ("safe" as const) },
      { label: "High risk", value: String(highRisk), hint: "High/critical severity", tone: highRisk > 0 ? ("warning" as const) : ("safe" as const) },
    ],
    errors: errors.map((error) => ({
      id: error.id,
      source: error.source,
      message: error.message,
      severity: error.severity,
      severityTone: riskTone(error.severity),
      resolved: error.resolved,
      createdAt: formatDate(error.createdAt),
      updatedAt: formatDate(error.updatedAt),
    })),
  };
}

export async function getWorkflowsData() {
  const [runs, providers, integrationStatus] = await Promise.all([
    getDb().workflowRun.findMany({ orderBy: { updatedAt: "desc" }, take: 60 }),
    getDb().providerRegistryItem.findMany({ where: { type: "WORKFLOW" }, orderBy: { name: "asc" } }),
    getIntegrationStatus(),
  ]);

  const active = runs.filter((run) => run.status === "QUEUED" || run.status === "RUNNING").length;

  return {
    stats: [
      { label: "Workflow runs", value: String(runs.length), hint: "WorkflowRun rows", tone: "premium" as const },
      { label: "Active", value: String(active), hint: "Queued or running", tone: active > 0 ? ("premium" as const) : ("neutral" as const) },
      { label: "n8n webhook", value: integrationStatus.worker.n8nWebhook === "configured" ? "On" : "Off", hint: "Runtime env status", tone: integrationStatus.worker.n8nWebhook === "configured" ? ("safe" as const) : ("warning" as const) },
    ],
    runs: runs.map((run) => ({
      id: run.id,
      workflowId: run.workflowId,
      providerId: run.providerId ?? "Not connected",
      status: run.status,
      statusTone: taskTone(run.status),
      logs: run.logs ?? "No logs recorded.",
      updatedAt: formatDate(run.updatedAt),
    })),
    providers: providers.map((provider) => ({
      id: provider.id,
      name: provider.name,
      status: provider.status,
      costModel: provider.costModel,
      commercialUse: provider.commercialUse,
    })),
    integrationStatus,
  };
}

export async function getUpgradesData() {
  const proposals = await getDb().upgradeProposal.findMany({
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: {
      findings: { orderBy: { createdAt: "desc" }, take: 3 },
      runs: { orderBy: { updatedAt: "desc" }, take: 3 },
    },
    take: 40,
  });

  const needsReview = proposals.filter((proposal) => proposal.status === "NEEDS_HUMAN_REVIEW").length;
  const approvalRequired = proposals.filter((proposal) => proposal.requiredApproval).length;

  return {
    stats: [
      { label: "Proposals", value: String(proposals.length), hint: "UpgradeProposal rows", tone: "premium" as const },
      { label: "Need review", value: String(needsReview), hint: "Human review required", tone: needsReview > 0 ? ("warning" as const) : ("safe" as const) },
      { label: "Approval gated", value: String(approvalRequired), hint: "Execution blocked", tone: "safe" as const },
    ],
    proposals: proposals.map((proposal) => ({
      id: proposal.id,
      title: proposal.title,
      summary: proposal.summary,
      category: proposal.category,
      status: proposal.status,
      statusTone: upgradeTone(proposal.status),
      riskScore: proposal.riskScore,
      costScore: proposal.costScore,
      benefitScore: proposal.benefitScore,
      testingPlan: proposal.testingPlan ?? "No testing plan recorded.",
      rollbackPlan: proposal.rollbackPlan ?? "No rollback plan recorded.",
      requiredApproval: proposal.requiredApproval,
      updatedAt: formatDate(proposal.updatedAt),
      findings: proposal.findings.map((finding) => ({
        id: finding.id,
        title: finding.title,
        summary: finding.summary,
        confidence: Math.round(finding.confidence * 100),
      })),
      runs: proposal.runs.map((run) => ({
        id: run.id,
        status: run.status,
        statusTone: upgradeTone(run.status),
        branchName: run.branchName ?? "No branch",
      })),
    })),
  };
}
