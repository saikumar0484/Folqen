import { redirect } from "next/navigation";
import { OnboardingAssistant } from "@/components/release/onboarding-assistant";
import { getCurrentUser } from "@/lib/auth/current-user";
import { buildDefaultOnboardingDraft } from "@/lib/public-release/conversation";
import { getWorkspaceOverview } from "@/lib/public-release/workspace-service";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=%2Fonboarding");
  }

  const overview = await getWorkspaceOverview(user);
  if (overview.hasWorkspace) {
    redirect("/dashboard");
  }

  return <OnboardingAssistant initialDraft={buildDefaultOnboardingDraft()} />;
}
