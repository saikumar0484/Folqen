import { TaskStatus } from "@prisma/client";
import { getDb } from "@/lib/db";

function progressForStatus(status: TaskStatus) {
  if (status === "COMPLETED") return 100;
  if (status === "RUNNING") return 68;
  if (status === "PAUSED") return 42;
  if (status === "FAILED") return 18;
  if (status === "CANCELED") return 0;
  return 12;
}

function statusTone(status: TaskStatus) {
  if (status === "COMPLETED") return "safe" as const;
  if (status === "FAILED" || status === "CANCELED") return "danger" as const;
  if (status === "PAUSED") return "warning" as const;
  return "premium" as const;
}

function formatDate(date: Date) {
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function getPipelineData() {
  const [tasks, workflowRuns, approvals, errors] = await Promise.all([
    getDb().agentTask.findMany({
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      include: {
        content: {
          select: {
            id: true,
            title: true,
            format: true,
            status: true,
            reviewStatus: true,
            safetyStatus: true,
            copyrightStatus: true,
            platformTargets: true,
          },
        },
      },
      take: 25,
    }),
    getDb().workflowRun.findMany({
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
    getDb().approval.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, riskLevel: true, contentId: true },
      take: 8,
    }),
    getDb().errorLog.findMany({
      where: { resolved: false },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const running = tasks.filter((task) => task.status === "RUNNING" || task.status === "QUEUED").length;
  const failed = tasks.filter((task) => task.status === "FAILED").length + errors.length;
  const blockedForApproval = approvals.length;

  return {
    stats: [
      { label: "Running jobs", value: String(running), hint: "Queued or active AgentTask rows", tone: "premium" as const },
      { label: "Blocked gates", value: String(blockedForApproval), hint: "Pending human approvals", tone: blockedForApproval > 0 ? ("warning" as const) : ("safe" as const) },
      { label: "Failures", value: String(failed), hint: "Failed tasks and unresolved errors", tone: failed > 0 ? ("warning" as const) : ("safe" as const) },
    ],
    tasks: tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description ?? "No task description has been added yet.",
      status: task.status,
      statusTone: statusTone(task.status),
      riskLevel: task.riskLevel,
      progress: progressForStatus(task.status),
      updatedAt: formatDate(task.updatedAt),
      contentTitle: task.content?.title ?? "No linked content item",
      contentFormat: task.content?.format ?? "unassigned",
      contentStatus: task.content?.status ?? null,
      reviewStatus: task.content?.reviewStatus ?? null,
      safetyStatus: task.content?.safetyStatus ?? null,
      copyrightStatus: task.content?.copyrightStatus ?? null,
      platformTargets: task.content?.platformTargets ?? [],
    })),
    workflowRuns: workflowRuns.map((run) => ({
      id: run.id,
      workflowId: run.workflowId,
      providerId: run.providerId ?? "Not connected",
      status: run.status,
      statusTone: statusTone(run.status),
      updatedAt: formatDate(run.updatedAt),
      logs: run.logs ?? "No workflow logs yet. n8n remains Not connected until webhook secrets are configured.",
    })),
    approvals: approvals.map((approval) => ({
      id: approval.id,
      title: approval.title,
      riskLevel: approval.riskLevel,
      contentId: approval.contentId,
    })),
    errors: errors.map((error) => ({
      id: error.id,
      source: error.source,
      message: error.message,
      severity: error.severity,
      createdAt: formatDate(error.createdAt),
    })),
  };
}
