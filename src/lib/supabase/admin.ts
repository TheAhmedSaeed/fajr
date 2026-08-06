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
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Check-ins and group joins cannot be written without it.",
    );
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
