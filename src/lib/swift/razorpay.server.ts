/* ------------------------------------------------------------------ *
 * Razorpay integration layer (server only).
 *
 *   createOrder(...)    -> Razorpay Orders API
 *   verifyPayment(...)  -> HMAC SHA256 signature verification
 *
 * Credentials come from environment variables and are NEVER exposed to
 * the browser:
 *   RAZORPAY_KEY_ID
 *   RAZORPAY_KEY_SECRET
 *
 * When the credentials are absent the module runs in DEMO mode and
 * returns deterministic mock objects so the prototype UI stays fully
 * functional. Swapping in real test-mode keys is enough to make the
 * exact same code paths hit the live Razorpay test API.
 * ------------------------------------------------------------------ */

import { createHmac, timingSafeEqual } from "crypto";

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  demo: boolean;
  keyId: string | null;
}

export interface VerifyResult {
  verified: boolean;
  paymentId: string;
  signature: string;
  demo: boolean;
  message: string;
}

function credentials() {
  const keyId = process.env["RAZORPAY_KEY_ID"] ?? "";
  const keySecret = process.env["RAZORPAY_KEY_SECRET"] ?? "";
  return { keyId, keySecret, live: Boolean(keyId && keySecret) };
}

export function isConfigured() {
  return credentials().live;
}

const demoId = (prefix: string) =>
  `${prefix}_demo_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;

/** POST https://api.razorpay.com/v1/orders */
export async function createOrder(params: {
  amountPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const { keyId, keySecret, live } = credentials();

  if (!live) {
    return {
      id: demoId("order"),
      amount: params.amountPaise,
      currency: "INR",
      receipt: params.receipt,
      status: "created",
      demo: true,
      keyId: null,
    };
  }

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
    },
    body: JSON.stringify({
      amount: params.amountPaise,
      currency: "INR",
      receipt: params.receipt,
      notes: params.notes ?? {},
    }),
  });

  if (!res.ok) {
    throw new Error(`Razorpay order creation failed (${res.status})`);
  }

  const order = (await res.json()) as {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
  };

  return { ...order, demo: false, keyId };
}

/** HMAC SHA256 of `${order_id}|${payment_id}` keyed with the key secret. */
export function verifyPayment(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): VerifyResult {
  const { keySecret, live } = credentials();

  if (!live) {
    return {
      verified: true,
      paymentId: params.paymentId || demoId("pay"),
      signature: params.signature || demoId("sig"),
      demo: true,
      message: "Demo mode: signature check simulated. Configure Razorpay keys for real verification.",
    };
  }

  const expected = createHmac("sha256", keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(params.signature);
  const verified = a.length === b.length && timingSafeEqual(a, b);

  return {
    verified,
    paymentId: params.paymentId,
    signature: params.signature,
    demo: false,
    message: verified
      ? "Signature verified with HMAC SHA256."
      : "Signature mismatch — payment rejected.",
  };
}

/** Webhook body verification for payment.captured / payment.failed. */
export function verifyWebhook(rawBody: string, signature: string) {
  const secret = process.env["RAZORPAY_WEBHOOK_SECRET"] ?? "";
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
