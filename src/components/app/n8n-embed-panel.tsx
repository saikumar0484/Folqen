import { ExternalLink, Workflow } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ProviderConfig } from "@/lib/provider-config";

export function N8nEmbedPanel({ config }: { config: ProviderConfig["workflow"]["n8n"] }) {
  const canEmbed = config.embedAllowed && config.instanceUrl;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Workflow className="h-4 w-4 text-neon" />
          <h2 className="font-display text-lg font-semibold">n8n workflow builder</h2>
        </div>
        <StatusBadge tone={canEmbed ? "safe" : "warning"}>{canEmbed ? "Ready to embed" : "Not connected"}</StatusBadge>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Folqen can show your self-hosted n8n editor here after `ORACLE_N8N_INSTANCE_URL` is configured and n8n allows iframe embedding.
      </p>

      {canEmbed ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-neon/20 bg-black/40">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-neon">Embedded n8n</span>
            <a href={config.instanceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs text-neon">
              Open full n8n
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <iframe src={config.instanceUrl} title="n8n workflow builder" className="h-[680px] w-full bg-background" />
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-white/10 p-6 text-sm leading-6 text-muted-foreground">
          Add your n8n instance URL as `ORACLE_N8N_INSTANCE_URL`, configure n8n to allow embedding, and keep webhook secrets in Vercel env. Until then, workflow runs stay read-only and Not connected.
        </div>
      )}
    </div>
  );
}
