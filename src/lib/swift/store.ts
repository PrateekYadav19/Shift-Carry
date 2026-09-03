import { useCallback, useEffect, useState } from "react";
import type {
  Journey,
  Payment,
  Shipment,
  ShipmentStatus,
  Tier,
  TransportMode,
  User,
} from "./types";
import { SHIPMENT_STATUSES } from "./types";

const KEY = "swiftcarry.db.v1";

interface DB {
  user: User | null;
  shipments: Shipment[];
  journeys: Journey[];
}

const rid = (p: string) =>
  `${p}-${Math.random().toString(36).slice(2, 7).toUpperCase()}${Date.now().toString(36).slice(-4).toUpperCase()}`;

const now = () => new Date().toISOString();

function seedJourneys(): Journey[] {
  const day = (n: number) => new Date(Date.now() + n * 864e5).toISOString();
  return [
    {
      id: "JRN-A1",
      travelerId: "u-priya",
      travelerName: "Priya Nair",
      origin: "Delhi",
      destination: "Mumbai",
      transportMode: "FLIGHT",
      departureAt: day(1),
      availableCapacityKg: 6,
      payoutPerKgPaise: 22000,
    },
    {
      id: "JRN-B2",
      travelerId: "u-arjun",
      travelerName: "Arjun Mehta",
      origin: "Delhi",
      destination: "Jaipur",
      transportMode: "TRAIN",
      departureAt: day(2),
      availableCapacityKg: 10,
      payoutPerKgPaise: 9000,
    },
    {
      id: "JRN-C3",
      travelerId: "u-sana",
      travelerName: "Sana Qureshi",
      origin: "Bengaluru",
      destination: "Hyderabad",
      transportMode: "BUS",
      departureAt: day(1),
      availableCapacityKg: 8,
      payoutPerKgPaise: 7500,
    },
    {
      id: "JRN-D4",
      travelerId: "u-vikram",
      travelerName: "Vikram Rao",
      origin: "Mumbai",
      destination: "Pune",
      transportMode: "CAR",
      departureAt: day(0.4),
      availableCapacityKg: 15,
      payoutPerKgPaise: 6000,
    },
    {
      id: "JRN-E5",
      travelerId: "u-neha",
      travelerName: "Neha Sharma",
      origin: "Kolkata",
      destination: "Delhi",
      transportMode: "FLIGHT",
      departureAt: day(0.8),
      availableCapacityKg: 4,
      payoutPerKgPaise: 24000,
    },
  ];
}

function seedShipment(): Shipment {
  const id = "SWC-9F2K4";
  return {
    id,
    senderId: "u-demo",
    senderName: "Rahul Verma",
    recipientName: "Ananya Iyer",
    recipientPhone: "+91 98200 11223",
    pickupAddress: "B-42, Connaught Place, New Delhi",
    dropAddress: "14 Carter Road, Bandra West, Mumbai",
    originCity: "Delhi",
    destinationCity: "Mumbai",
    category: "Documents",
    weightKg: 1.2,
    tier: "EXPRESS",
    status: "IN_TRANSIT",
    sealId: "SEAL-77213",
    priceInPaise: 68900,
    otp: "4417",
    flagged: false,
    matchedJourneyId: "JRN-A1",
    travelerName: "Priya Nair",
    deliveryOption: "FASTEST",
    etaHours: 17,
    payment: {
      razorpayOrderId: "order_demo_10482",
      razorpayPaymentId: "rzp_demo_10482",
      status: "CAPTURED",
      amount: 68900,
      verifiedAt: now(),
    },
    events: SHIPMENT_STATUSES.slice(0, 5).map((s, i) => ({
      id: `${id}-e${i}`,
      shipmentId: id,
      type: s,
      note: "Chain of custody updated",
      createdAt: new Date(Date.now() - (5 - i) * 36e5).toISOString(),
    })),
    createdAt: new Date(Date.now() - 6 * 36e5).toISOString(),
  };
}

const emptyDB = (): DB => ({
  user: null,
  shipments: [seedShipment()],
  journeys: seedJourneys(),
});

function read(): DB {
  if (typeof window === "undefined") return emptyDB();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyDB();
    return { ...emptyDB(), ...(JSON.parse(raw) as DB) };
  } catch {
    return emptyDB();
  }
}

function write(db: DB) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(db));
  window.dispatchEvent(new CustomEvent("swiftcarry:update"));
}

export function useDB() {
  const [db, setDb] = useState<DB>(() => emptyDB());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDb(read());
    setHydrated(true);
    const on = () => setDb(read());
    window.addEventListener("swiftcarry:update", on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener("swiftcarry:update", on);
      window.removeEventListener("storage", on);
    };
  }, []);

  const update = useCallback((fn: (d: DB) => DB) => {
    const next = fn(read());
    write(next);
    setDb(next);
    return next;
  }, []);

  return { db, hydrated, update };
}

/* ---------------- domain helpers ---------------- */

export function login(name: string, phone: string, role: User["role"]): User {
  const db = read();
  const user: User = {
    id: rid("USR"),
    name: name.trim() || "Guest",
    phone,
    role,
    kycStatus: role === "TRAVELER" ? "PENDING" : "NONE",
    createdAt: now(),
  };
  write({ ...db, user });
  return user;
}

export function logout() {
  write({ ...read(), user: null });
}

export function setKyc(status: User["kycStatus"]) {
  const db = read();
  if (!db.user) return;
  write({ ...db, user: { ...db.user, kycStatus: status } });
}

