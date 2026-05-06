export function LoadingSkeleton() {
  return <div className="grid gap-3 md:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-zinc-800/80" />)}</div>;
}
