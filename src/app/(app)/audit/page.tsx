import { Card, CardContent } from "@/components/ui/card";
import { getDb, hasDatabaseUrl } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const [auditLogs, eventLogs] = hasDatabaseUrl()
    ? await Promise.all([
        getDb().auditLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 24,
        }),
        getDb().eventLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 24,
        }),
      ])
    : [[], []];

  return (
    <div className="space-y-5 pb-24">
      <Card className="panel-soft">
        <CardContent className="py-5">
          <h1 className="font-display text-2xl font-semibold tracking-[-0.03em]">Activity</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">A clear timeline of real account actions and workflow events.</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="panel">
          <CardContent className="py-5">
            <h2 className="mb-3 text-lg font-semibold">Recent account actions</h2>
            <div className="space-y-2">
              {auditLogs.length === 0 ? <p className="text-sm text-muted-foreground">No account actions yet.</p> : null}
              {auditLogs.map((log) => (
                <article key={log.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{log.action}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{log.createdAt.toISOString()}</div>
                </article>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="panel-soft">
          <CardContent className="py-5">
            <h2 className="mb-3 text-lg font-semibold">Recent workflow events</h2>
            <div className="space-y-2">
              {eventLogs.length === 0 ? <p className="text-sm text-muted-foreground">No workflow events yet.</p> : null}
              {eventLogs.map((event) => (
                <article key={event.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{event.type}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{event.createdAt.toISOString()}</div>
                </article>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
