import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  children: React.ReactNode;
  tone?: "safe" | "warning" | "danger" | "neutral" | "premium";
};

const tones = {
  safe: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  warning: "border-amber-400/25 bg-amber-400/10 text-amber-200",
  danger: "border-rose-400/25 bg-rose-400/10 text-rose-200",
  neutral: "border-white/15 bg-white/8 text-slate-200",
  premium: "border-violet-400/25 bg-violet-400/10 text-violet-100",
};

export function StatusBadge({ children, tone = "neutral" }: StatusBadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium", tones[tone])}>
      {children}
    </span>
  );
}
