import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isOnboarded } from "@/lib/data";

/**
 * Landing point for the magic link. Exchanges the one-time code for a session,
 * then sends first-time users through onboarding so they have a location before
 * they ever see a check-in button.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

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
      const dest = `/onboarding?next=${encodeURIComponent(safeNext)}`;
      return NextResponse.redirect(`${origin}${dest}`);
    }
  }

  return NextResponse.redirect(`${origin}${safeNext}`);
}
