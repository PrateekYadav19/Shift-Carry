import type { Shipment, Tier } from "./types";

/* ------------------------------------------------------------------ *
 * Payment / settlement domain helpers.
 *
 * All rupee values produced here are ILLUSTRATIVE DEMO VALUES for the
 * prototype. Real amounts will come from the Razorpay Orders API once
 * RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are configured on the server.
 * ------------------------------------------------------------------ */

export type SettlementStatus = "PENDING" | "PROCESSING" | "COMPLETED";

export const SETTLEMENT_LABEL: Record<SettlementStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
};

export type DeliveryOptionId = "FASTEST" | "BALANCED" | "CHEAPEST";

export interface DeliveryOption {
  id: DeliveryOptionId;
  label: string;
  tier: Tier;
  mode: "Flight traveller" | "Train traveller" | "Bus traveller";
  pricePaise: number;
  etaHours: number;
  reliability: number; // 0-100
  note: string;
}

/**
 * Demo delivery options for a route/weight. Prices scale with weight so the
 * prototype still feels alive, but the anchors match the demo spec
 * (Fastest ~₹2,400 · Balanced ~₹1,600 · Cheapest ~₹700).
 */
export function deliveryOptions(weightKg: number): DeliveryOption[] {
  const w = Math.max(0.5, weightKg);
  const scale = 1 + (w - 1) * 0.22;
  const r = (n: number) => Math.round((n * scale) / 100) * 100;

  return [
    {
      id: "FASTEST",
      label: "Fastest",
      tier: "EXPRESS",
      mode: "Flight traveller",
      pricePaise: r(240000),
      etaHours: 17,
      reliability: 98,
      note: "A flyer already checked in on this exact corridor. Same-day doorstep.",
    },
    {
      id: "BALANCED",
      label: "Balanced",
      tier: "EXPRESS",
      mode: "Flight traveller",
      pricePaise: r(160000),
      etaHours: 21,
      reliability: 95,
      note: "Later departure, same 24-hour promise, noticeably cheaper.",
    },
    {
      id: "CHEAPEST",
      label: "Cheapest",
      tier: "STANDARD",
      mode: "Train traveller",
      pricePaise: r(70000),
      etaHours: 28,
      reliability: 91,
      note: "Overnight train capacity — still twice as fast as a courier.",
    },
  ];
}

export interface AiPreference {
  priority: "speed" | "cost" | "balanced";
  deadlineHours?: number | undefined;
  budgetPaise?: number | undefined;
}

/** Tiny scoring model standing in for the AI matcher. */
export function recommendOption(
  options: DeliveryOption[],
  pref: AiPreference,
): { option: DeliveryOption; reason: string } {
  const scored = options.map((o) => {
    let score = o.reliability;
    if (pref.priority === "speed") score += (48 - o.etaHours) * 3;
    if (pref.priority === "cost") score += (300000 - o.pricePaise) / 2000;
    if (pref.priority === "balanced")
      score += (48 - o.etaHours) * 1.4 + (300000 - o.pricePaise) / 4000;
    if (pref.deadlineHours && o.etaHours > pref.deadlineHours) score -= 120;
    if (pref.budgetPaise && o.pricePaise > pref.budgetPaise) score -= 90;
    return { o, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0]!.o;

  const bits: string[] = [];
  if (pref.deadlineHours) bits.push(`your ${pref.deadlineHours}h deadline`);
  if (pref.budgetPaise) bits.push(`a ₹${Math.round(pref.budgetPaise / 100)} budget`);
  bits.push(
    pref.priority === "speed"
      ? "speed over price"
      : pref.priority === "cost"
        ? "price over speed"
        : "a balance of speed and price",
  );

  return {
    option: best,
    reason: `Matched against ${bits.join(", ")} — plus traveller availability, capacity for the weight and route reliability.`,
  };
}

export interface PayoutSplit {
  customerPaysPaise: number;
  pickupPartnerPaise: number;
  travellerRewardPaise: number;
  destinationDeliveryPaise: number;
  insurancePaise: number;
  platformFeePaise: number;
}

/**
 * Illustrative split of what the customer pays between the people who move
 * the parcel. Percentages are demo values, not a live settlement schedule.
 */
export function payoutSplit(totalPaise: number): PayoutSplit {
  const pickup = Math.round(totalPaise * 0.1);
  const traveller = Math.round(totalPaise * 0.25);
  const destination = Math.round(totalPaise * 0.1);
  const insurance = Math.round(totalPaise * 0.025);
  return {
    customerPaysPaise: totalPaise,
    pickupPartnerPaise: pickup,
    travellerRewardPaise: traveller,
    destinationDeliveryPaise: destination,
    insurancePaise: insurance,
    platformFeePaise: totalPaise - pickup - traveller - destination - insurance,
  };
}

export function travellerReward(totalPaise: number) {
  return payoutSplit(totalPaise).travellerRewardPaise;
}

/** Settlement status is derived from payment + custody state. */
export function settlementStatus(shipment: Shipment): SettlementStatus {
  if (shipment.payment.status !== "CAPTURED") return "PENDING";
  if (shipment.status === "DELIVERED") return "COMPLETED";
  return "PROCESSING";
}

export interface PaymentStep {
  label: string;
  done: boolean;
}

export function paymentSteps(shipment: Shipment): PaymentStep[] {
  const paid = shipment.payment.status === "CAPTURED";
  const order = SHIPMENT_ORDER.indexOf(shipment.status);
  return [
    { label: "Order Created", done: true },
    { label: "Razorpay Payment Initiated", done: paid || shipment.payment.status === "FAILED" },
    { label: "Payment Successful", done: paid },
    { label: "Shipment Confirmed", done: paid && order >= 1 },
    { label: "Traveller Assigned", done: Boolean(shipment.matchedJourneyId) && order >= 2 },
  ];
}

const SHIPMENT_ORDER = [
  "BOOKED",
  "VERIFIED_SEALED",
  "PICKED_UP_BY_PARTNER",
  "HANDED_TO_TRAVELER",
  "IN_TRANSIT",
  "ARRIVED_AT_DESTINATION",
  "DELIVERED",
] as const;

/** Lifecycle rail that links the payment to every custody handoff. */
export function lifecycleStages(shipment: Shipment) {
  const i = SHIPMENT_ORDER.indexOf(shipment.status);
  const paid = shipment.payment.status === "CAPTURED";
  return [
    { label: "Customer payment", done: paid },
    { label: "Shipment verification", done: i >= 1 },
    { label: "Traveller assignment", done: Boolean(shipment.matchedJourneyId) && i >= 1 },
    { label: "Pickup", done: i >= 2 },
    { label: "Handoff", done: i >= 3 },
    { label: "In transit", done: i >= 4 },
    { label: "Delivery", done: i >= 6 },
    {
      label: `Traveller reward · ${SETTLEMENT_LABEL[settlementStatus(shipment)]}`,
      done: settlementStatus(shipment) === "COMPLETED",
    },
  ];
}

export function etaLabel(hours: number) {
  if (hours <= 24) return "Under 24 hours";
  return `About ${Math.round(hours)} hours`;
}
