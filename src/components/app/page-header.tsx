import { StatusBadge } from "@/components/ui/status-badge";
import type { RouteConfig } from "@/lib/app-routes";

export function PageHeader({ route }: { route: RouteConfig }) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <div className="font-mono text-[11px] uppercase tracking-widest text-neon">{route.kicker}</div>
        <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">{route.title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">{route.description}</p>
      </div>
      <StatusBadge tone={route.status === "Not connected" ? "warning" : route.status === "Needs approval" ? "safe" : "premium"}>
        {route.status}
      </StatusBadge>
    </div>
  );
}
