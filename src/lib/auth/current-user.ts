import { cookies } from "next/headers";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

export type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "OPERATOR" | "VIEWER";
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(AUTH_COOKIE_NAME)?.value);

  if (!session || !hasDatabaseUrl()) {
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
