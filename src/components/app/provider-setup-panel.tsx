import { Bot, Cloud, HardDrive, KeyRound, Workflow, Wrench } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ProviderConfig } from "@/lib/provider-config";

function statusTone(status: string) {
  return status === "configured" ? ("safe" as const) : ("warning" as const);
}

function StatusLine({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <StatusBadge tone={statusTone(status)}>{status.replaceAll("_", " ")}</StatusBadge>
    </div>
  );
}

function SecretRow({ label, configured }: { label: string; configured: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <span className="text-sm">{label}</span>
      <StatusBadge tone={configured ? "safe" : "warning"}>{configured ? "Configured" : "Missing"}</StatusBadge>
    </div>
  );
}

export function ProviderSetupPanel({ config }: { config: ProviderConfig }) {
  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center gap-2">
          <Cloud className="h-4 w-4 text-neon" />
          <h2 className="font-display text-xl font-semibold">Drive cloud storage</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{config.storage.googleDrive.note}</p>
        <div className="mt-4">
          <StatusLine label="Current status" status={config.storage.googleDrive.status} />
        </div>
        <div className="mt-4 grid gap-2">
          <SecretRow label="Google OAuth client" configured={config.storage.googleDrive.clientConfigured} />
          <SecretRow label="Refresh token" configured={config.storage.googleDrive.tokenConfigured} />
          <SecretRow label="Private Drive folder" configured={config.storage.googleDrive.folderConfigured} />
        </div>
        <div className="mt-4 rounded-xl border border-neon/20 bg-neon/[0.06] p-3 text-xs leading-5 text-muted-foreground">
          Recommended setup: use a dedicated private folder for Folqen uploads and keep account access scoped to what you need.
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-neon" />
          <h2 className="font-display text-xl font-semibold">AI writing assistant</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{config.ai.openai.note}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StatusBadge tone={statusTone(config.ai.openai.status)}>{config.ai.openai.status.replaceAll("_", " ")}</StatusBadge>
          <StatusBadge tone="warning">Paid access paused</StatusBadge>
          <StatusBadge tone="premium">{config.ai.openai.selectedModel}</StatusBadge>
        </div>
        <div className="mt-4 grid gap-2">
          {config.ai.openai.modelOptions.map((model) => (
            <div key={model.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">{model.label}</span>
                <StatusBadge tone={model.id === config.ai.openai.selectedModel ? "safe" : "neutral"}>{model.category.replaceAll("_", " ")}</StatusBadge>
              </div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{model.note}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center gap-2">
          <Workflow className="h-4 w-4 text-neon" />
          <h2 className="font-display text-xl font-semibold">Workflow automations</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{config.workflow.n8n.note}</p>
        <div className="mt-4">
          <StatusLine label="Current status" status={config.workflow.n8n.status} />
        </div>
        <div className="mt-4 grid gap-2">
          <SecretRow label="n8n instance URL" configured={Boolean(config.workflow.n8n.instanceUrl)} />
          <SecretRow label="n8n webhook secret" configured={config.workflow.n8n.webhookConfigured} />
        </div>
        <div className="mt-4 rounded-xl border border-neon/20 bg-neon/[0.06] p-3 text-xs leading-5 text-muted-foreground">
          Keep your automation account secure. Folqen never asks for your n8n admin password.
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-neon" />
          <h2 className="font-display text-xl font-semibold">Rendering and media tools</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{config.media.note}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <StatusLine label="Worker" status={config.media.localWorker} />
          <StatusLine label="TTS" status={config.media.tts} />
        </div>
        <div className="mt-4 grid gap-2">
          <SecretRow label="Local/Oracle worker" configured={config.media.localWorker === "configured"} />
          <SecretRow label="ComfyUI endpoint" configured={config.media.comfyui === "configured"} />
          <SecretRow label="FFmpeg path/worker" configured={config.media.ffmpeg === "configured"} />
          <SecretRow label="TTS provider" configured={config.media.tts === "configured"} />
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs leading-5 text-muted-foreground">
          <HardDrive className="h-4 w-4 text-neon" />
          Larger media jobs run through dedicated workers so your app stays fast and stable.
        </div>
      </div>

      <div className="rounded-3xl border border-amber-400/20 bg-amber-400/[0.06] p-5 xl:col-span-2">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-amber-200" />
          <h2 className="font-display text-xl font-semibold">What you can connect later</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          When you are ready, connect Drive, AI, and media tools from secure account settings.
        </p>
      </div>
    </section>
  );
}
