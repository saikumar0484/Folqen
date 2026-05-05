import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  children: React.ReactNode;
  tone?: "safe" | "warning" | "danger" | "neutral" | "premium";
};

const tones = {
  safe: "border-neon/30 bg-neon/10 text-neon",
  warning: "border-amber-400/25 bg-amber-400/10 text-amber-200",
  danger: "border-rose-400/25 bg-rose-400/10 text-rose-200",
  neutral: "border-white/10 bg-white/[0.03] text-muted-foreground",
  premium: "border-neon/35 bg-neon/10 text-foreground shadow-glow",
};

export function StatusBadge({ children, tone = "neutral" }: StatusBadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-3.5 py-1.5 font-mono text-[11px] font-medium uppercase tracking-widest", tones[tone])}>
      {children}
    </span>
  );
}
