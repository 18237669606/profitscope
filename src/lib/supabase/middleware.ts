import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect dashboard routes
  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from login
  if (user && request.nextUrl.pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Check subscription for dashboard routes
  if (user && request.nextUrl.pathname.startsWith("/dashboard")) {
    // Try linking an unlinked subscription by email first
    const { data: unlinked } = await supabase
      .from("subscriptions")
      .select("id")
      .is("user_id", null)
      .eq("customer_email", user.email)
      .in("status", ["active", "trialing"])
      .maybeSingle();

    if (unlinked) {
      await supabase
        .from("subscriptions")
        .update({ user_id: user.id })
        .eq("id", unlinked.id);
    }

    // Check for active subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("id, status, trial_ends_at")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing", "paused"])
      .maybeSingle();

    if (!subscription) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("reason", "no_subscription");
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
