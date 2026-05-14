import type { ContentItem, PlatformName } from "@prisma/client";

export type ManualPostingPackage = ReturnType<typeof generateManualPostingPackage>;

function platformLabel(platform: PlatformName) {
  return platform.charAt(0) + platform.slice(1).toLowerCase();
}

function hashtagsFor(content: Pick<ContentItem, "title" | "format">, platform: PlatformName) {
  const base = ["#Folqen", "#UrbanLegends", "#Mystery", "#Folklore"];
  const india = content.title.toLowerCase().includes("india") || content.title.toLowerCase().includes("bhangarh") ? ["#IndiaMystery", "#IndianFolklore"] : [];
  const platformTags = platform === "YOUTUBE" ? ["#Shorts"] : platform === "INSTAGRAM" ? ["#Reels"] : [];

  return Array.from(new Set([...base, ...india, ...platformTags]));
}

export function generateManualPostingPackage(content: Pick<ContentItem, "id" | "title" | "format" | "status" | "reviewStatus" | "safetyStatus" | "copyrightStatus">, platform: PlatformName) {
  const label = platformLabel(platform);
  const hashtags = hashtagsFor(content, platform);
  const title = `${content.title} | Folqen Mystery`;
  const caption = `A mystery-style folklore package for ${label}. Folklore is presented as legend, not verified fact.`;

  return {
    packageId: `manual-${platform.toLowerCase()}-${content.id}`,
    mode: "manual" as const,
    platform,
    platformLabel: label,
    title,
    caption,
    description: `${content.title}\n\nPrepared by Folqen for manual posting. Review all claims, captions, visuals, music rights, and platform rules before publishing.`,
    hashtags,
    checklist: [
      "Human approval required before public posting.",
      "Confirm safety review is passed.",
      "Confirm copyright status is clear.",
      "Confirm platform account is the correct account.",
      "Upload manually because platform API is Not connected.",
    ],
    safety: {
      contentStatus: content.status,
      reviewStatus: content.reviewStatus,
      safetyStatus: content.safetyStatus,
      copyrightStatus: content.copyrightStatus,
      publicPublishing: "blocked_by_default",
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function isManualPostingPackage(value: unknown): value is ManualPostingPackage {
  if (!isRecord(value)) return false;

  const safety = value.safety;

  return (
    value.mode === "manual" &&
    typeof value.packageId === "string" &&
    typeof value.platform === "string" &&
    typeof value.platformLabel === "string" &&
    typeof value.title === "string" &&
    typeof value.caption === "string" &&
    typeof value.description === "string" &&
    Array.isArray(value.hashtags) &&
    value.hashtags.every((tag) => typeof tag === "string") &&
    Array.isArray(value.checklist) &&
    value.checklist.every((item) => typeof item === "string") &&
    isRecord(safety) &&
    safety.publicPublishing === "blocked_by_default"
  );
}

function safeFilePart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function createPostingPackageDownload(packageData: ManualPostingPackage) {
  const filename = `${safeFilePart(packageData.platformLabel)}-${safeFilePart(packageData.title)}.json`;

  return {
    filename,
    body: JSON.stringify(
      {
        ...packageData,
        folqenNotice: "Manual posting package only. This file does not publish or connect to any platform.",
        generatedFor: "human_review_before_public_posting",
      },
      null,
      2,
    ),
  };
}
