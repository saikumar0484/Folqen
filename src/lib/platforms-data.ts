import { ConnectionStatus, PlatformName } from "@prisma/client";
import { getDb } from "@/lib/db";

const primaryPlatforms = new Set<PlatformName>([
  PlatformName.YOUTUBE,
  PlatformName.INSTAGRAM,
  PlatformName.FACEBOOK,
  PlatformName.SNAPCHAT,
  PlatformName.THREADS,
]);

function formatPlatformName(name: PlatformName) {
  return name.charAt(0) + name.slice(1).toLowerCase();
}

function statusTone(status: ConnectionStatus) {
  if (status === "LIVE" || status === "CONFIGURED") return "safe" as const;
  if (status === "FAILED" || status === "NEEDS_ATTENTION") return "danger" as const;
  if (status === "TESTING") return "premium" as const;
  return "warning" as const;
}

function authLabel(authMethod: string | null) {
  if (!authMethod) return "No auth configured";
  return authMethod.replaceAll("_", " ");
}

export async function getPlatformsData() {
  const platforms = await getDb().platformConnection.findMany({
    orderBy: { platform: "asc" },
  });

  const connected = platforms.filter((platform) => platform.status === "LIVE" || platform.status === "CONFIGURED").length;
  const primary = platforms.filter((platform) => primaryPlatforms.has(platform.platform)).length;
  const manualFallback = platforms.filter((platform) => platform.status === "NOT_CONNECTED").length;

  return {
    stats: [
      { label: "Platforms", value: String(platforms.length), hint: "India-first platform set", tone: "premium" as const },
      { label: "Connected", value: String(connected), hint: "Live/configured only", tone: connected > 0 ? ("safe" as const) : ("warning" as const) },
      { label: "Manual fallback", value: String(manualFallback), hint: "Posting packages required", tone: "safe" as const },
    ],
    primaryCount: primary,
    platforms: platforms.map((platform) => ({
      id: platform.id,
      name: platform.platform,
      label: formatPlatformName(platform.platform),
      tier: primaryPlatforms.has(platform.platform) ? "Primary" : "Secondary",
      status: platform.status,
      statusTone: statusTone(platform.status),
      authMethod: authLabel(platform.authMethod),
      updatedAt: platform.updatedAt.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    })),
  };
}
