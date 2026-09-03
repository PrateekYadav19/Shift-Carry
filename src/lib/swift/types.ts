export type Role = "SENDER" | "TRAVELER" | "ADMIN";
export type Tier = "EXPRESS" | "STANDARD";
export type TransportMode = "FLIGHT" | "TRAIN" | "BUS" | "CAR";

export const SHIPMENT_STATUSES = [
  "BOOKED",
  "VERIFIED_SEALED",
  "PICKED_UP_BY_PARTNER",
  "HANDED_TO_TRAVELER",
  "IN_TRANSIT",
  "ARRIVED_AT_DESTINATION",
  "DELIVERED",
] as const;

export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

export const STATUS_LABEL: Record<ShipmentStatus, string> = {
  BOOKED: "Booked",
  VERIFIED_SEALED: "Verified & Sealed",
  PICKED_UP_BY_PARTNER: "Picked up by local partner",
  HANDED_TO_TRAVELER: "Handed to traveler",
  IN_TRANSIT: "In transit",
  ARRIVED_AT_DESTINATION: "Arrived at destination",
  DELIVERED: "Delivered",
};

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string | undefined;
  role: Role;
  kycStatus: "NONE" | "PENDING" | "VERIFIED";
  createdAt: string;
}

export interface Journey {
  id: string;
  travelerId: string;
  travelerName: string;
  origin: string;
  destination: string;
  transportMode: TransportMode;
  departureAt: string;
  availableCapacityKg: number;
  payoutPerKgPaise: number;
}

export interface ShipmentEvent {
  id: string;
  shipmentId: string;
  type: ShipmentStatus | "PAYMENT" | "NOTE";
  note: string;
  createdAt: string;
}

export interface Payment {
  razorpayOrderId: string;
  razorpayPaymentId?: string | undefined;
  razorpaySignature?: string | undefined;
  status: "CREATED" | "CAPTURED" | "FAILED";
  amount: number;
  verifiedAt?: string | undefined;
}

export interface Shipment {
  id: string;
  senderId: string;
  senderName: string;
  recipientName: string;
  recipientPhone: string;
  pickupAddress: string;
  dropAddress: string;
  originCity: string;
  destinationCity: string;
  category: string;
  weightKg: number;
  tier: Tier;
  status: ShipmentStatus;
  sealId: string;
  priceInPaise: number;
  otp: string;
  flagged: boolean;
  matchedJourneyId?: string | undefined;
  /** Which of the Fastest / Balanced / Cheapest options the sender picked. */
  deliveryOption?: "FASTEST" | "BALANCED" | "CHEAPEST" | undefined;
  /** Promised delivery window in hours, from booking. */
  etaHours?: number | undefined;
  /** Name of the assigned traveller, once accepted. */
  travelerName?: string | undefined;
  payment: Payment;
  events: ShipmentEvent[];
  createdAt: string;
}
