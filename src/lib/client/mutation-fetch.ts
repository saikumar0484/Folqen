"use client";

import { withFolqenMutationHeader } from "@/lib/security/mutation-headers";

export function mutationFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  return fetch(input, {
    ...init,
    headers: withFolqenMutationHeader(init.headers),
  });
}
