import { NextResponse } from "next/server";
import { createCheckout } from "@/lib/creem";

export async function POST() {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://profitscope-ten.vercel.app";

  try {
    const checkout = await createCheckout(`${origin}/login?subscribed=true`);

    return NextResponse.json({ checkout_url: checkout.checkout_url });
  } catch (err) {
    console.error("Failed to create Creem checkout:", err);
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 }
    );
  }
}
