import type { ContentItem, PlatformName } from "@prisma/client";

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
