import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { getCurrentUser } from "@/lib/auth/current-user";

export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="We’ll help you get back in."
      description="Request secure reset instructions and continue your creator workflow with confidence."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
