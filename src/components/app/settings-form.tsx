"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { FolqenSettings } from "@/lib/settings";

const autonomyOptions = [
  ["manual", "Manual"],
  ["assisted", "Assisted"],
  ["draft_automation", "Draft automation"],
  ["high_automation", "High automation"],
  ["approval_99", "99% with approval gates"],
] as const;

export function SettingsForm({ settings }: { settings: FolqenSettings }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setMessage(null);
        setError(null);

        startTransition(async () => {
          const response = await fetch("/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              brandName: data.get("brandName"),
              country: data.get("country"),
              timezone: data.get("timezone"),
              autonomyLevel: data.get("autonomyLevel"),
              defaultUploadPrivacy: data.get("defaultUploadPrivacy"),
            }),
          });
          const body = (await response.json().catch(() => ({}))) as { error?: string };

          if (!response.ok) {
            setError(body.error ?? "Settings save failed.");
            return;
          }

          setMessage("Settings saved. Risky automation switches remain blocked.");
          router.refresh();
        });
      }}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Database-backed settings</div>
          <h2 className="mt-1 font-display text-xl font-semibold">Creator command settings</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">These values save to Supabase. Dangerous automation flags stay locked off in this phase.</p>
        </div>
        <button type="submit" disabled={isPending} className="rounded-xl bg-neon px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow disabled:opacity-60">
          {isPending ? "Saving..." : "Save settings"}
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Brand name</span>
          <input name="brandName" defaultValue={settings.brandName} className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-neon/40" />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Country</span>
          <input name="country" defaultValue={settings.country} className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-neon/40" />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Timezone</span>
          <input name="timezone" defaultValue={settings.timezone} className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-neon/40" />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Autonomy level</span>
          <select name="autonomyLevel" defaultValue={settings.autonomyLevel} className="w-full rounded-xl border border-white/10 bg-surface px-3 py-2 text-sm outline-none focus:border-neon/40">
            {autonomyOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Default upload privacy</span>
          <select name="defaultUploadPrivacy" defaultValue={settings.defaultUploadPrivacy} className="w-full rounded-xl border border-white/10 bg-surface px-3 py-2 text-sm outline-none focus:border-neon/40">
            <option value="private">Private</option>
            <option value="unlisted">Unlisted</option>
          </select>
        </label>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          ["Public publishing", settings.allowPublicPublish],
          ["Paid tools", settings.allowPaidTools],
          ["Browser automation", settings.allowBrowserAutomation],
        ].map(([label]) => (
          <div key={String(label)} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="text-sm font-medium">{label}</div>
            <div className="mt-2 font-mono text-[11px] uppercase tracking-widest text-neon">Locked off</div>
          </div>
        ))}
      </div>

      {message ? <p className="mt-4 text-sm text-neon">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-rose-200">{error}</p> : null}
    </form>
  );
}
