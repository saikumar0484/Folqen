export function LoadingSkeleton() {
  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="h-4 w-1/3 animate-pulse rounded-full bg-white/10" />
      <div className="h-20 animate-pulse rounded-xl bg-white/[0.06]" />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="h-16 animate-pulse rounded-xl bg-white/[0.06]" />
        <div className="h-16 animate-pulse rounded-xl bg-white/[0.06]" />
        <div className="h-16 animate-pulse rounded-xl bg-white/[0.06]" />
      </div>
    </div>
  );
}
