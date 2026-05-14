import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  children: ReactNode;
  tone?: "safe" | "warning" | "danger" | "neutral" | "premium";
};

const tones = {
  safe: "border-neon/28 bg-neon/[0.11] text-neon",
  warning: "border-amber-300/30 bg-amber-300/[0.1] text-amber-100",
  danger: "border-rose-300/30 bg-rose-300/[0.11] text-rose-100",
  neutral: "border-white/12 bg-white/[0.035] text-muted-foreground",
  premium: "border-white/15 bg-white/[0.06] text-foreground",
};

export function StatusBadge({ children, tone = "neutral" }: StatusBadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.18em]", tones[tone])}>
      {children}
    </span>
  );
}
