import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { SiteNav, SiteFooter } from "@/components/swift/site-nav";
import { StatusTimeline } from "@/components/swift/timeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { advance, inr, mutateShipment, useDB } from "@/lib/swift/store";
import { STATUS_LABEL } from "@/lib/swift/types";
import { toast } from "sonner";
import { Flag, MapPin, Search, ShieldCheck, Truck } from "lucide-react";

const searchSchema = z.object({ id: z.string().optional() });

export const Route = createFileRoute("/track")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Track your parcel | SwiftCarry" },
      {
        name: "description",
        content:
          "Follow a live chain-of-custody timeline: booked, verified and sealed, partner pickup, traveler handover, in transit, delivered with OTP.",
      },
      { property: "og:title", content: "Track your parcel | SwiftCarry" },
      {
        property: "og:description",
        content: "Live chain-of-custody tracking for every SwiftCarry shipment.",
      },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const { id } = Route.useSearch();
  const navigate = useNavigate({ from: "/track" });
  const { db, hydrated } = useDB();
  const [query, setQuery] = useState(id ?? "");

  const shipment = db.shipments.find((s) => s.id.toUpperCase() === (id ?? "").toUpperCase());

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="hero-bg min-h-[80vh]">
        <div className="mx-auto w-full max-w-5xl px-5 py-12">
          <h1 className="text-3xl font-bold sm:text-4xl">Track a shipment</h1>
          <div className="mt-5 flex max-w-md gap-2">
            <Input
              value={query}
              maxLength={24}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SWC-9F2K4"
              className="h-11 font-mono"
            />
            <Button
              variant="hero"
              size="lg"
              onClick={() => navigate({ search: { id: query.trim().toUpperCase() } })}
            >
              <Search className="h-4 w-4" /> Track
            </Button>
          </div>

          {hydrated && id && !shipment && (
            <p className="mt-6 text-sm text-destructive">
              No shipment found for {id}. Try the demo ID SWC-9F2K4.
            </p>
          )}

          {!id && hydrated && db.shipments.length > 0 && (
            <div className="mt-8">
              <p className="text-sm text-muted-foreground">Recent shipments on this device</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {db.shipments.slice(0, 4).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setQuery(s.id);
                      void navigate({ search: { id: s.id } });
                    }}
                    className="surface-glass rounded-2xl p-4 text-left transition-transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm">{s.id}</span>
                      <Badge variant="secondary">{STATUS_LABEL[s.status]}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {s.originCity} → {s.destinationCity} · {s.tier.toLowerCase()}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {shipment && (
            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="surface-glass rounded-3xl p-6 sm:p-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm text-muted-foreground">{shipment.id}</p>
                    <h2 className="font-display text-2xl font-bold">
                      {shipment.originCity} → {shipment.destinationCity}
                    </h2>
                  </div>
                  <Badge
                    variant={shipment.status === "DELIVERED" ? "default" : "secondary"}
                    className="text-sm"
                  >
                    {STATUS_LABEL[shipment.status]}
                  </Badge>
                </div>
                <StatusTimeline shipment={shipment} />
                <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-5">
                  <Button
                    variant="soft"
                    size="sm"
                    onClick={() => {
                      advance(shipment.id);
                      toast.success("Custody checkpoint added");
                    }}
                  >
                    <Truck className="h-4 w-4" /> Simulate next checkpoint
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      mutateShipment(shipment.id, (s) => ({ ...s, flagged: !s.flagged }));
                      toast.success("Dispute flag toggled — ops team notified");
                    }}
                  >
                    <Flag className="h-4 w-4" /> {shipment.flagged ? "Clear flag" : "Raise dispute"}
                  </Button>
                </div>
              </div>

              <aside className="space-y-4">
                <div className="surface-glass rounded-3xl p-6 text-sm">
                  <h3 className="font-display text-base font-semibold">Parcel</h3>
                  <dl className="mt-3 space-y-2">
                    {[
                      ["Category", shipment.category],
                      ["Weight", `${shipment.weightKg} kg`],
                      ["Tier", shipment.tier],
                      ["Seal ID", shipment.sealId],
                      ["Recipient", shipment.recipientName],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">{k}</dt>
                        <dd className="truncate text-right">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <PaymentStatusCard shipment={shipment} />
                <div className="surface-glass flex items-center justify-between rounded-3xl p-6 text-sm">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-accent" /> Settlement
                  </span>
                  <SettlementBadge status={settlementStatus(shipment)} />
                </div>
                <PayoutBreakdown totalPaise={shipment.priceInPaise} />
                <div className="surface-glass rounded-3xl p-6 text-sm">
                  <h3 className="flex items-center gap-2 font-display text-base font-semibold">
                    <MapPin className="h-4 w-4 text-primary" /> Route
                  </h3>
                  <p className="mt-3 text-muted-foreground">{shipment.pickupAddress}</p>
                  <p className="mt-2 text-muted-foreground">{shipment.dropAddress}</p>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
