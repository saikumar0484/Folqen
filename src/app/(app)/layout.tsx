import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getPreviewPublicUser, isPreviewPublicModeEnabled } from "@/lib/auth/preview-demo";

export const dynamic = "force-dynamic";

export default async function AuthenticatedAppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    if (isPreviewPublicModeEnabled()) {
      return <AppShell user={getPreviewPublicUser()}>{children}</AppShell>;
    }

    redirect("/login");
  }

  return <AppShell user={user}>{children}</AppShell>;
}
