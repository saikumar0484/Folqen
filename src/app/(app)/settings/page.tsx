import { BetaAccessPanel } from "@/components/app/beta-access-panel";
import { PasswordChangeForm } from "@/components/app/password-change-form";
import { ConnectionWizard } from "@/components/app/connection-wizard";
import { ProviderApprovalActions } from "@/components/app/provider-approval-actions";
import { ProviderSetupPanel } from "@/components/app/provider-setup-panel";
import { SettingsForm } from "@/components/app/settings-form";
import { StatusBadge } from "@/components/ui/status-badge";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getProviderConfig } from "@/lib/provider-config";
import { getFolqenSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const settings = await getFolqenSettings();
  const providerConfig = getProviderConfig(settings.openAiModel);

  return (
    <div className="space-y-5 pb-24">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-widest text-neon">Account settings</div>
            <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">Your creator workspace</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
              Manage your profile, workspace preferences, connected tools, and account security in one calm place.
            </p>
          </div>
          <StatusBadge tone="safe">Workspace ready</StatusBadge>
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-sm text-muted-foreground">Creator profile</div>
          <div className="mt-2 font-display text-2xl font-semibold">{settings.brandName}</div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-sm text-muted-foreground">Timezone</div>
          <div className="mt-2 font-display text-2xl font-semibold">{settings.timezone}</div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-sm text-muted-foreground">Publishing mode</div>
          <div className="mt-2 font-display text-2xl font-semibold text-neon">Required</div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-sm text-muted-foreground">Creator safeguards</div>
          <div className="mt-2 font-display text-2xl font-semibold text-neon">Active</div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <h2 className="font-display text-xl font-semibold">Profile and workspace preferences</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tune your brand profile and default publishing behavior.</p>
        </div>
        <SettingsForm settings={settings} />
      </section>

      <section className="space-y-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <h2 className="font-display text-xl font-semibold">Connected platforms and tools</h2>
          <p className="mt-1 text-sm text-muted-foreground">Connect what you need for your creator workflow and keep everything review-first.</p>
        </div>
        <ConnectionWizard />
        <ProviderSetupPanel config={providerConfig} />
        <ProviderApprovalActions />
      </section>

      {(user?.role === "ADMIN" || user?.role === "OPERATOR") ? (
        <section className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <h2 className="font-display text-xl font-semibold">Invite management</h2>
            <p className="mt-1 text-sm text-muted-foreground">Welcome creators to your beta workspace and manage account access.</p>
          </div>
          <BetaAccessPanel />
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <h2 className="font-display text-xl font-semibold">Security</h2>
          <p className="mt-1 text-sm text-muted-foreground">Keep your account protected with trusted sign-in settings.</p>
        </div>
        <PasswordChangeForm />
      </section>
    </div>
  );
}
