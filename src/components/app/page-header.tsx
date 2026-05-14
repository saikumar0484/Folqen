import { StatusBadge } from "@/components/ui/status-badge";
import type { RouteConfig } from "@/lib/app-routes";

export function PageHeader({ route }: { route: RouteConfig }) {
  const tone = route.status === "Blocked" ? "danger" : route.status === "Needs approval" ? "warning" : route.status === "Not connected" ? "neutral" : "safe";

  return (
    <div className="app-section relative overflow-hidden rounded-3xl p-6 md:p-7">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      <div className="absolute right-[-12%] top-[-22%] h-56 w-56 rounded-full bg-neon/[0.08] blur-3xl" />
      <div className="relative z-[1] flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon">{route.kicker}</div>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.02em] md:text-5xl">{route.title}</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">{route.description}</p>
        </div>
        <div className="shrink-0">
          <StatusBadge tone={tone}>{route.status}</StatusBadge>
        </div>
      </div>
    </div>
  );
}
