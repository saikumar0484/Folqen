import { getDb } from "@/lib/db";
import { defaultOpenAiModel, normalizeModelId } from "@/lib/ai-models";

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
  openAiModel: string;
  customOpenAiModel: string;
  storageProvider: "google_drive";
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
  openAiModel: defaultOpenAiModel,
  customOpenAiModel: "",
  storageProvider: "google_drive",
};

function isSettingsRecord(value: unknown): value is Partial<FolqenSettings> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export async function getFolqenSettings() {
  const [safety, profile, providerPreferences] = await Promise.all([
    getDb().setting.findUnique({ where: { key: "safety.defaults" } }),
    getDb().setting.findUnique({ where: { key: "brand.profile" } }),
    getDb().setting.findUnique({ where: { key: "provider.preferences" } }),
  ]);

  const merged = {
    ...defaultFolqenSettings,
    ...(isSettingsRecord(profile?.value) ? profile.value : {}),
    ...(isSettingsRecord(safety?.value) ? safety.value : {}),
    ...(isSettingsRecord(providerPreferences?.value) ? providerPreferences.value : {}),
  };

  return {
    ...merged,
    openAiModel: normalizeModelId(typeof merged.customOpenAiModel === "string" && merged.customOpenAiModel ? merged.customOpenAiModel : merged.openAiModel),
  };
}
