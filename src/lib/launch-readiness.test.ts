import assert from "node:assert/strict";
import test from "node:test";
import { buildLaunchReadiness } from "@/lib/launch-readiness";
import type { ProviderConfig } from "@/lib/provider-config";

const baseProviderConfig: ProviderConfig = {
  storage: {
    selectedProvider: "google_drive",
    googleDrive: {
      status: "not_connected",
      folderConfigured: false,
      clientConfigured: false,
      tokenConfigured: false,
      note: "not connected",
    },
  },
  ai: {
    openai: {
      status: "not_connected",
      selectedModel: "gpt-5-mini",
      modelOptions: [],
      paidToolGuard: "blocked",
      note: "not connected",
    },
  },
  workflow: {
    n8n: {
      status: "not_connected",
      webhookConfigured: false,
      embedAllowed: false,
      note: "not connected",
    },
  },
  media: {
    localWorker: "not_connected",
    comfyui: "not_connected",
    ffmpeg: "not_connected",
    tts: "not_connected",
    note: "not connected",
  },
};

test("launch readiness is honest about blocked live integrations", () => {
  const readiness = buildLaunchReadiness(baseProviderConfig);

  assert.equal(readiness.launchMode, "Day-3 usable MVP");
  assert.equal(readiness.readyCount, 2);
  assert.equal(readiness.percent, 25);
  assert.equal(readiness.items.some((item) => item.status === "needs_secret"), true);
  assert.equal(readiness.items.some((item) => item.label === "Public platform publishing" && item.status === "later"), true);
});

test("configured OpenAI still needs human paid-tool approval", () => {
  const readiness = buildLaunchReadiness({
    ...baseProviderConfig,
    ai: {
      openai: {
        ...baseProviderConfig.ai.openai,
        status: "configured",
      },
    },
  });
  const openAi = readiness.items.find((item) => item.label === "OpenAI real agent drafts");

  assert.equal(openAi?.status, "needs_human");
});
