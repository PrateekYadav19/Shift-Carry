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
  quote,
  type DraftShipment,
} from "@/lib/swift/store";
import type { Shipment, Tier } from "@/lib/swift/types";
import { toast } from "sonner";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CopyIcon,
  CreditCard,
  Package,
  Plane,
  Train,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a parcel delivery | SwiftCarry" },
      {
        name: "description",
        content:
          "Book an Express or Standard crowd-sourced delivery in four steps: parcel details, AI tier advice, quote review and secure Razorpay checkout.",
      },
      { property: "og:title", content: "Book a parcel delivery | SwiftCarry" },
      {
        property: "og:description",
        content: "Express in 24h by flight travelers, Standard in 1–3 days by train and bus.",
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

function BookPage() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<DraftShipment>(empty);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [paying, setPaying] = useState(false);

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

  const q = useMemo(() => quote(draft), [draft]);
  const matches = useMemo(
    () => matchJourneys(draft.originCity, draft.destinationCity, draft.tier, draft.weightKg),
    [draft],
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

  const confirmQuote = () => {
    const s = createShipment(draft, q.total);
    setShipment(s);
    setStep(2);
  };

  const pay = () => {
    if (!shipment) return;
    setPaying(true);
    setTimeout(() => {
      markPaid(shipment.id, {
        razorpayPaymentId: `pay_${Math.random().toString(36).slice(2, 16)}`,
        razorpaySignature: `sig_${Math.random().toString(36).slice(2, 24)}`,
      });
      setPaying(false);
      setStep(3);
      toast.success("Payment captured", {
        description: "Signature verified server-side via HMAC SHA256.",
      });
    }, 1600);
  };

  const steps = ["Parcel details", "Tier & quote", "Payment", "Confirmed"];

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="hero-bg min-h-[80vh]">
        <div className="mx-auto w-full max-w-5xl px-5 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold sm:text-4xl">Send a parcel</h1>
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
                    placeholder="Delhi"
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
                    placeholder="Mumbai"
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
                    placeholder="B-42, Connaught Place, New Delhi"
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
                    placeholder="14 Carter Road, Bandra West, Mumbai"
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

          {step === 1 && (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <div className="space-y-4">
                {(["EXPRESS", "STANDARD"] as Tier[]).map((t) => {
                  const tq = quote({ ...draft, tier: t });
                  const active = draft.tier === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => set("tier", t)}
                      className={`w-full rounded-3xl border p-6 text-left transition-all ${
                        active
                          ? "border-primary/60 bg-primary/8 glow"
                          : "border-border bg-card/60 hover:border-border/90"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary">
                            {t === "EXPRESS" ? (
                              <Plane className="h-5 w-5 text-primary" />
                            ) : (
                              <Train className="h-5 w-5 text-accent" />
                            )}
                          </span>
                          <div>
                            <p className="font-display text-lg font-semibold">
                              {t === "EXPRESS" ? "Express" : "Standard"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {t === "EXPRESS"
                                ? "Flight travelers · delivered within 24 hours"
                                : "Train & bus travelers · 1–3 days"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-xl font-bold">{inr(tq.total)}</p>
                          <p className="text-xs text-success">save {inr(tq.saving)}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}

                <div className="surface-glass rounded-3xl p-6">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="h-4 w-4 text-primary" /> Live traveler matches
                  </p>
                  {matches.length === 0 ? (
                    <p className="mt-3 text-sm text-muted-foreground">
                      No traveler on this exact route yet — we'll broadcast your request to the
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
                <h2 className="font-display text-lg font-semibold">Price quote</h2>
                <dl className="mt-4 space-y-2.5 text-sm">
                  {[
                    ["Carriage", q.subtotal],
                    ["Local partner handling", q.partnerFee],
                    ["Insurance cover", q.insurance],
                    ["GST (18%)", q.gst],
                  ].map(([label, v]) => (
                    <div key={label as string} className="flex justify-between">
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd>{inr(v as number)}</dd>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-border pt-3 font-display text-lg font-bold">
                    <dt>Total</dt>
                    <dd>{inr(q.total)}</dd>
                  </div>
                </dl>
                <p className="mt-3 rounded-xl bg-success/10 px-3 py-2 text-xs text-success">
                  A traditional courier would charge about {inr(q.courier)} and take 5–6 days.
                </p>
                <Button variant="hero" size="lg" className="mt-5 w-full" onClick={confirmQuote}>
                  Confirm & pay
                </Button>
                <Button variant="ghost" className="mt-2 w-full" onClick={() => setStep(0)}>
                  Back
                </Button>
              </aside>
            </div>
          )}

          {step === 2 && shipment && (
            <div className="surface-glass mx-auto max-w-lg rounded-3xl p-7">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary">
                  <CreditCard className="h-5 w-5 text-primary" />
                </span>
                <div>
                  <h2 className="font-display text-xl font-semibold">Razorpay Checkout</h2>
                  <p className="text-xs text-muted-foreground">Test mode · order created server-side</p>
                </div>
              </div>
              <dl className="mt-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipment</dt>
                  <dd className="font-mono">{shipment.id}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Order ID</dt>
                  <dd className="font-mono text-xs">{shipment.payment.razorpayOrderId}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-lg font-semibold">
                  <dt>Amount</dt>
                  <dd>{inr(shipment.priceInPaise)}</dd>
                </div>
              </dl>
              <Button
                variant="hero"
                size="lg"
                className="mt-6 w-full"
                disabled={paying}
                onClick={pay}
              >
                {paying ? "Verifying signature…" : `Pay ${inr(shipment.priceInPaise)}`}
              </Button>
              <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                We never trust the client callback: the payment is only marked captured after the
                HMAC SHA256 signature check and the payment.captured webhook.
              </p>
            </div>
          )}

          {step === 3 && shipment && (
            <div className="surface-glass mx-auto max-w-xl rounded-3xl p-8 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
                <Check className="h-8 w-8" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-bold">Your parcel is booked</h2>
              <p className="mt-2 text-muted-foreground">
                Drop it at your nearest verification point — we'll scan, seal and hand it to your
                matched traveler.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                  <p className="text-xs text-muted-foreground">Shipment ID</p>
                  <p className="font-mono text-lg font-semibold">{shipment.id}</p>
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
                <p className="mt-1 font-mono text-2xl font-bold tracking-[0.3em]">{shipment.otp}</p>
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
