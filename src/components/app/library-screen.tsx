import { Archive, Download, FileText, FolderOpen, PackageCheck, ShieldCheck } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { PostingPackageAction } from "@/components/app/posting-package-action";
import { StatCard } from "@/components/app/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { routeById } from "@/lib/app-routes";
import type { getLibraryData } from "@/lib/library-data";

type LibraryData = Awaited<ReturnType<typeof getLibraryData>>;

function statusTone(status: string) {
  if (status === "APPROVED" || status === "COMPLETED") return "safe" as const;
  if (status === "BLOCKED" || status === "FAILED") return "danger" as const;
  if (status === "REVIEW" || status === "PENDING") return "warning" as const;
  return "neutral" as const;
}

export function LibraryScreen({ data }: { data: LibraryData }) {
  return (
    <div className="space-y-5 pb-24">
      <PageHeader route={routeById.library} />

      <section className="grid gap-3 md:grid-cols-3">
        {data.stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Content library</div>
              <h2 className="mt-1 font-display text-xl font-semibold">Content records from Supabase</h2>
            </div>
            <StatusBadge tone="premium">Live database</StatusBadge>
          </div>

          <div className="mt-4 grid gap-3">
            {data.contentItems.length === 0 ? (
              <EmptyState title="No content records yet" description="Content packages will appear here after the agent creates drafts." />
            ) : null}
            {data.contentItems.map((item) => (
              <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge tone={statusTone(item.status)}>{item.status}</StatusBadge>
                      {item.hasManualPackage ? <StatusBadge tone="safe">Manual package</StatusBadge> : <StatusBadge tone="neutral">Package pending</StatusBadge>}
                    </div>
                    <h3 className="mt-3 font-display text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{item.format} - Updated {item.updatedAt}</p>
                  </div>
                  <div className="grid min-w-56 grid-cols-2 gap-2 text-center text-xs">
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <div className="font-mono text-lg text-neon">{item.counts.tasks}</div>
                      <div className="text-muted-foreground">tasks</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <div className="font-mono text-lg text-neon">{item.counts.assets}</div>
                      <div className="text-muted-foreground">assets</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <div className="font-mono text-lg text-neon">{item.counts.renders}</div>
                      <div className="text-muted-foreground">renders</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <div className="font-mono text-lg text-neon">{item.counts.approvals}</div>
                      <div className="text-muted-foreground">approvals</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <div className="text-xs text-muted-foreground">Review</div>
                    <div className="mt-1 text-sm">{item.reviewStatus}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <div className="text-xs text-muted-foreground">Safety</div>
                    <div className="mt-1 text-sm">{item.safetyStatus}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <div className="text-xs text-muted-foreground">Copyright</div>
                    <div className="mt-1 text-sm">{item.copyrightStatus}</div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {item.platformTargets.map((platform) => (
                    <StatusBadge key={platform} tone="warning">{platform} not connected</StatusBadge>
                  ))}
                </div>
                <PostingPackageAction contentId={item.id} platform={item.platformTargets[0]} />
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-neon/20 bg-neon/[0.06] p-4">
            <div className="flex items-center gap-2">
              <PackageCheck className="h-4 w-4 text-neon" />
              <h2 className="font-display text-lg font-semibold">Posting packages</h2>
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="font-mono text-3xl text-neon">{data.postingPackages.count}</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{data.postingPackages.note}</p>
            </div>
            <div className="mt-3 grid gap-2">
              {["Captions prepared manually", "Platform APIs not connected", "Publishing approval required"].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">
                  <ShieldCheck className="h-4 w-4 text-neon" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-neon" />
              <h2 className="font-display text-lg font-semibold">Assets</h2>
            </div>
            <div className="mt-4 space-y-2">
              {data.assets.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm leading-6 text-muted-foreground">
                  No generated assets yet. Image, video, voice, and thumbnail providers remain Not connected.
                </div>
              ) : null}
              {data.assets.map((asset) => (
                <div key={asset.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium">{asset.name}</div>
                    <StatusBadge tone="neutral">{asset.type}</StatusBadge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{asset.contentTitle} - {asset.mimeType} - {asset.size}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-neon" />
              <h2 className="font-display text-lg font-semibold">Uploaded files</h2>
            </div>
            <div className="mt-4 space-y-2">
              {data.uploadedFiles.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm leading-6 text-muted-foreground">
                  Upload UI and MIME validation are still pending, so there are no uploaded files yet.
                </div>
              ) : null}
              {data.uploadedFiles.map((file) => (
                <div key={file.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium">{file.name}</div>
                    <StatusBadge tone="safe">{file.privacy}</StatusBadge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{file.mimeType} - {file.size}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-neon" />
              <h2 className="font-display text-lg font-semibold">Render outputs</h2>
            </div>
            <div className="mt-4 space-y-2">
              {data.renders.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm leading-6 text-muted-foreground">
                  FFmpeg/local renderer is Not connected, so no render outputs exist.
                </div>
              ) : null}
              {data.renders.map((render) => (
                <div key={render.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium">{render.contentTitle}</div>
                    <StatusBadge tone={statusTone(render.status)}>{render.status}</StatusBadge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{render.providerId} - {render.outputPath}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2">
              <Archive className="h-4 w-4 text-neon" />
              <h2 className="font-display text-lg font-semibold">Archive safety</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Destructive archive/delete actions are not active yet. When added, they must use confirmations, role checks, and audit logs.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
