export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-8 text-center"><p className="font-medium">{title}</p><p className="mt-2 text-sm text-zinc-400">{description}</p></div>;
}
