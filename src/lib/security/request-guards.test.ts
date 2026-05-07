import assert from "node:assert/strict";
import test from "node:test";
import { FOLQEN_MUTATION_HEADER, FOLQEN_MUTATION_HEADER_VALUE } from "@/lib/security/mutation-headers";
import { checkRateLimit, getMutationSafetyError, validateFolqenMutationHeader, validateSameOriginRequest } from "@/lib/security/request-guards";

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

test("mutation header guard blocks requests without the app marker", () => {
  const request = new Request("https://folqen.vercel.app/api/settings", {
    method: "POST",
    headers: {
      host: "folqen.vercel.app",
      origin: "https://folqen.vercel.app",
    },
  });

  const result = validateFolqenMutationHeader(request);

  assert.equal(result.ok, false);
});

test("mutation safety returns 429 for repeated safe-origin requests", () => {
  const key = `test-${crypto.randomUUID()}`;
  const request = new Request("https://folqen.vercel.app/api/settings", {
    method: "POST",
    headers: {
      host: "folqen.vercel.app",
      origin: "https://folqen.vercel.app",
      [FOLQEN_MUTATION_HEADER]: FOLQEN_MUTATION_HEADER_VALUE,
    },
  });

  assert.equal(getMutationSafetyError(request, { key, limit: 1, windowMs: 1000, now: 100 }), null);
  assert.deepEqual(getMutationSafetyError(request, { key, limit: 1, windowMs: 1000, now: 200 }), {
    status: 429,
    error: "Too many requests. Try again shortly.",
  });
});

test("mutation safety rejects same-origin requests that lack the app marker", () => {
  const key = `test-${crypto.randomUUID()}`;
  const request = new Request("https://folqen.vercel.app/api/settings", {
    method: "POST",
    headers: {
      host: "folqen.vercel.app",
      origin: "https://folqen.vercel.app",
    },
  });

  assert.deepEqual(getMutationSafetyError(request, { key, limit: 1, windowMs: 1000, now: 100 }), {
    status: 403,
    error: "Mutation must be sent from the Folqen app UI.",
  });
});
