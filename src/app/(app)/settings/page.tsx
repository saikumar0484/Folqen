import { PasswordChangeForm } from "@/components/app/password-change-form";
import { SettingsForm } from "@/components/app/settings-form";
import { StatusBadge } from "@/components/ui/status-badge";
import { getFolqenSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getFolqenSettings();

  return (
    <div className="space-y-5 pb-24">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-widest text-neon">Live settings</div>
            <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">System settings</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
              Save brand and automation preferences to Supabase while public publishing, paid tools, and browser automation stay blocked.
            </p>
          </div>
          <StatusBadge tone="safe">Safe defaults active</StatusBadge>
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-sm text-muted-foreground">Brand</div>
          <div className="mt-2 font-display text-2xl font-semibold">{settings.brandName}</div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-sm text-muted-foreground">Timezone</div>
          <div className="mt-2 font-display text-2xl font-semibold">{settings.timezone}</div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-sm text-muted-foreground">Human approval</div>
          <div className="mt-2 font-display text-2xl font-semibold text-neon">Required</div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-sm text-muted-foreground">Risky automation</div>
          <div className="mt-2 font-display text-2xl font-semibold text-neon">Off</div>
        </div>
      </section>

      <SettingsForm settings={settings} />
      <PasswordChangeForm />
    </div>
  );
}
