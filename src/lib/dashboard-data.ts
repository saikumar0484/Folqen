import { ConnectionStatus, TaskStatus } from "@prisma/client";
import { getDb } from "@/lib/db";
import { buildLaunchReadiness } from "@/lib/launch-readiness";
import { getProviderConfig } from "@/lib/provider-config";
import { getFolqenSettings } from "@/lib/settings";

function progressForStatus(status: TaskStatus) {
  if (status === "COMPLETED") return "100%";
  if (status === "RUNNING") return "68%";
  if (status === "PAUSED") return "42%";
  if (status === "FAILED") return "18%";
  return "12%";
}

export async function getDashboardData() {
  const [activeJobCount, pendingApprovalCount, connectedPlatformCount, jobs, approvals, platforms, tools, activity, settings] = await Promise.all([
    getDb().agentTask.count({
      where: { status: { in: ["QUEUED", "RUNNING", "PAUSED"] } },
    }),
    getDb().approval.count({ where: { status: "PENDING" } }),
    getDb().platformConnection.count({
      where: { status: { in: [ConnectionStatus.CONFIGURED, ConnectionStatus.LIVE] } },
    }),
    getDb().agentTask.findMany({
      orderBy: { updatedAt: "desc" },
      take: 4,
      include: { content: { select: { title: true, status: true } } },
    }),
    getDb().approval.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    getDb().platformConnection.findMany({
      orderBy: { platform: "asc" },
      take: 5,
    }),
    getDb().toolLimit.findMany({
      orderBy: { updatedAt: "desc" },
      take: 4,
    }),
    getDb().auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { actor: { select: { email: true } } },
    }),
    getFolqenSettings(),
  ]);
  const launchReadiness = buildLaunchReadiness(getProviderConfig(settings.openAiModel));

  return {
    stats: [
      { label: "Active jobs", value: String(activeJobCount), hint: "From Supabase AgentTask", tone: "premium" as const },
      { label: "Pending approvals", value: String(pendingApprovalCount), hint: "Human decisions waiting", tone: pendingApprovalCount > 0 ? ("warning" as const) : ("safe" as const) },
      { label: "Connected platforms", value: String(connectedPlatformCount), hint: "Live/configured only", tone: "safe" as const },
    ],
    jobs: jobs.map((job) => ({
      id: job.id,
      title: job.content?.title ?? job.title,
      stage: job.title,
      progress: progressForStatus(job.status),
      status: job.status,
      detail: job.description ?? "No description added yet.",
      contentStatus: job.content?.status ?? null,
    })),
    approvals: approvals.map((approval) => ({
      id: approval.id,
      title: approval.title,
      type: approval.type,
      riskLevel: approval.riskLevel,
    })),
    platforms: platforms.map((platform) => ({
      id: platform.id,
      name: platform.platform,
      status: platform.status,
    })),
    tools: tools.map((tool) => ({
      id: tool.id,
      name: tool.label,
      note: tool.limitValue ? `${tool.usedValue}/${tool.limitValue} used` : `${tool.usedValue} used, no limit set`,
      type: tool.toolType,
    })),
    activity: activity.map((event) => ({
      id: event.id,
      time: event.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" }),
      title: event.action,
      actor: event.actor?.email ?? "system",
    })),
    launchReadiness,
  };
}
