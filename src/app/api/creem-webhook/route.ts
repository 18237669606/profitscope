import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyCreemSignature, type CreemWebhookBody } from "@/lib/creem";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("creem-signature") || "";
  const secretConfigured = process.env.CREEM_WEBHOOK_SECRET && process.env.CREEM_WEBHOOK_SECRET !== "your-creem-webhook-secret";

  if (secretConfigured && !verifyCreemSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (!secretConfigured) {
    console.warn("CREEM_WEBHOOK_SECRET not set — skipping signature verification");
  }

  let body: CreemWebhookBody;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { event, data } = body;
  const adminClient = createAdminClient();

  try {
    switch (event) {
      case "checkout.completed":
      case "subscription.active":
      case "subscription.trialing": {
        // Upsert subscription record. User linking happens via auth callback
        // or later when the user signs in and we match by customer_email.
        const subId = data.subscription_id || data.id;
        const trialEnd = data.trial_end || null;

        const { error } = await adminClient
          .from("subscriptions")
          .upsert(
            {
              provider_subscription_id: subId,
              provider: "creem",
              customer_email: data.customer_email || null,
              status: event === "subscription.trialing" ? "trialing" : "active",
              trial_ends_at: trialEnd,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "provider_subscription_id" }
          );

        if (error) {
          console.error("Failed to upsert subscription:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        break;
      }

      case "subscription.canceled":
      case "subscription.expired": {
        const subId = data.subscription_id || data.id;
        const newStatus = event === "subscription.canceled" ? "cancelled" : "expired";

        const { error } = await adminClient
          .from("subscriptions")
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq("provider_subscription_id", subId);

        if (error) {
          console.error("Failed to update subscription:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        break;
      }

      case "subscription.paused": {
        const subId = data.subscription_id || data.id;

        await adminClient
          .from("subscriptions")
          .update({ status: "paused", updated_at: new Date().toISOString() })
          .eq("provider_subscription_id", subId);
        break;
      }

      case "subscription.past_due": {
        // Payment failed but subscription still active — log but don't block access yet
        console.warn(
          "Subscription past due:",
          data.subscription_id || data.id
        );
        break;
      }

      case "subscription.paid": {
        // Recurring payment received — ensure status is active
        const subId = data.subscription_id || data.id;

        await adminClient
          .from("subscriptions")
          .update({ status: "active", updated_at: new Date().toISOString() })
          .eq("provider_subscription_id", subId);
        break;
      }

      default:
        console.log("Unhandled webhook event:", event);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
