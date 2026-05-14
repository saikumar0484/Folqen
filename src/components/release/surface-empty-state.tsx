import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/app/empty-state";
import type { EmptyStateModel } from "@/lib/public-release/account-state";

function statusTone(status: EmptyStateModel["status"]) {
  if (status === "Configured") return "safe" as const;
  if (status === "Needs approval") return "warning" as const;
  if (status === "Blocked") return "danger" as const;
  return "neutral" as const;
}

export function SurfaceEmptyState({ model }: { model: EmptyStateModel }) {
  return (
    <section className="space-y-4">
      <div className="flex justify-start">
        <StatusBadge tone={statusTone(model.status)}>{model.status}</StatusBadge>
      </div>
      <EmptyState
        title={model.title}
        description={model.description}
        suggestion={model.suggestion}
        actionLabel={model.actionLabel}
        actionHref={model.actionHref}
      />
    </section>
  );
}
