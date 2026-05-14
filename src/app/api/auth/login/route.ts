import { NextResponse } from "next/server";
import { z } from "zod";
import { AUTH_COOKIE_NAME, createSessionToken, isAuthConfigured, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { getPreviewDemoUser, validatePreviewDemoCredentials } from "@/lib/auth/preview-demo";
import { isBetaUserDisabled, requiresBetaPasswordChange } from "@/lib/beta/access";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { getMutationSafetyError } from "@/lib/security/request-guards";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const clientKey = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const safetyError = getMutationSafetyError(request, { key: `login:${clientKey}`, limit: 10, windowMs: 60_000 });

  if (safetyError) {
    return NextResponse.json({ error: safetyError.error }, { status: safetyError.status });
  }

  if (!isAuthConfigured()) {
    return NextResponse.json(
      {
        error: "Authentication is not configured. Set AUTH_SECRET before login.",
      },
      { status: 503 },
    );
  }

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  }

  if (validatePreviewDemoCredentials(parsed.data.email, parsed.data.password)) {
    const user = getPreviewDemoUser();
    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const response = NextResponse.json({
      user: {
        ...user,
        requiresPasswordChange: false,
      },
      mode: "preview-demo",
      safety: {
        previewSafeMode: true,
        dryRunOnly: true,
        liveExecution: false,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: SESSION_MAX_AGE_SECONDS,
      path: "/",
    });

    return response;
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.json(
      {
        error: "Database is not connected. Set DATABASE_URL and seed the admin user before login, or enable preview demo auth for safe preview deployments.",
      },
      { status: 503 },
    );
  }

  const user = await getDb().user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });

  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const [disabled, requiresPasswordChange] = await Promise.all([isBetaUserDisabled(user.id), requiresBetaPasswordChange(user.id)]);
  if (disabled) {
    return NextResponse.json({ error: "This beta account is disabled. Contact Folqen support." }, { status: 403 });
  }

  const token = createSessionToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
  const response = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      requiresPasswordChange,
    },
  });

  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });

  return response;
}
