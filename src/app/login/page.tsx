import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth/current-user";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  const { next } = await searchParams;

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Return to your creator workspace."
      description="Sign in, continue your momentum, and pick up your next guided workflow."
    >
      <LoginForm nextPath={next} />
    </AuthShell>
  );
}
