import { createHmac, timingSafeEqual } from "crypto";

const CREEM_API_BASE =
  process.env.CREEM_TEST_MODE === "true"
    ? "https://test-api.creem.io/v1"
    : "https://api.creem.io/v1";

const CREEM_API_KEY = process.env.CREEM_API_KEY!;
const CREEM_WEBHOOK_SECRET = process.env.CREEM_WEBHOOK_SECRET!;
const CREEM_PRODUCT_ID = process.env.CREEM_PRODUCT_ID!;

export interface CreemCheckout {
  id: string;
  checkout_url: string;
  product_id: string;
  status: string;
}

export async function createCheckout(
  successUrl: string,
  metadata?: Record<string, string>
): Promise<CreemCheckout> {
  const res = await fetch(`${CREEM_API_BASE}/checkouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": CREEM_API_KEY,
    },
    body: JSON.stringify({
      product_id: CREEM_PRODUCT_ID,
      success_url: successUrl,
      metadata,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Creem checkout creation failed: ${res.status} ${body}`);
  }

  return res.json();
}

export function verifyCreemSignature(
  payload: string,
  signature: string
): boolean {
  const hmac = createHmac("sha256", CREEM_WEBHOOK_SECRET);
  const computed = hmac.update(payload).digest("hex");

  try {
    return timingSafeEqual(
      Buffer.from(computed, "utf-8"),
      Buffer.from(signature, "utf-8")
    );
  } catch {
    return false;
  }
}

export type CreemWebhookEvent =
  | "checkout.completed"
  | "subscription.active"
  | "subscription.trialing"
  | "subscription.paid"
  | "subscription.canceled"
  | "subscription.expired"
  | "subscription.paused"
  | "subscription.past_due";

export interface CreemWebhookBody {
  event: CreemWebhookEvent;
  data: {
    id: string;
    checkout_id?: string;
    subscription_id?: string;
    customer_id?: string;
    customer_email?: string;
    product_id?: string;
    plan_id?: string;
    status?: string;
    trial_end?: string | null;
  };
}
