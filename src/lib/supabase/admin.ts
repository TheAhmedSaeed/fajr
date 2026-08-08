import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client. Bypasses row-level security entirely.
 *
 * Only two things are allowed to use it, and both verify authorisation in code
 * before touching it:
 *   - writing a check-in, after the server has confirmed the clock is inside
 *     the user's real Fajr window;
 *   - adding a member to a group, after the invite code has been validated.
 *
 * Never import this into a client component. The `server-only` guard above
 * turns that mistake into a build error rather than a leaked key.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Check-ins and group joins cannot be written without it.",
    );
  }

  // The publishable and secret keys sit next to each other in the Supabase
  // dashboard and are easy to swap. Caught here, the mistake names itself;
  // left to Supabase it comes back as a bare "Invalid API key" from whichever
  // action happened to run first.
  if (key.startsWith("sb_publishable_") || key === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY holds the publishable/anon key. It needs the secret (service_role) key — the one that is never sent to a browser.",
    );
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
