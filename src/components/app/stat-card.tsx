import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const toneClass = {
  safe: "border-neon/25 bg-neon/[0.07]",
  warning: "border-amber-300/25 bg-amber-300/[0.08]",
  premium: "border-white/12 bg-white/[0.055]",
  neutral: "border-white/10 bg-white/[0.03]",
};

export function StatCard({ label, value, hint, tone }: { label: string; value: string; hint: string; tone: keyof typeof toneClass }) {
  return (
    <div className={cn("rounded-2xl border p-5", toneClass[tone])}>
      <div className="flex items-center justify-between gap-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
        <ArrowUpRight className="h-4 w-4 text-foreground/70" />
      </div>
      <div className="mt-4 font-display text-3xl font-semibold tracking-[-0.02em]">{value}</div>
      <div className="mt-2 text-xs leading-6 text-muted-foreground">{hint}</div>
    </div>
  );
}
