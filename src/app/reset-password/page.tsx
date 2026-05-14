import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getCurrentUser } from "@/lib/auth/current-user";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; expired?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  const { token, expired } = await searchParams;
  const expiredFlag = expired === "1";

  return (
    <AuthShell
      eyebrow="Secure reset"
      title="Set a new password."
      description="Finish your reset and return to your creator workspace in seconds."
    >
      <ResetPasswordForm token={token} expired={expiredFlag} />
    </AuthShell>
  );
}
