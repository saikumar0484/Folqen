import { defaultOpenAiModel, normalizeModelId, openAiModelOptions } from "@/lib/ai-models";
import { getEnv } from "@/lib/env";

export type ProviderConfig = {
  storage: {
    selectedProvider: "google_drive";
    googleDrive: {
      status: "not_connected" | "configured";
      folderConfigured: boolean;
      clientConfigured: boolean;
      tokenConfigured: boolean;
      note: string;
    };
  };
  ai: {
    openai: {
      status: "not_connected" | "configured";
      selectedModel: string;
      modelOptions: typeof openAiModelOptions;
      paidToolGuard: "blocked";
      note: string;
    };
  };
  workflow: {
    n8n: {
      status: "not_connected" | "configured";
      instanceUrl?: string;
      webhookConfigured: boolean;
      embedAllowed: boolean;
      note: string;
    };
  };
  media: {
    localWorker: "not_connected" | "configured";
    comfyui: "not_connected" | "configured";
    ffmpeg: "not_connected" | "configured";
    tts: "not_connected" | "configured";
    note: string;
  };
};

function configured(value: string | undefined) {
  return Boolean(value?.trim());
}

export function getProviderConfig(selectedOpenAiModel?: string): ProviderConfig {
  const env = getEnv();
  const googleClientConfigured = configured(env.GOOGLE_DRIVE_CLIENT_ID) && configured(env.GOOGLE_DRIVE_CLIENT_SECRET);
  const googleTokenConfigured = configured(env.GOOGLE_DRIVE_REFRESH_TOKEN);
  const googleFolderConfigured = configured(env.GOOGLE_DRIVE_FOLDER_ID);
  const n8nInstanceConfigured = configured(env.ORACLE_N8N_INSTANCE_URL);
  const n8nWebhookConfigured = configured(env.N8N_WEBHOOK_URL) && configured(env.N8N_WEBHOOK_SECRET);
  const selectedModel = normalizeModelId(selectedOpenAiModel ?? env.OPENAI_MODEL ?? defaultOpenAiModel);

  return {
    storage: {
      selectedProvider: "google_drive",
      googleDrive: {
        status: googleClientConfigured && googleTokenConfigured && googleFolderConfigured ? "configured" : "not_connected",
        folderConfigured: googleFolderConfigured,
        clientConfigured: googleClientConfigured,
        tokenConfigured: googleTokenConfigured,
        note: "Google Drive can be used for creator file storage after OAuth credentials, refresh token, and a private folder id are configured as server-only secrets.",
      },
    },
    ai: {
      openai: {
        status: configured(env.OPENAI_API_KEY) ? "configured" : "not_connected",
        selectedModel,
        modelOptions: openAiModelOptions,
        paidToolGuard: "blocked",
        note: "OpenAI is treated as a paid provider. Folqen stores model preference safely, but real paid calls remain approval-gated.",
      },
    },
    workflow: {
      n8n: {
        status: n8nInstanceConfigured || n8nWebhookConfigured ? "configured" : "not_connected",
        instanceUrl: env.ORACLE_N8N_INSTANCE_URL,
        webhookConfigured: n8nWebhookConfigured,
        embedAllowed: n8nInstanceConfigured,
        note: "Folqen can embed your self-hosted n8n UI when the instance URL is configured and n8n allows iframe embedding.",
      },
    },
    media: {
      localWorker: configured(env.LOCAL_WORKER_BASE_URL) ? "configured" : "not_connected",
      comfyui: configured(env.COMFYUI_BASE_URL) ? "configured" : "not_connected",
      ffmpeg: configured(env.FFMPEG_PATH) ? "configured" : "not_connected",
      tts: configured(env.TTS_PROVIDER_URL) ? "configured" : "not_connected",
      note: "Heavy media work should run on a local/Oracle worker, not inside Vercel Functions.",
    },
  };
}
