import "server-only";
import { headers } from "next/headers";

/**
 * The public origin this request arrived on, e.g. `https://fajr.example.com`.
 *
 * Magic-link redirects and invite links are built from this, so getting it
 * wrong is not cosmetic: a stale value emails people a link to a host they
 * cannot reach. It previously defaulted to `http://localhost:3000`, which meant
 * a deployment missing `NEXT_PUBLIC_SITE_URL` mailed out localhost links
 * instead of failing loudly.
 *
 * Order of preference:
 *   1. `NEXT_PUBLIC_SITE_URL` — an explicit override, trailing slash tolerated.
 *   2. The proxy headers the host actually served this request on. Railway,
 *      Vercel and Fly all set these, so the common case needs no configuration.
 *   3. localhost, as a last resort for local development.
 */
export async function getOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return stripTrailingSlash(configured);

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) {
    // Behind a TLS-terminating proxy the upstream request is plain HTTP, so the
    // scheme has to come from the forwarded header rather than being assumed.
    const proto = h.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? guessProto(host);
    return `${proto}://${host}`;
  }

  return "http://localhost:3000";
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

function guessProto(host: string): string {
  return host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
}
