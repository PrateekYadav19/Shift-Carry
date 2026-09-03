import { createFileRoute } from "@tanstack/react-router";

/**
 * Razorpay webhook receiver.
 *
 * Razorpay signs every webhook with the webhook secret configured in the
 * dashboard. We verify that HMAC SHA256 signature against the *raw* body
 * before trusting a single field of the payload.
 *
 * Prototype note: this endpoint verifies and acknowledges events. Persisting
 * them requires a database, which this demo does not use yet.
 */
export const Route = createFileRoute("/api/public/razorpay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        const signature = request.headers.get("x-razorpay-signature");

        const { verifyWebhook } = await import("@/lib/swift/razorpay.server");
        const ok = verifyWebhook(raw, signature);
        if (!ok) {
          return new Response(JSON.stringify({ error: "invalid signature" }), {
            status: 401,
            headers: { "content-type": "application/json" },
          });
        }

        let event = "unknown";
        try {
          event = (JSON.parse(raw) as { event?: string }).event ?? "unknown";
        } catch {
          return new Response(JSON.stringify({ error: "invalid payload" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        // payment.captured  -> mark the shipment paid and release it for sealing
        // payment.failed    -> mark the payment failed so the sender can retry
        // refund.processed  -> mark the shipment refunded
        return new Response(JSON.stringify({ received: true, event }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
