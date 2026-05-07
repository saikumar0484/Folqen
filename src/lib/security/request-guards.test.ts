import assert from "node:assert/strict";
import test from "node:test";
import { checkRateLimit, getMutationSafetyError, validateSameOriginRequest } from "@/lib/security/request-guards";

test("same-origin guard blocks explicit cross-site mutations", () => {
  const request = new Request("https://folqen.vercel.app/api/settings", {
    method: "POST",
    headers: {
      host: "folqen.vercel.app",
      origin: "https://attacker.example",
    },
  });

  const result = validateSameOriginRequest(request);

  assert.equal(result.ok, false);
});

test("same-origin guard allows matching origin and host", () => {
  const request = new Request("https://folqen.vercel.app/api/settings", {
    method: "POST",
    headers: {
      host: "folqen.vercel.app",
      origin: "https://folqen.vercel.app",
    },
  });

  const result = validateSameOriginRequest(request);

  assert.equal(result.ok, true);
});

test("rate limit blocks after configured quota", () => {
  const key = `test-${crypto.randomUUID()}`;

  assert.equal(checkRateLimit({ key, limit: 2, windowMs: 1000, now: 100 }).allowed, true);
  assert.equal(checkRateLimit({ key, limit: 2, windowMs: 1000, now: 200 }).allowed, true);
  assert.equal(checkRateLimit({ key, limit: 2, windowMs: 1000, now: 300 }).allowed, false);
  assert.equal(checkRateLimit({ key, limit: 2, windowMs: 1000, now: 1200 }).allowed, true);
});

test("mutation safety returns 429 for repeated safe-origin requests", () => {
  const key = `test-${crypto.randomUUID()}`;
  const request = new Request("https://folqen.vercel.app/api/settings", {
    method: "POST",
    headers: {
      host: "folqen.vercel.app",
      origin: "https://folqen.vercel.app",
    },
  });

  assert.equal(getMutationSafetyError(request, { key, limit: 1, windowMs: 1000, now: 100 }), null);
  assert.deepEqual(getMutationSafetyError(request, { key, limit: 1, windowMs: 1000, now: 200 }), {
    status: 429,
    error: "Too many requests. Try again shortly.",
  });
});
