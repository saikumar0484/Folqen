import { cn } from "@/lib/utils";

const riskClass = {
  low: "border-neon/30 bg-neon/10 text-neon",
  medium: "border-amber-300/30 bg-amber-300/10 text-amber-200",
  high: "border-red-300/30 bg-red-300/10 text-red-200",
};

export function RiskBadge({ level }: { level: keyof typeof riskClass }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest", riskClass[level])}>
      {level} risk
    </span>
  );
}
