import { Cpu, Gauge, LockKeyhole, PlugZap, Wrench } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { routeById } from "@/lib/app-routes";
import type { getToolsData } from "@/lib/tools-data";

type ToolsData = Awaited<ReturnType<typeof getToolsData>>;

function statusTone(status: string) {
  if (status === "configured" || status === "live") return "safe" as const;
  return "warning" as const;
}

export function ToolsScreen({ data }: { data: ToolsData }) {
  return (
    <div className="space-y-5 pb-24">
      <PageHeader route={routeById.tools} />

      <section className="grid gap-3 md:grid-cols-3">
        {data.stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Provider registry</div>
              <h2 className="mt-1 font-display text-xl font-semibold">Tools from Supabase</h2>
            </div>
            <StatusBadge tone="premium">Live database</StatusBadge>
          </div>

          <div className="mt-4 grid gap-3">
            {data.providers.map((provider) => (
              <article key={provider.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-neon">{provider.type}</div>
                    <h3 className="mt-1 font-display text-lg font-semibold">{provider.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Cost: {provider.costModel} - Commercial use: {provider.commercialUse} - Version: {provider.version}
                    </p>
                  </div>
                  <StatusBadge tone={provider.statusTone}>{provider.status.replaceAll("_", " ")}</StatusBadge>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-neon/20 bg-neon/[0.06] p-4">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-neon" />
              <h2 className="font-display text-lg font-semibold">Tool limits</h2>
            </div>
            <div className="mt-4 space-y-2">
              {data.limits.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-muted-foreground">No tool limits configured yet.</div>
              ) : null}
              {data.limits.map((limit) => (
                <div key={limit.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium">{limit.name}</div>
                    <StatusBadge tone="neutral">{limit.type}</StatusBadge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{limit.note} - {limit.resetAt}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2">
              <PlugZap className="h-4 w-4 text-neon" />
              <h2 className="font-display text-lg font-semibold">Runtime connections</h2>
            </div>
            <div className="mt-4 grid gap-2">
              {[
                ["Database", data.integrationStatus.database.status],
                ["Oracle n8n", data.integrationStatus.worker.oracleN8n],
                ["n8n webhook", data.integrationStatus.worker.n8nWebhook],
                ["Local worker", data.integrationStatus.worker.localWorker],
                ["ComfyUI", data.integrationStatus.tools.comfyui],
                ["FFmpeg", data.integrationStatus.tools.ffmpeg],
              ].map(([label, status]) => (
                <div key={label} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <span className="text-sm">{label}</span>
                  <StatusBadge tone={statusTone(status)}>{status.replaceAll("_", " ")}</StatusBadge>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2">
              <LockKeyhole className="h-4 w-4 text-neon" />
              <h2 className="font-display text-lg font-semibold">Cost guard</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Paid tools are disabled by default. Any provider that can spend money must stay blocked until settings and a human approval both allow it.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-neon" />
              <h2 className="font-display text-lg font-semibold">Local-first plan</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Folqen should prefer self-hosted n8n, local FFmpeg, local ComfyUI, and manual packages before paid cloud providers.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-neon" />
              <h2 className="font-display text-lg font-semibold">Setup honesty</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              These cards report configuration state only. They do not run workflows, render media, publish content, or call paid APIs.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
