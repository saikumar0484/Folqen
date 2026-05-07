"use client";

import { useState } from "react";
import { Copy } from "lucide-react";

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition hover:border-neon/30 hover:text-neon"
    >
      <Copy className="h-3.5 w-3.5" />
      {copied ? "Copied" : label}
    </button>
  );
}
