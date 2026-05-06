import { createHmac, timingSafeEqual } from "node:crypto";

export const AUTH_COOKIE_NAME = "folqen_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type SessionPayload = {
  userId: string;
  email: string;
  role: "ADMIN" | "OPERATOR" | "VIEWER";
  expiresAt: number;
};

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET?.trim();
  return secret && secret !== "replace-with-a-secure-random-secret" ? secret : null;
}

export function isAuthConfigured() {
  return Boolean(getAuthSecret());
}

export function createSessionToken(payload: Omit<SessionPayload, "expiresAt">) {
  const secret = getAuthSecret();

  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }

  const body = base64UrlEncode(
    JSON.stringify({
      ...payload,
      expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
    }),
  );
  const signature = sign(body, secret);

  return `${body}.${signature}`;
}

export function verifySessionToken(token?: string | null): SessionPayload | null {
  const secret = getAuthSecret();

  if (!secret || !token) {
    return null;
  }

  const [body, signature] = token.split(".");

  if (!body || !signature) {
    return null;
  }

  const expected = sign(body, secret);
  const expectedBytes = Buffer.from(expected);
  const signatureBytes = Buffer.from(signature);

  if (expectedBytes.length !== signatureBytes.length || !timingSafeEqual(expectedBytes, signatureBytes)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(body)) as SessionPayload;

    if (!payload.userId || !payload.email || !payload.role || payload.expiresAt < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
