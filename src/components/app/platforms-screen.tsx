import { Globe2, LockKeyhole, PackageCheck, ShieldCheck } from "lucide-react";
import { ConnectionWizard } from "@/components/app/connection-wizard";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { routeById } from "@/lib/app-routes";
import type { getPlatformsData } from "@/lib/platforms-data";

type PlatformsData = Awaited<ReturnType<typeof getPlatformsData>>;

export function PlatformsScreen({ data }: { data: PlatformsData }) {
  return (
    <div className="space-y-5 pb-24">
      <PageHeader route={routeById.platforms} />

      <section className="grid gap-3 md:grid-cols-3">
        {data.stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <ConnectionWizard
        providerIds={["youtube", "instagram", "facebook", "snapchat", "threads"]}
        initialProvider="youtube"
        title="Connect your social platforms"
        description="Start platform setup from here. Folqen asks for channel/page/profile details now, saves them securely, and keeps official OAuth/public posting blocked until that adapter is built and approved. Never enter social media passwords."
      />

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Distribution map</div>
              <h2 className="mt-1 font-display text-xl font-semibold">Platform connections from Supabase</h2>
            </div>
            <StatusBadge tone="premium">Live database</StatusBadge>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {data.platforms.map((platform) => (
              <article key={platform.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-neon">{platform.tier}</div>
                    <h3 className="mt-1 font-display text-lg font-semibold">{platform.label}</h3>
                    <p className="mt-2 text-sm capitalize text-muted-foreground">{platform.authMethod}</p>
                  </div>
                  <StatusBadge tone={platform.statusTone}>{platform.status.replaceAll("_", " ")}</StatusBadge>
                </div>
                <div className="mt-4 grid gap-2 text-xs text-muted-foreground">
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    API upload: <span className="text-foreground">Not connected</span>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    Manual fallback: <span className="text-foreground">Posting package</span>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    Updated: <span className="text-foreground">{platform.updatedAt}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-neon/20 bg-neon/[0.06] p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-neon" />
              <h2 className="font-display text-lg font-semibold">India-first rules</h2>
            </div>
            <div className="mt-4 grid gap-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">Primary platforms: YouTube, Instagram, Facebook, Snapchat, Threads</div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">TikTok is not part of the India distribution plan</div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">Public publishing remains blocked by default</div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2">
              <PackageCheck className="h-4 w-4 text-neon" />
              <h2 className="font-display text-lg font-semibold">Manual package mode</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Since platform APIs are not connected, Folqen should prepare captions, hashtags, descriptions, thumbnails, and upload instructions instead of claiming upload success.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2">
              <LockKeyhole className="h-4 w-4 text-neon" />
              <h2 className="font-display text-lg font-semibold">Connection approvals</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              OAuth, credentials, real account access, monetization settings, and posting permissions require explicit human approval before setup.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-neon" />
              <h2 className="font-display text-lg font-semibold">Platform count</h2>
            </div>
            <div className="mt-4 font-mono text-4xl text-neon">{data.primaryCount}</div>
            <p className="mt-2 text-sm text-muted-foreground">Primary platform records configured in the database, all still safe/manual until real setup.</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
