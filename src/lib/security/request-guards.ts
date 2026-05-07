type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const globalRateLimitStore = globalThis as typeof globalThis & {
  __folqenRateLimitStore?: Map<string, RateLimitBucket>;
};

function getRateLimitStore() {
  if (!globalRateLimitStore.__folqenRateLimitStore) {
    globalRateLimitStore.__folqenRateLimitStore = new Map();
  }

  return globalRateLimitStore.__folqenRateLimitStore;
}

export function checkRateLimit({ key, limit, windowMs, now = Date.now() }: RateLimitOptions) {
  const store = getRateLimitStore();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: Math.max(limit - 1, 0), resetAt: now + windowMs };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: Math.max(limit - existing.count, 0), resetAt: existing.resetAt };
}

export function validateSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const fetchSite = request.headers.get("sec-fetch-site");
  const expectedHost = forwardedHost ?? host;

  if (fetchSite === "cross-site") {
    return { ok: false, error: "Cross-site mutation blocked." };
  }

  if (!origin || !expectedHost) {
    return { ok: true };
  }

  try {
    const originHost = new URL(origin).host;

    if (originHost !== expectedHost) {
      return { ok: false, error: "Request origin does not match Folqen." };
    }
  } catch {
    return { ok: false, error: "Request origin is invalid." };
  }

  return { ok: true };
}

export function getMutationSafetyError(request: Request, options: RateLimitOptions) {
  const origin = validateSameOriginRequest(request);

  if (!origin.ok) {
    return { status: 403, error: origin.error ?? "Mutation blocked." };
  }

  const rateLimit = checkRateLimit(options);

  if (!rateLimit.allowed) {
    return { status: 429, error: "Too many requests. Try again shortly." };
  }

  return null;
}
