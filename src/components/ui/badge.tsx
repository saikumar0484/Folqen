import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-widest", {
  variants: {
    variant: {
      safe: "border-neon/30 bg-neon/10 text-neon",
      info: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
      warning: "border-amber-300/25 bg-amber-300/10 text-amber-100",
      danger: "border-rose-300/25 bg-rose-300/10 text-rose-100",
      neutral: "border-white/10 bg-white/[0.04] text-muted-foreground",
      premium: "border-neon/35 bg-neon/10 text-foreground shadow-glow",
    },
  },
  defaultVariants: {
    variant: "neutral",
  },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
