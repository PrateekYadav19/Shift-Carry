import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/swift/site-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { inr, useDB } from "@/lib/swift/store";
import { STATUS_LABEL } from "@/lib/swift/types";
import { etaLabel, settlementStatus, travellerReward } from "@/lib/swift/payments";
import {
  DemoTag,
  PaymentLifecycleRail,
  PayoutBreakdown,
  PoweredByRazorpay,
  SettlementBadge,
} from "@/components/swift/razorpay";
import { ArrowRight, IndianRupee, Package, Timer, Wallet } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My shipments dashboard | SwiftCarry" },
      {
        name: "description",
        content:
          "Your SwiftCarry dashboard: every shipment you have booked, its live status, estimated delivery, payment status and where each rupee of your payment goes.",
      },
      { property: "og:title", content: "My shipments dashboard | SwiftCarry" },
      {
        property: "og:description",
        content: "Shipment history, live status, delivery ETA and payment details in one place.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { db, hydrated } = useDB();
  const shipments = db.shipments;
  const latest = shipments[0];

  const spent = shipments
    .filter((s) => s.payment.status === "CAPTURED")
    .reduce((a, s) => a + s.priceInPaise, 0);
  const active = shipments.filter((s) => s.status !== "DELIVERED").length;

  const cards = [
    { label: "Total shipments", value: String(shipments.length), icon: Package },
    { label: "Active right now", value: String(active), icon: Timer },
    { label: "Paid via Razorpay", value: inr(spent), icon: IndianRupee },
    {
      label: "Traveller rewards funded",
      value: inr(shipments.reduce((a, s) => a + travellerReward(s.priceInPaise), 0)),
      icon: Wallet,
    },
  ];

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="hero-bg min-h-[80vh]">
        <div className="mx-auto w-full max-w-6xl px-5 py-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">My shipments</h1>
              <p className="mt-2 text-muted-foreground">
                Everything you have sent, what it cost, and exactly where it is right now.
              </p>
            </div>
            <PoweredByRazorpay />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((c) => (
              <div key={c.label} className="surface-glass lift sheen rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                  <c.icon className="h-4 w-4 text-primary" />
                </div>
                <p className="mt-2 font-display text-2xl font-bold">{hydrated ? c.value : "—"}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <div className="space-y-4">
              {shipments.length === 0 && (
                <div className="surface-glass rounded-3xl p-8 text-center">
                  <p className="text-muted-foreground">No shipments yet.</p>
                  <Button asChild variant="hero" className="mt-4">
                    <Link to="/book">
                      Send your first parcel <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}

              {shipments.map((s) => (
                <div key={s.id} className="surface-glass lift sheen rounded-3xl p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-lg font-semibold">
                        {s.originCity} → {s.destinationCity}
                      </p>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">{s.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-xl font-bold">{inr(s.priceInPaise)}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.payment.status === "CAPTURED" ? "Payment successful" : s.payment.status}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{STATUS_LABEL[s.status]}</Badge>
                    <Badge variant="secondary">{s.tier}</Badge>
                    <Badge variant="secondary">
                      {s.weightKg} kg · {s.category}
                    </Badge>
                    {s.etaHours ? (
                      <Badge variant="secondary">{etaLabel(s.etaHours)}</Badge>
                    ) : null}
                    <SettlementBadge status={settlementStatus(s)} />
                  </div>

                  <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                    <p className="text-muted-foreground">
                      Traveller:{" "}
                      <span className="text-foreground">{s.travelerName ?? "Being matched"}</span>
                    </p>
                    <p className="text-muted-foreground">
                      Traveller reward:{" "}
                      <span className="text-foreground">{inr(travellerReward(s.priceInPaise))}</span>{" "}
                      <DemoTag>Illustrative</DemoTag>
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="hero">
                      <Link to="/track" search={{ id: s.id }}>
                        Track shipment
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="ghost">
                      <Link to="/book">Send another</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              {latest && <PaymentLifecycleRail shipment={latest} />}
              {latest && <PayoutBreakdown totalPaise={latest.priceInPaise} />}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
