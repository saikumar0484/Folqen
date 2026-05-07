export function StatusBadge({ status = "Not connected" }: { status?: string }) {
  return <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-xs text-sky-300">{status}</span>;
}
