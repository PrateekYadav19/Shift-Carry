import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteNav, SiteFooter } from "@/components/swift/site-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  createShipment,
  inr,
  markPaid,
  matchJourneys,
  mutateShipment,
  quote,
  type DraftShipment,
} from "@/lib/swift/store";
import {
  deliveryOptions,
  etaLabel,
  recommendOption,
  travellerReward,
  type AiPreference,
  type DeliveryOption,
  type DeliveryOptionId,
} from "@/lib/swift/payments";
import {
  DemoTag,
  PaymentStatusCard,
  PayoutBreakdown,
  PoweredByRazorpay,
  RazorpayMark,
} from "@/components/swift/razorpay";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/lib/swift/razorpay.functions";
import type { Shipment } from "@/lib/swift/types";
import { toast } from "sonner";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CopyIcon,
  Gauge,
  Loader2,
  Lock,
  Package,
  Plane,
  Scale,
  Sparkles,
  ShieldCheck,
  Train,
  Wallet,
} from "lucide-react";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a parcel delivery | SwiftCarry" },
      {
        name: "description",
        content:
          "Book a crowd-shipped delivery in four steps: parcel details, AI traveller matching with Fastest / Balanced / Cheapest options, and secure checkout powered by the Razorpay API.",
      },
      { property: "og:title", content: "Book a parcel delivery | SwiftCarry" },
      {
        property: "og:description",
        content:
          "AI-matched travellers, tamper-sealed parcels and digital payments designed for the Razorpay API.",
      },
    ],
  }),
  component: BookPage,
});

const categories = ["Documents", "Electronics", "Clothing", "Gifts", "Medicines", "Other"];
const DRAFT_KEY = "swiftcarry.prefill";

const empty: DraftShipment = {
  recipientName: "",
  recipientPhone: "",
  pickupAddress: "",
  dropAddress: "",
  originCity: "",
  destinationCity: "",
  category: "Documents",
  weightKg: 1,
  tier: "EXPRESS",
};

type PayPhase = "idle" | "creating" | "checkout" | "verifying" | "done";

const DEMO_SEQUENCE = [
  "Payment successful",
  "Traveller assigned",
  "Parcel verified & sealed",
  "Shipment in transit",
  "Delivered",
];

