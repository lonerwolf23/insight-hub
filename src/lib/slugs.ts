/**
 * Profile usernames (e.g. "drmoksha.advocate") contain dots, which some dev
 * environments treat as static-file requests on dynamic routes. base64url uses
 * only [A-Za-z0-9_-], so slugs are always route-safe. Implemented with btoa/atob
 * because the client-side Buffer polyfill does not support "base64url".
 * Instagram usernames are ASCII-only ([A-Za-z0-9._]), so btoa/atob are safe.
 */
export function profileSlug(username: string): string {
  const b64 = btoa(username);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function profileFromSlug(slug: string): string {
  const b64 = slug.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  return atob(padded);
}
