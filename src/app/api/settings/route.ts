import { NextResponse } from "next/server";
import { z } from "zod";
import { createAuditLog } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth/current-user";
import { canManageSystem } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { isKnownOpenAiModel, normalizeModelId } from "@/lib/ai-models";
import { getMutationSafetyError } from "@/lib/security/request-guards";
import { defaultFolqenSettings } from "@/lib/settings";

const settingsSchema = z.object({
  brandName: z.string().min(2).max(80),
  country: z.string().min(2).max(80),
  timezone: z.string().min(2).max(80),
  autonomyLevel: z.enum(["manual", "assisted", "draft_automation", "high_automation", "approval_99"]),
  defaultUploadPrivacy: z.enum(["private", "unlisted"]),
  openAiModel: z.string().min(2).max(120),
  customOpenAiModel: z.string().max(120).optional(),
  storageProvider: z.enum(["google_drive"]).default("google_drive"),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  if (!canManageSystem(user)) {
    return NextResponse.json({ error: "Only admins can update system settings." }, { status: 403 });
  }

  const safetyError = getMutationSafetyError(request, { key: `settings:${user.id}`, limit: 12, windowMs: 60_000 });

  if (safetyError) {
    return NextResponse.json({ error: safetyError.error }, { status: safetyError.status });
  }

  const parsed = settingsSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Check the settings fields and try again." }, { status: 400 });
  }

  const profileValue = {
    brandName: parsed.data.brandName,
    country: parsed.data.country,
    timezone: parsed.data.timezone,
    autonomyLevel: parsed.data.autonomyLevel,
  };
  const safetyValue = {
    allowPublicPublish: false,
    requireHumanApproval: true,
    allowPaidTools: false,
    allowBrowserAutomation: false,
    defaultUploadPrivacy: parsed.data.defaultUploadPrivacy ?? defaultFolqenSettings.defaultUploadPrivacy,
  };
  const customModel = parsed.data.customOpenAiModel?.trim();
  const selectedModel = normalizeModelId(parsed.data.openAiModel === "custom" ? customModel || defaultFolqenSettings.openAiModel : parsed.data.openAiModel);
  const providerValue = {
    openAiModel: selectedModel,
    customOpenAiModel: isKnownOpenAiModel(selectedModel) ? "" : selectedModel,
    storageProvider: parsed.data.storageProvider,
    paidToolGuard: "blocked_until_env_and_human_approval",
  };

  await getDb().$transaction([
    getDb().setting.upsert({
      where: { key: "brand.profile" },
      update: { value: profileValue, version: { increment: 1 } },
      create: { key: "brand.profile", value: profileValue },
    }),
    getDb().setting.upsert({
      where: { key: "safety.defaults" },
      update: { value: safetyValue, version: { increment: 1 } },
      create: { key: "safety.defaults", value: safetyValue },
    }),
    getDb().setting.upsert({
      where: { key: "provider.preferences" },
      update: { value: providerValue, version: { increment: 1 } },
      create: { key: "provider.preferences", value: providerValue },
    }),
    getDb().auditLog.create({
      data: {
        actorId: user.id,
        action: "settings.updated",
        target: "folqen-settings",
        riskLevel: "MEDIUM",
        metadata: {
          changedKeys: ["brand.profile", "safety.defaults"],
          providerPreferenceChanged: true,
          blockedRiskyFlags: ["allowPublicPublish", "allowPaidTools", "allowBrowserAutomation"],
        },
      },
    }),
  ]);

  await createAuditLog({
    actorId: user.id,
    action: "settings.safe_flags_confirmed",
    target: "safety.defaults",
    riskLevel: "LOW",
    metadata: safetyValue,
  });

  return NextResponse.json({ ok: true, settings: { ...profileValue, ...safetyValue, ...providerValue } });
}