function BookPage() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<DraftShipment>(empty);
  const [shipment, setShipment] = useState<Shipment | null>(null);

  /* AI preference inputs */
  const [priority, setPriority] = useState<AiPreference["priority"]>("balanced");
  const [deadlineHours, setDeadlineHours] = useState(24);
  const [budget, setBudget] = useState(2500);
  const [picked, setPicked] = useState<DeliveryOptionId | null>(null);

  /* payment */
  const [phase, setPhase] = useState<PayPhase>("idle");
  const [order, setOrder] = useState<{ orderId: string; demo: boolean } | null>(null);
  const [seqStep, setSeqStep] = useState(0);

  useEffect(() => {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const p = JSON.parse(raw) as Partial<DraftShipment>;
      setDraft((d) => ({ ...d, ...p }));
      window.localStorage.removeItem(DRAFT_KEY);
      toast.success("Carry filled in your booking details");
    } catch {
      /* ignore */
    }
  }, []);

  const options = useMemo(() => deliveryOptions(draft.weightKg), [draft.weightKg]);
  const advice = useMemo(
    () =>
      recommendOption(options, {
        priority,
        deadlineHours,
        budgetPaise: budget * 100,
      }),
    [options, priority, deadlineHours, budget],
  );

  const selected: DeliveryOption =
    options.find((o) => o.id === picked) ?? advice.option;

  const q = useMemo(() => quote({ ...draft, tier: selected.tier }), [draft, selected.tier]);
  const matches = useMemo(
    () => matchJourneys(draft.originCity, draft.destinationCity, selected.tier, draft.weightKg),
    [draft, selected.tier],
  );

  const set = <K extends keyof DraftShipment>(k: K, v: DraftShipment[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const canContinue =
    draft.recipientName.trim().length > 1 &&
    draft.recipientPhone.replace(/\D/g, "").length >= 10 &&
    draft.pickupAddress.trim().length > 5 &&
    draft.dropAddress.trim().length > 5 &&
    draft.originCity.trim().length > 1 &&
    draft.destinationCity.trim().length > 1 &&
    draft.weightKg > 0;

  /** Step 2 → create the Razorpay order server-side, then show checkout. */
  const goToPayment = async () => {
    setPhase("creating");
    try {
      const receipt = `rcpt_${Date.now().toString(36)}`;
      const res = await createRazorpayOrder({
        data: {
          amountPaise: selected.pricePaise,
          receipt,
          route: `${draft.originCity} → ${draft.destinationCity}`,
        },
      });
      const s = createShipment({ ...draft, tier: selected.tier }, selected.pricePaise, {
        orderId: res.orderId,
        deliveryOption: selected.id,
        etaHours: selected.etaHours,
      });
      setOrder({ orderId: res.orderId, demo: res.demo });
      setShipment(s);
      setPhase("checkout");
      setStep(2);
    } catch {
      setPhase("idle");
      toast.error("Could not create the payment order. Please try again.");
    }
  };

  /** Razorpay checkout → server-side signature verification → capture. */
  const pay = async () => {
    if (!shipment || !order) return;
    setPhase("verifying");
    try {
      const res = await verifyRazorpayPayment({
        data: { orderId: order.orderId, paymentId: "", signature: "" },
      });
      if (!res.verified) {
        setPhase("checkout");
        toast.error("Payment signature rejected");
        return;
      }
      markPaid(shipment.id, {
        razorpayPaymentId: res.paymentId,
        razorpaySignature: res.signature,
      });
      setShipment((s) =>
        s
          ? {
              ...s,
              status: "VERIFIED_SEALED",
              payment: {
                ...s.payment,
                status: "CAPTURED",
                razorpayPaymentId: res.paymentId,
                razorpaySignature: res.signature,
              },
            }
          : s,
      );
      setPhase("done");
      setStep(3);
      setSeqStep(1);
      toast.success("Payment successful", { description: res.message });
    } catch {
      setPhase("checkout");
      toast.error("Payment could not be completed");
    }
  };

  /* Smooth demo sequence on the confirmation screen. */
  useEffect(() => {
    if (step !== 3 || seqStep === 0 || seqStep >= DEMO_SEQUENCE.length) return;
    const t = setTimeout(() => setSeqStep((n) => n + 1), 1400);
    return () => clearTimeout(t);
  }, [step, seqStep]);

  useEffect(() => {
    if (!shipment || step !== 3) return;
    if (seqStep === 2 && matches[0]) {
      mutateShipment(shipment.id, (x) => ({
        ...x,
        matchedJourneyId: matches[0]!.id,
        travelerName: matches[0]!.travelerName,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seqStep, step]);

  const steps = ["Parcel details", "AI options", "Razorpay payment", "Confirmed"];

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="hero-bg min-h-[80vh]">
        <div className="mx-auto w-full max-w-5xl px-5 py-12">
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-3xl font-bold sm:text-4xl">Send a parcel</h1>
              <PoweredByRazorpay />
            </div>
            <p className="mt-2 text-muted-foreground">
              Four short steps. Or just ask Carry, our assistant, in the bottom-right corner.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Progress value={((step + 1) / 4) * 100} className="h-1.5" />
              <span className="shrink-0 text-xs text-muted-foreground">
                Step {step + 1} of 4 · {steps[step]}
              </span>
            </div>
          </div>

          {/* ---------------- STEP 0 · DETAILS ---------------- */}
          {step === 0 && (
            <div className="surface-glass rounded-3xl p-6 sm:p-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="rn">Recipient name</Label>
                  <Input
                    id="rn"
                    maxLength={80}
                    className="mt-1.5 h-11"
                    value={draft.recipientName}
                    onChange={(e) => set("recipientName", e.target.value)}
                    placeholder="Ananya Iyer"
                  />
                </div>
                <div>
                  <Label htmlFor="rp">Recipient phone</Label>
                  <Input
                    id="rp"
                    maxLength={15}
                    className="mt-1.5 h-11"
                    value={draft.recipientPhone}
                    onChange={(e) => set("recipientPhone", e.target.value)}
                    placeholder="+91 98200 11223"
                  />
                </div>
                <div>
                  <Label htmlFor="oc">Pickup city</Label>
                  <Input
                    id="oc"
                    maxLength={40}
                    className="mt-1.5 h-11"
                    value={draft.originCity}
                    onChange={(e) => set("originCity", e.target.value)}
                    placeholder="Greater Noida"
                  />
                </div>
                <div>
                  <Label htmlFor="dc">Drop city</Label>
                  <Input
                    id="dc"
                    maxLength={40}
                    className="mt-1.5 h-11"
                    value={draft.destinationCity}
                    onChange={(e) => set("destinationCity", e.target.value)}
                    placeholder="Bengaluru"
                  />
                </div>
                <div className="sm:col-span-1">
                  <Label htmlFor="pa">Pickup address</Label>
                  <Textarea
                    id="pa"
                    maxLength={200}
                    className="mt-1.5"
                    value={draft.pickupAddress}
                    onChange={(e) => set("pickupAddress", e.target.value)}
                    placeholder="Knowledge Park II, Greater Noida"
                  />
                </div>
                <div>
                  <Label htmlFor="da">Drop address</Label>
                  <Textarea
                    id="da"
                    maxLength={200}
                    className="mt-1.5"
                    value={draft.dropAddress}
                    onChange={(e) => set("dropAddress", e.target.value)}
                    placeholder="Indiranagar, Bengaluru"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Parcel category</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => set("category", c)}
                        className={`rounded-full border px-4 py-2 text-sm transition-all ${
                          draft.category === c
                            ? "border-primary/60 bg-primary/10 text-foreground"
                            : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="w">Approximate weight — {draft.weightKg} kg</Label>
                  <input
                    id="w"
                    type="range"
                    min={0.5}
                    max={15}
                    step={0.5}
                    value={draft.weightKg}
                    onChange={(e) => set("weightKg", Number(e.target.value))}
                    className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
                  />
                </div>
              </div>
              <div className="mt-7 flex justify-end">
                <Button variant="hero" size="lg" disabled={!canContinue} onClick={() => setStep(1)}>
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ---------------- STEP 1 · AI OPTIONS ---------------- */}
          {step === 1 && (
            <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
              <div className="space-y-4">
                <div className="surface-glass rounded-3xl p-6">
                  <p className="flex items-center gap-2 font-display text-base font-semibold">
                    <Sparkles className="h-4 w-4 text-primary" /> What matters most for this parcel?
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {(
                      [
                        ["speed", "Speed", Gauge],
                        ["balanced", "Balanced", Scale],
                        ["cost", "Cost", Wallet],
                      ] as const
                    ).map(([v, label, Icon]) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => {
                          setPriority(v);
                          setPicked(null);
                        }}
                        className={`flex flex-col items-center gap-1.5 rounded-2xl border py-3 text-xs transition-all ${
                          priority === v
                            ? "border-primary/60 bg-primary/10 text-foreground"
                            : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="dl">Deadline — {deadlineHours}h</Label>
                      <input
                        id="dl"
                        type="range"
                        min={12}
                        max={72}
                        step={1}
                        value={deadlineHours}
                        onChange={(e) => {
                          setDeadlineHours(Number(e.target.value));
                          setPicked(null);
                        }}
                        className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bg">Budget — ₹{budget}</Label>
                      <input
                        id="bg"
                        type="range"
                        min={500}
                        max={4000}
                        step={100}
                        value={budget}
                        onChange={(e) => {
                          setBudget(Number(e.target.value));
                          setPicked(null);
                        }}
                        className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
                      />
                    </div>
                  </div>
                  <p className="mt-4 rounded-2xl border border-primary/25 bg-primary/8 p-4 text-sm">
                    <span className="font-semibold text-primary">AI recommends {advice.option.label}.</span>{" "}
                    {advice.reason}
                  </p>
                </div>

                {options.map((o) => {
                  const active = selected.id === o.id;
                  const isPick = advice.option.id === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setPicked(o.id)}
                      className={`w-full rounded-3xl border p-6 text-left transition-all ${
                        active
                          ? "border-primary/60 bg-primary/8 glow"
                          : "border-border bg-card/60 hover:border-border/90"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary">
                            {o.tier === "EXPRESS" ? (
                              <Plane className="h-5 w-5 text-primary" />
                            ) : (
                              <Train className="h-5 w-5 text-accent" />
                            )}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 font-display text-lg font-semibold uppercase">
                              {o.label}
                              {isPick && (
                                <Badge variant="secondary" className="text-[10px]">
                                  AI pick
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {o.mode} · {o.etaHours} hours · {o.reliability}% on-time
                            </p>
                            <p className="mt-1 max-w-sm text-xs text-muted-foreground">{o.note}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-xl font-bold">{inr(o.pricePaise)}</p>
                          <p className="text-xs text-muted-foreground">{etaLabel(o.etaHours)}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}

                <div className="surface-glass rounded-3xl p-6">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="h-4 w-4 text-primary" /> Live traveller matches
                  </p>
                  {matches.length === 0 ? (
                    <p className="mt-3 text-sm text-muted-foreground">
                      No traveller on this exact route yet — we'll broadcast your request to the
                      network and match within minutes of booking.
                    </p>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {matches.slice(0, 3).map((m) => (
                        <li
                          key={m.id}
                          className="flex items-center justify-between rounded-xl border border-border/70 bg-secondary/30 px-4 py-3 text-sm"
                        >
                          <span>
                            {m.travelerName} · {m.origin} → {m.destination}
                            <span className="block text-xs text-muted-foreground">
                              {m.transportMode.toLowerCase()} ·{" "}
                              {new Date(m.departureAt).toLocaleString("en-IN", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </span>
                          </span>
                          <Badge variant="secondary">{m.availableCapacityKg} kg free</Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <aside className="surface-glass h-fit rounded-3xl p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold">Payment summary</h2>
                  <DemoTag />
                </div>
                <dl className="mt-4 space-y-2.5 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Shipment</dt>
                    <dd className="text-right">
                      {draft.originCity} → {draft.destinationCity}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Parcel</dt>
                    <dd>
                      {draft.weightKg} kg · {draft.category}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Delivery option</dt>
                    <dd>
                      Traveller capacity ·{" "}
                      {selected.tier === "EXPRESS" ? "Express" : "Standard"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Estimated delivery</dt>
                    <dd>{etaLabel(selected.etaHours)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-border pt-3 font-display text-lg font-bold">
                    <dt>Total</dt>
                    <dd>{inr(selected.pricePaise)}</dd>
                  </div>
                </dl>
                <p className="mt-3 rounded-xl bg-success/10 px-3 py-2 text-xs text-success">
                  A traditional courier would charge about {inr(q.courier)} and take 5–6 days.
                </p>
                <p className="mt-2 rounded-xl bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
                  Traveller reward on this shipment:{" "}
                  <span className="text-foreground">{inr(travellerReward(selected.pricePaise))}</span>
                </p>
                <Button
                  variant="hero"
                  size="lg"
                  className="mt-5 w-full"
                  disabled={phase === "creating"}
                  onClick={() => void goToPayment()}
                >
                  {phase === "creating" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Creating order…
                    </>
                  ) : (
                    <>
                      <RazorpayMark className="h-4 w-4" /> Pay securely with Razorpay
                    </>
                  )}
                </Button>
                <Button variant="ghost" className="mt-2 w-full" onClick={() => setStep(0)}>
                  Back
                </Button>
              </aside>
            </div>
          )}

          {/* ---------------- STEP 2 · RAZORPAY CHECKOUT ---------------- */}
          {step === 2 && shipment && (
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="surface-glass overflow-hidden rounded-3xl">
                <div className="flex items-center justify-between border-b border-border/70 bg-secondary/30 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <RazorpayMark className="h-7 w-7" />
                    <div>
                      <p className="font-display text-base font-semibold">Razorpay Checkout</p>
                      <p className="text-xs text-muted-foreground">
                        {order?.demo
                          ? "Demo mode · connect test keys for the live test API"
                          : "Razorpay test environment"}
                      </p>
                    </div>
                  </div>
                  <DemoTag>{order?.demo ? "Demo" : "Test mode"}</DemoTag>
                </div>

                <div className="p-6 sm:p-8">
                  <dl className="space-y-3 text-sm">
                    {[
                      ["Shipment", `${shipment.originCity} → ${shipment.destinationCity}`],
                      ["Parcel", `${shipment.weightKg} KG · ${shipment.category}`],
                      [
                        "Delivery option",
                        `Traveller capacity · ${selected.label}`,
                      ],
                      ["Estimated delivery", etaLabel(selected.etaHours)],
                      ["Shipment ID", shipment.id],
                      ["Order ID", shipment.payment.razorpayOrderId],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">{k}</dt>
                        <dd className="truncate text-right">{v}</dd>
                      </div>
                    ))}
                    <div className="flex items-baseline justify-between border-t border-border pt-4">
                      <dt className="font-display text-lg">Total</dt>
                      <dd className="font-display text-3xl font-bold">
                        {inr(shipment.priceInPaise)}
                      </dd>
                    </div>
                  </dl>

                  <Button
                    variant="hero"
                    size="xl"
                    className="mt-7 w-full"
                    disabled={phase === "verifying"}
                    onClick={() => void pay()}
                  >
                    {phase === "verifying" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Verifying signature…
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" /> Pay {inr(shipment.priceInPaise)} with Razorpay
                      </>
                    )}
                  </Button>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <PoweredByRazorpay />
                    <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                      Change option
                    </Button>
                  </div>

                  <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    The order is created on the server with your Razorpay key, and the payment is
                    only marked captured after an HMAC SHA256 signature check — the client callback
                    is never trusted on its own.
                  </p>
                </div>
              </div>

              <PayoutBreakdown totalPaise={shipment.priceInPaise} title="Payment breakdown" />
            </div>
          )}

          {/* ---------------- STEP 3 · CONFIRMED ---------------- */}
          {step === 3 && shipment && (
            <div className="space-y-6">
              <div className="surface-glass rounded-3xl p-8 text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
                  <Check className="h-8 w-8" />
                </span>
                <h2 className="mt-5 font-display text-2xl font-bold">Payment successful</h2>
                <p className="mt-2 text-muted-foreground">
                  Drop your parcel at the nearest verification point — we'll scan, seal and hand it
                  to your matched traveller.
                </p>

                <ol className="mx-auto mt-7 grid max-w-2xl gap-2 sm:grid-cols-5">
                  {DEMO_SEQUENCE.map((label, i) => {
                    const done = seqStep > i;
                    return (
                      <li
                        key={label}
                        className={`rounded-2xl border px-3 py-3 text-xs transition-all duration-500 ${
                          done
                            ? "border-success/40 bg-success/10 text-success"
                            : "border-border bg-secondary/30 text-muted-foreground"
                        }`}
                      >
                        {done ? <Check className="mx-auto mb-1 h-3.5 w-3.5" /> : null}
                        {label}
                      </li>
                    );
                  })}
                </ol>

                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                    <p className="text-xs text-muted-foreground">Shipment ID</p>
                    <p className="font-mono text-lg font-semibold">{shipment.id}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                    <p className="text-xs text-muted-foreground">Payment ID</p>
                    <p className="truncate font-mono text-lg font-semibold">
                      {shipment.payment.razorpayPaymentId}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                    <p className="text-xs text-muted-foreground">Tamper seal</p>
                    <p className="font-mono text-lg font-semibold">{shipment.sealId}</p>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl border border-primary/30 bg-primary/8 p-4 text-left">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <BadgeCheck className="h-4 w-4 text-primary" /> Recipient delivery OTP
                  </p>
                  <p className="mt-1 font-mono text-2xl font-bold tracking-[0.3em]">
                    {shipment.otp}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Share only with {shipment.recipientName} at handover.
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <Button asChild variant="hero" size="lg">
                    <Link to="/track" search={{ id: shipment.id }}>
                      Open tracking link
                    </Link>
                  </Button>
                  <Button asChild variant="outlineGlow" size="lg">
                    <Link to="/dashboard">Go to my dashboard</Link>
                  </Button>
                  <Button
                    variant="soft"
                    size="lg"
                    onClick={() => {
                      void navigator.clipboard?.writeText(shipment.id);
                      toast.success("Shipment ID copied");
                    }}
                  >
                    <CopyIcon className="h-4 w-4" /> Copy ID
                  </Button>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <PaymentStatusCard shipment={shipment} />
                <PayoutBreakdown totalPaise={shipment.priceInPaise} />
              </div>
            </div>
          )}

          {step === 2 && !shipment && (
            <p className="text-muted-foreground">
              <Package className="mr-2 inline h-4 w-4" /> Start a new booking above.
            </p>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
