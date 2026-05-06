import { getDb } from "@/lib/db";

export type FolqenSettings = {
  brandName: string;
  country: string;
  timezone: string;
  autonomyLevel: "manual" | "assisted" | "draft_automation" | "high_automation" | "approval_99";
  allowPublicPublish: boolean;
  requireHumanApproval: boolean;
  allowPaidTools: boolean;
  allowBrowserAutomation: boolean;
  defaultUploadPrivacy: "private" | "unlisted";
};

export const defaultFolqenSettings: FolqenSettings = {
  brandName: "Folqen",
  country: "India",
  timezone: "Asia/Kolkata",
  autonomyLevel: "high_automation",
  allowPublicPublish: false,
  requireHumanApproval: true,
  allowPaidTools: false,
  allowBrowserAutomation: false,
  defaultUploadPrivacy: "private",
};

function isSettingsRecord(value: unknown): value is Partial<FolqenSettings> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export async function getFolqenSettings() {
  const [safety, profile] = await Promise.all([
    getDb().setting.findUnique({ where: { key: "safety.defaults" } }),
    getDb().setting.findUnique({ where: { key: "brand.profile" } }),
  ]);

  return {
    ...defaultFolqenSettings,
    ...(isSettingsRecord(profile?.value) ? profile.value : {}),
    ...(isSettingsRecord(safety?.value) ? safety.value : {}),
  };
}
