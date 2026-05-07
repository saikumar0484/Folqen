export const FOLQEN_MUTATION_HEADER = "x-folqen-mutation";
export const FOLQEN_MUTATION_HEADER_VALUE = "browser-ui";

export function withFolqenMutationHeader(headers?: HeadersInit) {
  const nextHeaders = new Headers(headers);
  nextHeaders.set(FOLQEN_MUTATION_HEADER, FOLQEN_MUTATION_HEADER_VALUE);
  return nextHeaders;
}
