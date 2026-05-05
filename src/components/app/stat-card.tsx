import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const toneClass = {
  safe: "border-neon/25 bg-neon/[0.06]",
  warning: "border-amber-300/25 bg-amber-300/[0.06]",
  premium: "border-white/10 bg-white/[0.04]",
  neutral: "border-white/10 bg-white/[0.02]",
};

export function StatCard({ label, value, hint, tone }: { label: string; value: string; hint: string; tone: keyof typeof toneClass }) {
  return (
    <div className={cn("rounded-2xl border p-4", toneClass[tone])}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">{label}</div>
        <ArrowUpRight className="h-4 w-4 text-neon" />
      </div>
      <div className="mt-3 font-display text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-xs leading-5 text-muted-foreground">{hint}</div>
    </div>
  );
}
