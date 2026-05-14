import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { SurfaceEmptyState } from "@/components/release/surface-empty-state";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getIntelligenceDashboard } from "@/lib/intelligence/service";
import { buildEmptyStateModel, resolveCreatorAccountState } from "@/lib/public-release/account-state";
import { getWorkspaceOverview } from "@/lib/public-release/workspace-service";
import { toHonestStatus } from "@/lib/status-semantics";

export const dynamic = "force-dynamic";

export default async function ResearchPage() {
  const user = await getCurrentUser();
  const [overview, intelligence] = await Promise.all([user ? getWorkspaceOverview(user) : Promise.resolve({ hasWorkspace: false }), getIntelligenceDashboard("research")]);
  const hasRuns = intelligence.runs.length > 0;
  const emptyModel = buildEmptyStateModel("research", resolveCreatorAccountState({ hasWorkspace: overview.hasWorkspace, hasRecords: hasRuns }));

  return (
    <div className="section-space pb-8">
      <Card className="panel-soft">
        <CardContent className="py-5">
          <h1 className="font-display text-2xl font-semibold tracking-[-0.03em]">Research</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">Start with one creator question and let Folqen prepare focused research notes for your next script.</p>
        </CardContent>
      </Card>

      {!overview.hasWorkspace ? <SurfaceEmptyState model={emptyModel} /> : null}
      {overview.hasWorkspace && !hasRuns ? <SurfaceEmptyState model={emptyModel} /> : null}

      {overview.hasWorkspace && hasRuns ? (
        <Card className="panel">
          <CardContent className="py-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Recent research runs</h2>
              <Link href="/dashboard" className="text-xs text-neon hover:underline">
                Run new research
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {intelligence.runs.slice(0, 6).map((run) => (
                <article key={run.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{run.workflowId.replaceAll("_", " ")}</div>
                  <div className="mt-1 text-sm font-semibold text-foreground">Run #{run.id.slice(0, 8)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{toHonestStatus(run.status)}</div>
                </article>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
