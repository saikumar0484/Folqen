export function RiskBadge({ level = "low" }: { level?: "low" | "medium" | "high" }) {
  const styles = {
    low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    medium: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    high: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  };
  return <span className={`rounded-full border px-2 py-1 text-xs uppercase ${styles[level]}`}>{level} risk</span>;
}
