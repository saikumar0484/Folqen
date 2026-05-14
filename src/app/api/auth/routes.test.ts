import assert from "node:assert/strict";
import test from "node:test";
import { POST as postRequestBetaAccess } from "@/app/api/auth/request-beta-access/route";
import { POST as postRequestReset } from "@/app/api/auth/request-reset/route";
import { POST as postResetPassword } from "@/app/api/auth/reset-password/route";
import { FOLQEN_MUTATION_HEADER, FOLQEN_MUTATION_HEADER_VALUE } from "@/lib/security/mutation-headers";

function buildMutationHeaders(ip: string, includeMutationHeader = true) {
  const headers = new Headers({
    host: "folqen.vercel.app",
    origin: "https://folqen.vercel.app",
    "x-forwarded-for": ip,
  });

  if (includeMutationHeader) {
    headers.set(FOLQEN_MUTATION_HEADER, FOLQEN_MUTATION_HEADER_VALUE);
  }

  return headers;
}

async function withNoDatabaseUrl<T>(fn: () => Promise<T>) {
  const previous = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;

  try {
    return await fn();
  } finally {
    if (previous === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = previous;
    }
  }
}

test("request-beta-access accepts valid creator request", async () => {
  const response = await withNoDatabaseUrl(() =>
    postRequestBetaAccess(
      new Request("https://folqen.vercel.app/api/auth/request-beta-access", {
        method: "POST",
        headers: buildMutationHeaders(`198.51.100.${Math.floor(Math.random() * 120) + 10}`),
        body: JSON.stringify({
          name: "Aarav Rao",
          email: "aarav@example.com",
          focus: "Horror storytelling shorts",
        }),
      }),
    ),
  );

  assert.equal(response.status, 200);
  const body = (await response.json()) as { ok?: boolean };
  assert.equal(body.ok, true);
});

test("request-beta-access rejects invalid payload", async () => {
  const response = await withNoDatabaseUrl(() =>
    postRequestBetaAccess(
      new Request("https://folqen.vercel.app/api/auth/request-beta-access", {
        method: "POST",
        headers: buildMutationHeaders(`203.0.113.${Math.floor(Math.random() * 120) + 10}`),
        body: JSON.stringify({ name: "A", email: "not-valid", focus: "" }),
      }),
    ),
  );

  assert.equal(response.status, 400);
});

test("request-reset blocks calls that are missing the app mutation marker", async () => {
  const response = await withNoDatabaseUrl(() =>
    postRequestReset(
      new Request("https://folqen.vercel.app/api/auth/request-reset", {
        method: "POST",
        headers: buildMutationHeaders(`198.18.0.${Math.floor(Math.random() * 120) + 10}`, false),
        body: JSON.stringify({ email: "admin@folqen.app" }),
      }),
    ),
  );

  assert.equal(response.status, 403);
});

test("request-reset returns a safe success response for valid input", async () => {
  const response = await withNoDatabaseUrl(() =>
    postRequestReset(
      new Request("https://folqen.vercel.app/api/auth/request-reset", {
        method: "POST",
        headers: buildMutationHeaders(`192.0.2.${Math.floor(Math.random() * 120) + 10}`),
        body: JSON.stringify({ email: "admin@folqen.app" }),
      }),
    ),
  );

  assert.equal(response.status, 200);
  const body = (await response.json()) as { ok?: boolean; message?: string };
  assert.equal(body.ok, true);
  assert.equal(typeof body.message, "string");
});

test("reset-password enforces minimum password length", async () => {
  const response = await withNoDatabaseUrl(() =>
    postResetPassword(
      new Request("https://folqen.vercel.app/api/auth/reset-password", {
        method: "POST",
        headers: buildMutationHeaders(`203.0.113.${Math.floor(Math.random() * 120) + 130}`),
        body: JSON.stringify({ token: "valid-reset-token-123456", newPassword: "short" }),
      }),
    ),
  );

  assert.equal(response.status, 400);
  const body = (await response.json()) as { error?: string };
  assert.equal(body.error, "Use at least 12 characters.");
});

test("reset-password returns a friendly invalid-link message when token cannot be resolved", async () => {
  const response = await withNoDatabaseUrl(() =>
    postResetPassword(
      new Request("https://folqen.vercel.app/api/auth/reset-password", {
        method: "POST",
        headers: buildMutationHeaders(`198.51.100.${Math.floor(Math.random() * 120) + 130}`),
        body: JSON.stringify({ token: "valid-reset-token-123456", newPassword: "long-enough-password" }),
      }),
    ),
  );

  assert.equal(response.status, 400);
  const body = (await response.json()) as { error?: string };
  assert.equal(body.error, "This reset link is no longer valid. Request a fresh link to continue.");
});
