import { CalendarDays, CreditCard, FileUp, Palette, ShieldCheck } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { FileUploadForm } from "@/components/app/file-upload-form";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { routeById } from "@/lib/app-routes";
import type { getBrandData, getCalendarData, getFilesData, getMonetizationData } from "@/lib/foundation-pages-data";

type CalendarData = Awaited<ReturnType<typeof getCalendarData>>;
type MonetizationData = Awaited<ReturnType<typeof getMonetizationData>>;
type BrandData = Awaited<ReturnType<typeof getBrandData>>;
type FilesData = Awaited<ReturnType<typeof getFilesData>>;

function GuardCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-neon/20 bg-neon/[0.06] p-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-neon" />
        <h2 className="font-display text-lg font-semibold">{title}</h2>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

export function CalendarScreen({ data }: { data: CalendarData }) {
  return (
    <div className="space-y-5 pb-24">
      <PageHeader route={routeById.calendar} />
      <section className="grid gap-3 md:grid-cols-3">{data.stats.map((stat) => <StatCard key={stat.label} {...stat} />)}</section>
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Content schedule</div>
              <h2 className="mt-1 font-display text-xl font-semibold">Calendar records from Supabase</h2>
            </div>
            <StatusBadge tone="premium">Live database</StatusBadge>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {data.items.map((item) => (
              <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-neon">{item.format}</div>
                    <h3 className="mt-1 font-display text-base font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{item.updatedAt}</p>
                  </div>
                  <StatusBadge tone={item.statusTone}>{item.status}</StatusBadge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">{item.targets.map((target) => <StatusBadge key={target} tone="warning">{target} manual</StatusBadge>)}</div>
              </article>
            ))}
          </div>
        </div>
        <aside className="space-y-4">
          <GuardCard title="Scheduling guard" text="Auto scheduling and public posting remain off. Calendar items are planning records until platform setup and approvals exist." />
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-neon" /><h2 className="font-display text-lg font-semibold">Approval blockers</h2></div>
            <div className="mt-4 space-y-2">
              {data.approvals.length === 0 ? <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-muted-foreground">No pending approvals.</div> : null}
              {data.approvals.map((approval) => <div key={approval.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm">{approval.title}</div>)}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

export function MonetizationScreen({ data }: { data: MonetizationData }) {
  return (
    <div className="space-y-5 pb-24">
      <PageHeader route={routeById.monetization} />
      <section className="grid gap-3 md:grid-cols-3">{data.stats.map((stat) => <StatCard key={stat.label} {...stat} />)}</section>
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Revenue readiness</div>
              <h2 className="mt-1 font-display text-xl font-semibold">Monetization signals</h2>
            </div>
            <StatusBadge tone="safe">Payment access off</StatusBadge>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {data.analytics.length === 0 ? <EmptyState title="No monetization data yet" description="Revenue and platform analytics stay unavailable until real accounts are connected." /> : null}
            {data.analytics.map((record) => (
              <article key={record.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="font-mono text-[10px] uppercase tracking-widest text-neon">{record.platform}</div>
                <h3 className="mt-1 font-display text-lg font-semibold">{record.metric}</h3>
                <div className="mt-3 font-mono text-2xl text-neon">{record.value}</div>
                <p className="mt-2 text-sm text-muted-foreground">{record.period} - {record.createdAt}</p>
              </article>
            ))}
          </div>
        </div>
        <aside className="space-y-4">
          <GuardCard title="Payment guard" text="Folqen cannot change monetization, ads, payment details, sponsor commitments, or paid tools without explicit human approval." />
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-neon" /><h2 className="font-display text-lg font-semibold">MVP monetization scope</h2></div>
            <div className="mt-4 grid gap-2">{["Readiness checklist", "Manual notes", "No payment access", "No revenue claims without live data"].map((item) => <div key={item} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm">{item}</div>)}</div>
          </div>
        </aside>
      </section>
    </div>
  );
}

export function BrandScreen({ data }: { data: BrandData }) {
  return (
    <div className="space-y-5 pb-24">
      <PageHeader route={routeById.brand} />
      <section className="grid gap-3 md:grid-cols-3">{data.stats.map((stat) => <StatCard key={stat.label} {...stat} />)}</section>
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Brand memory</div>
              <h2 className="mt-1 font-display text-xl font-semibold">Mystery content boundaries</h2>
            </div>
            <StatusBadge tone="premium">Configured direction</StatusBadge>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {data.contentItems.map((item) => (
              <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-neon">{item.format}</div>
                    <h3 className="mt-1 font-display text-base font-semibold">{item.title}</h3>
                  </div>
                  <StatusBadge tone={item.statusTone}>{item.status}</StatusBadge>
                </div>
              </article>
            ))}
          </div>
        </div>
        <aside className="space-y-4">
          <GuardCard title="Brand safety" text="Avoid fake factual claims, copyrighted modern horror stories without permission, real tragedy exploitation, and celebrity likeness misuse." />
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2"><Palette className="h-4 w-4 text-neon" /><h2 className="font-display text-lg font-semibold">Visual direction</h2></div>
            <div className="mt-4 grid gap-2">{["Dark cyber command center", "Neon green accent", "Glass panels", "Monospace micro-labels"].map((item) => <div key={item} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm">{item}</div>)}</div>
          </div>
        </aside>
      </section>
    </div>
  );
}

export function FilesScreen({ data }: { data: FilesData }) {
  return (
    <div className="space-y-5 pb-24">
      <PageHeader route={routeById.files} />
      <section className="grid gap-3 md:grid-cols-3">{data.stats.map((stat) => <StatCard key={stat.label} {...stat} />)}</section>
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-neon">File inventory</div>
              <h2 className="mt-1 font-display text-xl font-semibold">Files and assets from Supabase</h2>
            </div>
            <StatusBadge tone="premium">Live database</StatusBadge>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {data.files.length === 0 && data.assets.length === 0 ? <EmptyState title="No files tracked yet" description="Uploads are disabled until strict validation and storage rules are implemented." /> : null}
            {data.files.map((file) => (
              <article key={file.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div><h3 className="font-display text-base font-semibold">{file.name}</h3><p className="mt-2 text-sm text-muted-foreground">{file.mimeType} - {file.size}</p></div>
                  <StatusBadge tone="safe">{file.privacy}</StatusBadge>
                </div>
              </article>
            ))}
            {data.assets.map((asset) => (
              <article key={asset.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div><h3 className="font-display text-base font-semibold">{asset.name}</h3><p className="mt-2 text-sm text-muted-foreground">{asset.contentTitle} - {asset.mimeType} - {asset.size}</p></div>
                  <StatusBadge tone="neutral">{asset.type}</StatusBadge>
                </div>
              </article>
            ))}
          </div>
        </div>
        <aside className="space-y-4">
          <FileUploadForm accept={data.accept} />
          <GuardCard title="Storage guard" text="This MVP records validated private file metadata in Supabase. Binary object storage remains Not connected until Supabase Storage policies and secrets are configured." />
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2"><FileUp className="h-4 w-4 text-neon" /><h2 className="font-display text-lg font-semibold">Allowed future types</h2></div>
            <div className="mt-4 grid gap-2">{["Images, video, audio", "PDF, DOCX, TXT, MD", "CSV, XLSX, JSON, YAML", "SRT and VTT captions"].map((item) => <div key={item} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm">{item}</div>)}</div>
          </div>
        </aside>
      </section>
    </div>
  );
}
