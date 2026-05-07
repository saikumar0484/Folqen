import type { ContentStatus } from "@prisma/client";
import { getDb } from "@/lib/db";
import { getAllowedUploadTypes } from "@/lib/files/validation";
import { getFolqenSettings } from "@/lib/settings";

function formatDate(date: Date) {
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusTone(status: ContentStatus | string) {
  if (status === "APPROVED" || status === "PUBLISHED") return "safe" as const;
  if (status === "BLOCKED" || status === "ARCHIVED") return "danger" as const;
  if (status === "REVIEW" || status === "SCHEDULED") return "warning" as const;
  return "neutral" as const;
}

function formatBytes(value: number) {
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export async function getCalendarData() {
  const [items, approvals] = await Promise.all([
    getDb().contentItem.findMany({ orderBy: { updatedAt: "desc" }, take: 40 }),
    getDb().approval.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  const scheduled = items.filter((item) => item.status === "SCHEDULED").length;

  return {
    stats: [
      { label: "Content slots", value: String(items.length), hint: "ContentItem records", tone: "premium" as const },
      { label: "Scheduled", value: String(scheduled), hint: "Scheduled status only", tone: scheduled > 0 ? ("safe" as const) : ("neutral" as const) },
      { label: "Approval blocks", value: String(approvals.length), hint: "Pending approval rows", tone: approvals.length > 0 ? ("warning" as const) : ("safe" as const) },
    ],
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      format: item.format,
      status: item.status,
      statusTone: statusTone(item.status),
      targets: item.platformTargets,
      updatedAt: formatDate(item.updatedAt),
    })),
    approvals: approvals.map((approval) => ({
      id: approval.id,
      title: approval.title,
      riskLevel: approval.riskLevel,
      createdAt: formatDate(approval.createdAt),
    })),
  };
}

export async function getMonetizationData() {
  const [analytics, contentCount, platformCount] = await Promise.all([
    getDb().analyticsRecord.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    getDb().contentItem.count(),
    getDb().platformConnection.count({ where: { status: { in: ["CONFIGURED", "LIVE"] } } }),
  ]);

  return {
    stats: [
      { label: "Content library", value: String(contentCount), hint: "Total content records", tone: "premium" as const },
      { label: "Connected platforms", value: String(platformCount), hint: "Needed for revenue reads", tone: platformCount > 0 ? ("safe" as const) : ("warning" as const) },
      { label: "Payment access", value: "Off", hint: "Human approval required", tone: "safe" as const },
    ],
    analytics: analytics.map((record) => ({
      id: record.id,
      metric: record.metric,
      value: record.value,
      period: record.period,
      platform: record.platform ?? "ALL",
      createdAt: formatDate(record.createdAt),
    })),
  };
}

export async function getBrandData() {
  const [settings, contentItems] = await Promise.all([
    getFolqenSettings(),
    getDb().contentItem.findMany({ orderBy: { updatedAt: "desc" }, take: 12 }),
  ]);

  return {
    stats: [
      { label: "Country", value: "India", hint: "TikTok skipped", tone: "safe" as const },
      { label: "Autonomy", value: "High", hint: "Approval gates active", tone: "premium" as const },
      { label: "Public publish", value: settings.allowPublicPublish ? "On" : "Off", hint: "Safety setting", tone: settings.allowPublicPublish ? ("warning" as const) : ("safe" as const) },
    ],
    settings,
    contentItems: contentItems.map((item) => ({
      id: item.id,
      title: item.title,
      format: item.format,
      status: item.status,
      statusTone: statusTone(item.status),
      targets: item.platformTargets,
    })),
  };
}

export async function getFilesData() {
  const [files, assets] = await Promise.all([
    getDb().uploadedFile.findMany({ orderBy: { updatedAt: "desc" }, take: 40 }),
    getDb().asset.findMany({ orderBy: { createdAt: "desc" }, include: { content: { select: { title: true } } }, take: 40 }),
  ]);

  const fileBytes = files.reduce((sum, file) => sum + file.sizeBytes, 0);
  const assetBytes = assets.reduce((sum, asset) => sum + (asset.sizeBytes ?? 0), 0);

  return {
    stats: [
      { label: "Uploaded files", value: String(files.length), hint: "UploadedFile rows", tone: files.length > 0 ? ("premium" as const) : ("neutral" as const) },
      { label: "Generated assets", value: String(assets.length), hint: "Asset rows", tone: assets.length > 0 ? ("premium" as const) : ("neutral" as const) },
      { label: "Tracked size", value: formatBytes(fileBytes + assetBytes), hint: "Database metadata only", tone: "safe" as const },
    ],
    files: files.map((file) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: formatBytes(file.sizeBytes),
      privacy: file.privacy,
      tags: file.tags,
      updatedAt: formatDate(file.updatedAt),
    })),
    assets: assets.map((asset) => ({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      mimeType: asset.mimeType ?? "unknown",
      size: asset.sizeBytes ? formatBytes(asset.sizeBytes) : "Unknown size",
      contentTitle: asset.content?.title ?? "Unlinked",
      createdAt: formatDate(asset.createdAt),
    })),
    accept: getAllowedUploadTypes().flatMap((type) => [type.mimeType, ...type.extensions]).join(","),
  };
}
