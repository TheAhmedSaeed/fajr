import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrigin } from "@/lib/site-url";
import { isOnboarded } from "@/lib/data";

/**
 * Landing point for the magic link. Exchanges the one-time code for a session,
 * then sends first-time users through onboarding so they have a location before
 * they ever see a check-in button.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  /*
   * The origin must come from the forwarded headers, not from `request.url`.
   * Behind a proxy the container sees the address it was forwarded to — on
   * Railway that is `https://localhost:8080` — so redirecting relative to
   * `request.url` lands the user on a host that only exists inside the
   * container, at the final step of signing in.
   */
  const origin = await getOrigin();

  // Only allow same-site redirects — `next` comes straight off the query string.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!isOnboarded(profile)) {
      return NextResponse.redirect(
        `${origin}/onboarding?next=${encodeURIComponent(safeNext)}`,
      );
    }
  }

  return NextResponse.redirect(`${origin}${safeNext}`);
}
