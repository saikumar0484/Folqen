import { RiskBadge } from "./risk-badge";
import { StatusBadge } from "./status-badge";

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-zinc-400">{subtitle}</p>
      </div>
      <div className="flex gap-2">
        <StatusBadge />
        <RiskBadge level="low" />
      </div>
    </div>
  );
}
