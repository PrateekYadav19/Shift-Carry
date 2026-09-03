import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/* Typed RPC in front of the Razorpay integration layer.
 * The secret key never leaves the server: only order ids, the public
 * key id and verification results are returned to the browser. */

const orderInput = z.object({
  amountPaise: z.number().int().positive().max(100000000),
  receipt: z.string().min(1).max(40),
  route: z.string().max(120).optional(),
});

export const createRazorpayOrder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => orderInput.parse(d))
  .handler(async ({ data }) => {
    const { createOrder } = await import("./razorpay.server");
    const order = await createOrder({
      amountPaise: data.amountPaise,
      receipt: data.receipt,
      notes: data.route ? { route: data.route } : {},
    });
    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: order.keyId,
      demo: order.demo,
    };
  });

const verifyInput = z.object({
  orderId: z.string().min(1).max(80),
  paymentId: z.string().max(80).default(""),
  signature: z.string().max(200).default(""),
});

export const verifyRazorpayPayment = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => verifyInput.parse(d))
  .handler(async ({ data }) => {
    const { verifyPayment } = await import("./razorpay.server");
    return verifyPayment(data);
  });
