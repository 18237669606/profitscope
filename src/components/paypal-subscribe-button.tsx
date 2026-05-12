"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: Record<string, unknown>) => {
        render: (selector: string) => void;
      };
    };
  }
}

const PAYPAL_CLIENT_ID =
  "AT4UBrQpIKgnHNIyfX75MgGNkoHOhY2Ggxe9t2I6ly2LqOiucTwRUDgAfvwvnnaAdc9DXSjjQh1i-JeS";
const PLAN_ID = "P-42559609FD571070ANIBKYKI";

interface PayPalSubscribeButtonProps {
  className?: string;
}

export default function PayPalSubscribeButton({
  className,
}: PayPalSubscribeButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (scriptLoadedRef.current || !containerRef.current) return;

    const container = document.createElement("div");
    container.id = "paypal-button-container-P-42559609FD571070ANIBKYKI";
    containerRef.current.appendChild(container);

    const existingScript = document.querySelector(
      'script[src*="paypal.com/sdk/js"]'
    );

    const renderButton = () => {
      if (!window.paypal) return;
      window.paypal
        .Buttons({
          style: {
            shape: "pill",
            color: "gold",
            layout: "vertical",
            label: "subscribe",
          },
          createSubscription: (_data: unknown, actions: { subscription: { create: (opts: { plan_id: string }) => Promise<string> } }) => {
            return actions.subscription.create({ plan_id: PLAN_ID });
          },
          onApprove: (data: { subscriptionID: string }) => {
            // Set cookie so auth callback can link subscription to user
            document.cookie = `pending_sub_id=${data.subscriptionID}; path=/; max-age=3600; SameSite=Lax`;

            // Show success message
            const pricing = document.getElementById("pricing");
            if (pricing) {
              const msg = document.createElement("div");
              msg.className =
                "mt-4 rounded-md bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700";
              msg.textContent =
                "Subscription created! Sign in to access your account.";
              pricing.appendChild(msg);
            }

            setTimeout(() => {
              window.location.href = "/login?subscribed=true";
            }, 2000);
          },
          onError: (err: Error) => {
            console.error("PayPal error:", err);
            const pricing = document.getElementById("pricing");
            if (pricing) {
              const msg = document.createElement("div");
              msg.className =
                "mt-4 rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700";
              msg.textContent =
                "Payment failed. Please try again or use a different payment method.";
              pricing.appendChild(msg);
            }
          },
        })
        .render("#paypal-button-container-P-42559609FD571070ANIBKYKI");
    };

    if (existingScript) {
      if (window.paypal) {
        renderButton();
      } else {
        existingScript.addEventListener("load", renderButton);
      }
      scriptLoadedRef.current = true;
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
    script.setAttribute("data-sdk-integration-source", "button-factory");
    script.onload = () => {
      renderButton();
    };
    document.body.appendChild(script);
    scriptLoadedRef.current = true;

    return () => {
      // Cleanup handled by React unmounting the container
    };
  }, []);

  return <div ref={containerRef} className={className} />;
}
