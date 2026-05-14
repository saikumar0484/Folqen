import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { JoinBetaForm } from "@/components/auth/join-beta-form";
import { getCurrentUser } from "@/lib/auth/current-user";

export const dynamic = "force-dynamic";

export default async function JoinBetaPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      eyebrow="Invite-only beta"
      title="Start your AI creator workspace."
      description="Tell us what you're building and we'll set up your Folqen invite for a guided launch."
    >
      <JoinBetaForm />
    </AuthShell>
  );
}
