import { cookies } from "next/headers";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { getPreviewDemoUser, getPreviewPublicUser, isPreviewDemoAuthEnabled, isPreviewPublicModeEnabled, PREVIEW_DEMO_USER_ID } from "@/lib/auth/preview-demo";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

export type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "OPERATOR" | "VIEWER";
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (isPreviewPublicModeEnabled()) {
    return getPreviewPublicUser();
  }

  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(AUTH_COOKIE_NAME)?.value);

  if (!session) {
    return null;
  }

  if (isPreviewDemoAuthEnabled() && session.userId === PREVIEW_DEMO_USER_ID && session.email === getPreviewDemoUser().email) {
    return getPreviewDemoUser();
  }

  if (!hasDatabaseUrl()) {
    return null;
  }

  try {
    const user = await getDb().user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}
