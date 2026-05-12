import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const PAYPAL_CLIENT_ID =
  "AT4UBrQpIKgnHNIyfX75MgGNkoHOhY2Ggxe9t2I6ly2LqOiucTwRUDgAfvwvnnaAdc9DXSjjQh1i-JeS";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;
const PAYPAL_API_BASE =
  process.env.PAYPAL_API_BASE || "https://api-m.paypal.com";

interface PayPalSubscriptionResource {
  id: string;
  plan_id: string;
  status: string;
  subscriber?: {
    email_address?: string;
    payer_id?: string;
  };
  create_time?: string;
}

interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource_type: string;
  resource: PayPalSubscriptionResource;
  create_time: string;
}

async function getAccessToken(): Promise<string> {
  if (!PAYPAL_CLIENT_SECRET) {
    throw new Error("PAYPAL_CLIENT_SECRET not configured");
  }

  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`PayPal auth failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.access_token;
}

async function verifyWebhookSignature(
  body: string,
  headers: Headers
): Promise<boolean> {
  if (!PAYPAL_WEBHOOK_ID) {
    // Webhook ID not configured — skip verification (dev mode)
    console.warn("PAYPAL_WEBHOOK_ID not set — skipping signature verification");
    return true;
  }

  const token = await getAccessToken();

  const verificationBody = {
    auth_algo: headers.get("paypal-auth-algo") || "",
    cert_url: headers.get("paypal-cert-url") || "",
    transmission_id: headers.get("paypal-transmission-id") || "",
    transmission_sig: headers.get("paypal-transmission-sig") || "",
    transmission_time: headers.get("paypal-transmission-time") || "",
    webhook_id: PAYPAL_WEBHOOK_ID,
    webhook_event: JSON.parse(body),
  };

  const res = await fetch(
    `${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(verificationBody),
    }
  );

  const data = await res.json();
  return data.verification_status === "SUCCESS";
}

export async function POST(request: NextRequest) {
  const body = await request.text();

  // Verify signature
  try {
    const verified = await verifyWebhookSignature(body, request.headers);
    if (!verified) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }
  } catch (err) {
    console.error("Webhook verification error:", err);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }

  const event: PayPalWebhookEvent = JSON.parse(body);
  const { event_type, resource } = event;

  console.log(`PayPal webhook: ${event_type}`, resource.id);

  const supabase = createAdminClient();

  try {
    switch (event_type) {
      case "BILLING.SUBSCRIPTION.CREATED":
      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        await supabase.from("subscriptions").upsert(
          {
            paypal_subscription_id: resource.id,
            plan_id: resource.plan_id,
            status: resource.status?.toLowerCase() || "active",
            paypal_email: resource.subscriber?.email_address || null,
            payer_id: resource.subscriber?.payer_id || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "paypal_subscription_id" }
        );
        break;
      }

      case "BILLING.SUBSCRIPTION.UPDATED": {
        await supabase
          .from("subscriptions")
          .update({
            status: resource.status?.toLowerCase() || "active",
            updated_at: new Date().toISOString(),
          })
          .eq("paypal_subscription_id", resource.id);
        break;
      }

      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.SUSPENDED":
      case "BILLING.SUBSCRIPTION.EXPIRED": {
        await supabase
          .from("subscriptions")
          .update({
            status: event_type.includes("CANCELLED")
              ? "cancelled"
              : event_type.includes("SUSPENDED")
                ? "suspended"
                : "expired",
            updated_at: new Date().toISOString(),
          })
          .eq("paypal_subscription_id", resource.id);
        break;
      }

      case "PAYMENT.SALE.COMPLETED": {
        // Payment received — log it
        await supabase.from("payment_events").insert({
          event_type,
          paypal_event_id: event.id,
          resource_id: resource.id,
          raw_body: body,
          created_at: new Date().toISOString(),
        });
        break;
      }

      default:
        console.log(`Unhandled event type: ${event_type}`);
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json(
      { error: "Processing failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
