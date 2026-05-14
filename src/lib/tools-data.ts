import { ProviderStatus, ToolType } from "@prisma/client";
import { getIntegrationStatus } from "@/lib/integrations/status";
import { getDb } from "@/lib/db";
import { getFolqenSettings } from "@/lib/settings";

function statusTone(status: ProviderStatus | string) {
  if (status === "LIVE" || status === "CONFIGURED" || status === "configured") return "safe" as const;
  if (status === "FAILED" || status === "NEEDS_ATTENTION") return "danger" as const;
  if (status === "TESTING") return "premium" as const;
  return "warning" as const;
}

function formatType(type: ToolType) {
  return type.replaceAll("_", " ").toLowerCase();
}

function formatReset(date: Date | null) {
  if (!date) return "No reset window";
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function getToolsData() {
  const [providers, limits, settings] = await Promise.all([
    getDb().providerRegistryItem.findMany({ orderBy: { name: "asc" } }),
    getDb().toolLimit.findMany({ orderBy: { updatedAt: "desc" } }),
    getFolqenSettings(),
  ]);
  const integrationStatus = await getIntegrationStatus(settings.openAiModel);

  const configuredProviders = providers.filter((provider) => provider.status === "CONFIGURED" || provider.status === "LIVE").length;
  const localToolsConfigured = [integrationStatus.worker.localWorker, integrationStatus.tools.comfyui, integrationStatus.tools.ffmpeg].filter(
    (status) => status === "configured",
  ).length;

  return {
    stats: [
      { label: "Providers", value: String(providers.length), hint: "ProviderRegistryItem rows", tone: "premium" as const },
      { label: "Configured", value: String(configuredProviders), hint: "Live/configured providers", tone: configuredProviders > 0 ? ("safe" as const) : ("warning" as const) },
      { label: "Local tools", value: String(localToolsConfigured), hint: "ComfyUI/FFmpeg/local worker", tone: localToolsConfigured > 0 ? ("safe" as const) : ("warning" as const) },
    ],
    providers: providers.map((provider) => ({
      id: provider.id,
      name: provider.name,
      type: formatType(provider.type),
      status: provider.status,
      statusTone: statusTone(provider.status),
      version: provider.version,
      costModel: provider.costModel,
      commercialUse: provider.commercialUse,
    })),
    limits: limits.map((limit) => ({
      id: limit.id,
      name: limit.label,
      type: formatType(limit.toolType),
      used: limit.usedValue,
      limit: limit.limitValue,
      resetAt: formatReset(limit.resetAt),
      note: limit.limitValue ? `${limit.usedValue}/${limit.limitValue} used` : `${limit.usedValue} used, no hard limit`,
    })),
    integrationStatus,
  };
}
