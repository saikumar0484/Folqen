import type { Prisma } from "@prisma/client";
import { getDb } from "@/lib/db";

function formatDate(date: Date) {
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function hasManualPostingPackage(metadata: Prisma.JsonValue | null) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return false;
  return metadata.packageMode === "manual_posting_package";
}

function formatBytes(value: number | null) {
  if (!value) return "Unknown size";
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export async function getLibraryData() {
  const [contentItems, assets, uploadedFiles, renders] = await Promise.all([
    getDb().contentItem.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: {
            tasks: true,
            assets: true,
            renders: true,
            approvals: true,
          },
        },
      },
      take: 30,
    }),
    getDb().asset.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        content: { select: { title: true, status: true } },
      },
      take: 24,
    }),
    getDb().uploadedFile.findMany({
      orderBy: { updatedAt: "desc" },
      take: 24,
    }),
    getDb().render.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        content: { select: { title: true } },
      },
      take: 12,
    }),
  ]);

  const packageCount = contentItems.filter((item) => hasManualPostingPackage(item.metadata)).length;
  const assetCount = assets.length + uploadedFiles.length;
  const readyForReview = contentItems.filter((item) => item.status === "REVIEW" || item.status === "APPROVED").length;

  return {
    stats: [
      { label: "Content items", value: String(contentItems.length), hint: "Supabase ContentItem rows", tone: "premium" as const },
      { label: "Assets/files", value: String(assetCount), hint: "Asset and UploadedFile rows", tone: assetCount > 0 ? ("premium" as const) : ("neutral" as const) },
      { label: "Review-ready", value: String(readyForReview), hint: "Review or approved status", tone: readyForReview > 0 ? ("warning" as const) : ("safe" as const) },
    ],
    contentItems: contentItems.map((item) => ({
      id: item.id,
      title: item.title,
      format: item.format,
      status: item.status,
      reviewStatus: item.reviewStatus,
      safetyStatus: item.safetyStatus,
      copyrightStatus: item.copyrightStatus,
      platformTargets: item.platformTargets,
      updatedAt: formatDate(item.updatedAt),
      hasManualPackage: hasManualPostingPackage(item.metadata),
      counts: item._count,
    })),
    assets: assets.map((asset) => ({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      path: asset.path,
      mimeType: asset.mimeType ?? "unknown",
      size: formatBytes(asset.sizeBytes ?? null),
      contentTitle: asset.content?.title ?? "Unlinked",
      createdAt: formatDate(asset.createdAt),
    })),
    uploadedFiles: uploadedFiles.map((file) => ({
      id: file.id,
      name: file.name,
      path: file.path,
      mimeType: file.mimeType,
      privacy: file.privacy,
      size: formatBytes(file.sizeBytes),
      tags: file.tags,
      updatedAt: formatDate(file.updatedAt),
    })),
    renders: renders.map((render) => ({
      id: render.id,
      status: render.status,
      providerId: render.providerId ?? "Not connected",
      outputPath: render.outputPath ?? "No output yet",
      contentTitle: render.content?.title ?? "Unlinked render",
      updatedAt: formatDate(render.updatedAt),
    })),
    postingPackages: {
      count: packageCount,
      note:
        packageCount > 0
          ? "Manual package mode is available for content items while platform APIs remain Not connected."
          : "No manual posting packages exist yet.",
    },
  };
}
