import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { SurfaceEmptyState } from "@/components/release/surface-empty-state";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getIntelligenceDashboard } from "@/lib/intelligence/service";
import { getMediaDashboard } from "@/lib/media/service";
import { buildEmptyStateModel, resolveCreatorAccountState } from "@/lib/public-release/account-state";
import { getWorkspaceOverview } from "@/lib/public-release/workspace-service";
import { toHonestStatus } from "@/lib/status-semantics";

export const dynamic = "force-dynamic";

export default async function ContentStudioPage() {
  const user = await getCurrentUser();
  const [overview, intelligence, media] = await Promise.all([
    user ? getWorkspaceOverview(user) : Promise.resolve({ hasWorkspace: false }),
    getIntelligenceDashboard("content"),
    getMediaDashboard(),
  ]);

  const hasRuns = intelligence.runs.length > 0 || media.recentAssets.length > 0;
  const emptyModel = buildEmptyStateModel("content", resolveCreatorAccountState({ hasWorkspace: overview.hasWorkspace, hasRecords: hasRuns }));

  return (
    <div className="section-space pb-8">
      <Card className="panel-soft">
        <CardContent className="py-5">
          <h1 className="font-display text-2xl font-semibold tracking-[-0.03em]">Script & Thumbnail</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
            Turn research into hooks, short scripts, thumbnail directions, and a clean draft package ready for review.
          </p>
        </CardContent>
      </Card>

      {!overview.hasWorkspace ? <SurfaceEmptyState model={emptyModel} /> : null}
      {overview.hasWorkspace && !hasRuns ? <SurfaceEmptyState model={emptyModel} /> : null}

      {overview.hasWorkspace && hasRuns ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="panel">
            <CardContent className="py-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Recent content runs</h2>
                <Link href="/dashboard" className="text-xs text-neon hover:underline">
                  Run from dashboard
                </Link>
              </div>
              <div className="space-y-2">
                {intelligence.runs.slice(0, 6).map((run) => (
                  <article key={run.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{run.workflowId.replaceAll("_", " ")}</div>
                    <div className="mt-1 text-sm font-semibold">Run #{run.id.slice(0, 8)}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{toHonestStatus(run.status)}</div>
                  </article>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="panel-soft">
            <CardContent className="py-5">
              <h2 className="text-lg font-semibold">Recent thumbnail assets</h2>
              <p className="mt-1 text-sm text-muted-foreground">Assets saved to your workspace appear here as you generate draft packages.</p>
              <div className="mt-3 space-y-2">
                {media.recentAssets.slice(0, 6).map((asset) => (
                  <article key={asset.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{asset.mediaType}</div>
                    <div className="mt-1 text-sm font-semibold text-foreground">{asset.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{toHonestStatus(asset.status)}</div>
                  </article>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
