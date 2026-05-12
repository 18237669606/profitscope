import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const pendingSubId = request.cookies.get("pending_sub_id")?.value;

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user && pendingSubId) {
      // Link the pending PayPal subscription to the authenticated user
      try {
        const adminClient = createAdminClient();
        await adminClient
          .from("subscriptions")
          .update({ user_id: data.user.id })
          .eq("paypal_subscription_id", pendingSubId);
      } catch (linkErr) {
        console.error("Failed to link subscription:", linkErr);
      }
    }

    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`);
      // Clear the pending subscription cookie
      if (pendingSubId) {
        response.cookies.set("pending_sub_id", "", { path: "/", maxAge: 0 });
      }
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
