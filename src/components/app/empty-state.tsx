import { Inbox } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  suggestion,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  suggestion?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.025] p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-neon">
        <Inbox className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted-foreground">{description}</p>
      {suggestion ? <p className="mx-auto mt-1 max-w-md text-xs leading-6 text-muted-foreground">{suggestion}</p> : null}
      {actionHref && actionLabel ? (
        <Button asChild size="sm" variant="secondary" className="mt-4">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