export function addJourney(j: Omit<Journey, "id" | "payoutPerKgPaise">) {
  const db = read();
  const payout: Record<TransportMode, number> = {
    FLIGHT: 22000,
    TRAIN: 9000,
    BUS: 7500,
    CAR: 6000,
  };
  const journey: Journey = { ...j, id: rid("JRN"), payoutPerKgPaise: payout[j.transportMode] };
  write({ ...db, journeys: [journey, ...db.journeys] });
  return journey;
}

export interface QuoteInput {
  originCity: string;
  destinationCity: string;
  weightKg: number;
  tier: Tier;
}

export function quote({ weightKg, tier }: QuoteInput) {
  const base = tier === "EXPRESS" ? 39900 : 17900;
  const perKg = tier === "EXPRESS" ? 18000 : 7000;
  const subtotal = base + Math.round(Math.max(0.5, weightKg) * perKg);
  const partnerFee = 6000;
  const insurance = 2900;
  const gst = Math.round((subtotal + partnerFee + insurance) * 0.18);
  const total = subtotal + partnerFee + insurance + gst;
  const courier = Math.round(total * (tier === "EXPRESS" ? 1.85 : 1.55));
  return { subtotal, partnerFee, insurance, gst, total, courier, saving: courier - total };
}

export function matchJourneys(origin: string, destination: string, tier: Tier, weightKg: number) {
  const modes: TransportMode[] = tier === "EXPRESS" ? ["FLIGHT"] : ["TRAIN", "BUS", "CAR"];
  return read()
    .journeys.filter(
      (j) =>
        j.origin.toLowerCase() === origin.trim().toLowerCase() &&
        j.destination.toLowerCase() === destination.trim().toLowerCase() &&
        modes.includes(j.transportMode) &&
        j.availableCapacityKg >= weightKg,
    )
    .sort((a, b) => +new Date(a.departureAt) - +new Date(b.departureAt));
}

export interface DraftShipment {
  recipientName: string;
  recipientPhone: string;
  pickupAddress: string;
  dropAddress: string;
  originCity: string;
  destinationCity: string;
  category: string;
  weightKg: number;
  tier: Tier;
}

export interface ShipmentMeta {
  orderId?: string | undefined;
  deliveryOption?: Shipment["deliveryOption"];
  etaHours?: number | undefined;
}

export function createShipment(
  draft: DraftShipment,
  priceInPaise: number,
  meta: ShipmentMeta = {},
): Shipment {
  const db = read();
  const id = rid("SWC");
  const match = matchJourneys(
    draft.originCity,
    draft.destinationCity,
    draft.tier,
    draft.weightKg,
  )[0];
  const shipment: Shipment = {
    ...draft,
    id,
    senderId: db.user?.id ?? "guest",
    senderName: db.user?.name ?? "Guest sender",
    status: "BOOKED",
    sealId: rid("SEAL"),
    priceInPaise,
    otp: String(Math.floor(1000 + Math.random() * 9000)),
    flagged: false,
    matchedJourneyId: match?.id,
    travelerName: match?.travelerName,
    deliveryOption: meta.deliveryOption,
    etaHours: meta.etaHours,
    payment: {
      razorpayOrderId: meta.orderId ?? `order_demo_${Math.random().toString(36).slice(2, 10)}`,
      status: "CREATED",
      amount: priceInPaise,
    },
    events: [
      {
        id: rid("EVT"),
        shipmentId: id,
        type: "BOOKED",
        note: "Shipment booked. Razorpay order created (test mode).",
        createdAt: now(),
      },
    ],
    createdAt: now(),
  };
  write({ ...db, shipments: [shipment, ...db.shipments] });
  return shipment;
}

export function mutateShipment(id: string, fn: (s: Shipment) => Shipment) {
  const db = read();
  write({ ...db, shipments: db.shipments.map((s) => (s.id === id ? fn(s) : s)) });
}

export function addEvent(id: string, type: ShipmentStatus | "PAYMENT" | "NOTE", note: string) {
  mutateShipment(id, (s) => ({
    ...s,
    status: (SHIPMENT_STATUSES as readonly string[]).includes(type)
      ? (type as ShipmentStatus)
      : s.status,
    events: [
      ...s.events,
      { id: rid("EVT"), shipmentId: id, type, note, createdAt: now() },
    ],
  }));
}

export function markPaid(id: string, payment: Partial<Payment>) {
  mutateShipment(id, (s) => ({
    ...s,
    payment: { ...s.payment, ...payment, status: "CAPTURED", verifiedAt: now() } as Payment,
    status: "VERIFIED_SEALED",
    events: [
      ...s.events,
      {
        id: rid("EVT"),
        shipmentId: id,
        type: "PAYMENT",
        note: `Payment captured & signature verified server-side (${payment.razorpayPaymentId ?? "pay_test"}).`,
        createdAt: now(),
      },
      {
        id: rid("EVT"),
        shipmentId: id,
        type: "VERIFIED_SEALED",
        note: "Parcel scanned at verification point and tamper-sealed.",
        createdAt: now(),
      },
    ],
  }));
}

export function advance(id: string) {
  const s = read().shipments.find((x) => x.id === id);
  if (!s) return;
  const i = SHIPMENT_STATUSES.indexOf(s.status);
  if (i < 0 || i >= SHIPMENT_STATUSES.length - 1) return;
  const next = SHIPMENT_STATUSES[i + 1]!;
  addEvent(id, next, "Custody checkpoint confirmed.");
}

export function getShipment(id: string) {
  return read().shipments.find((s) => s.id.toUpperCase() === id.trim().toUpperCase());
}

export const inr = (paise: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
    .format(paise / 100);
