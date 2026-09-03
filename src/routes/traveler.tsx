import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteNav, SiteFooter } from "@/components/swift/site-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addEvent, addJourney, inr, mutateShipment, setKyc, useDB } from "@/lib/swift/store";
import type { TransportMode } from "@/lib/swift/types";
import { STATUS_LABEL } from "@/lib/swift/types";
import { toast } from "sonner";
import { Bus, Car, IdCard, Plane, Train, Upload, Wallet } from "lucide-react";

export const Route = createFileRoute("/traveler")({
  head: () => ({
    meta: [
      { title: "Earn while you travel | SwiftCarry Travelers" },
      {
        name: "description",
        content:
          "Add your flight, train, bus or car journey, pass a quick KYC check, and get paid to carry sealed parcels on trips you're already making.",
      },
      { property: "og:title", content: "Earn while you travel | SwiftCarry Travelers" },
      {
        property: "og:description",
        content: "Turn your spare luggage capacity into income on routes you already travel.",
      },
    ],
  }),
  component: TravelerPage,
});

const modes: { value: TransportMode; label: string; icon: typeof Plane }[] = [
  { value: "FLIGHT", label: "Flight", icon: Plane },
  { value: "TRAIN", label: "Train", icon: Train },
  { value: "BUS", label: "Bus", icon: Bus },
  { value: "CAR", label: "Car", icon: Car },
];

function TravelerPage() {
  const { db, hydrated } = useDB();
  const [origin, setOrigin] = useState("Delhi");
  const [destination, setDestination] = useState("Mumbai");
  const [mode, setMode] = useState<TransportMode>("FLIGHT");
  const [date, setDate] = useState(() => new Date(Date.now() + 864e5).toISOString().slice(0, 16));
  const [capacity, setCapacity] = useState(5);
  const [declined, setDeclined] = useState<string[]>([]);

  const myJourneys = useMemo(
    () => db.journeys.filter((j) => j.travelerId === db.user?.id),
    [db.journeys, db.user],
  );

  const routes = myJourneys.length ? myJourneys : db.journeys.slice(0, 2);
  const requests = db.shipments.filter(
    (s) =>
      !declined.includes(s.id) &&
      routes.some(
        (j) =>
          j.origin.toLowerCase() === s.originCity.toLowerCase() &&
          j.destination.toLowerCase() === s.destinationCity.toLowerCase(),
      ),
  );

  const payout = requests
    .filter((s) => s.status !== "BOOKED")
    .reduce((a, s) => a + Math.round(s.priceInPaise * 0.62), 0);

  const kyc = db.user?.kycStatus ?? "NONE";

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="hero-bg min-h-[80vh]">
        <div className="mx-auto w-full max-w-6xl px-5 py-12">
          <h1 className="text-3xl font-bold sm:text-4xl">Traveler hub</h1>
          <p className="mt-2 text-muted-foreground">
            You're already going. Let your spare kilos pay for the trip.
          </p>

          <Tabs defaultValue="onboarding" className="mt-8">
            <TabsList>
              <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            </TabsList>

            <TabsContent value="onboarding" className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="surface-glass rounded-3xl p-6">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                  <IdCard className="h-5 w-5 text-primary" /> KYC verification
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Upload a government ID. Numbers are encrypted with AES-256 at rest and never shown
                  to senders.
                </p>
                <div className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center">
                  <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Drop your ID here (simulated)</p>
                  <Button
                    variant="soft"
                    className="mt-4"
                    onClick={() => {
                      setKyc("PENDING");
                      toast.success("ID uploaded — in verification queue");
                      setTimeout(() => {
                        setKyc("VERIFIED");
                        toast.success("KYC verified");
                      }, 1800);
                    }}
                  >
                    Upload ID
                  </Button>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <span>Status:</span>
                  <Badge variant={kyc === "VERIFIED" ? "default" : "secondary"}>
                    {hydrated ? kyc : "…"}
                  </Badge>
                </div>

              </div>

              <div className="surface-glass rounded-3xl p-6">
                <h2 className="font-display text-lg font-semibold">Add a journey</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="o">Origin</Label>
                    <Input
                      id="o"
                      className="mt-1.5 h-11"
                      maxLength={40}
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="d">Destination</Label>
                    <Input
                      id="d"
                      className="mt-1.5 h-11"
                      maxLength={40}
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Transport mode</Label>
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {modes.map((m) => (
                        <button
                          key={m.value}
                          type="button"
                          onClick={() => setMode(m.value)}
                          className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 text-xs transition-all ${
                            mode === m.value
                              ? "border-primary/60 bg-primary/10 text-foreground"
                              : "border-border bg-secondary/40 text-muted-foreground"
                          }`}
                        >
                          <m.icon className="h-4 w-4" />
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="dep">Departure</Label>
                    <Input
                      id="dep"
                      type="datetime-local"
                      className="mt-1.5 h-11"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cap">Capacity (kg)</Label>
                    <Input
                      id="cap"
                      type="number"
                      min={1}
                      max={25}
                      className="mt-1.5 h-11"
                      value={capacity}
                      onChange={(e) => setCapacity(Number(e.target.value))}
                    />
                  </div>
                </div>
                <Button
                  variant="hero"
                  size="lg"
                  className="mt-5 w-full"
                  onClick={() => {
                    addJourney({
                      travelerId: db.user?.id ?? "guest",
                      travelerName: db.user?.name ?? "You",
                      origin,
                      destination,
                      transportMode: mode,
                      departureAt: new Date(date).toISOString(),
                      availableCapacityKg: capacity,
                    });
                    toast.success("Journey published — matching now");
                  }}
                >
                  Publish journey
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="dashboard" className="mt-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ["Matched requests", String(requests.length)],
                  ["Active journeys", String(routes.length)],
                  ["Projected payout", inr(payout)],
                ].map(([k, v]) => (
                  <div key={k} className="surface-glass rounded-2xl p-5">
                    <p className="text-xs text-muted-foreground">{k}</p>
                    <p className="mt-1 font-display text-2xl font-bold">{v}</p>
                  </div>
                ))}
              </div>

              <div className="surface-glass rounded-3xl p-6">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                  <Wallet className="h-5 w-5 text-primary" /> Requests on your routes
                </h2>
                {requests.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Nothing matched yet. Publish a journey and we'll notify you instantly.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {requests.map((s) => (
                      <li
                        key={s.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-secondary/30 p-4"
                      >
                        <div>
                          <p className="font-mono text-sm">{s.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {s.originCity} → {s.destinationCity} · {s.category} · {s.weightKg} kg ·{" "}
                            {STATUS_LABEL[s.status]}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">
                            reward {inr(travellerReward(s.priceInPaise))}
                          </Badge>
                          <SettlementBadge status={settlementStatus(s)} />
                          <Button
                            size="sm"
                            variant="hero"
                            onClick={() => {
                              mutateShipment(s.id, (x) => ({
                                ...x,
                                matchedJourneyId: routes[0]?.id,
                              }));
                              addEvent(
                                s.id,
                                "HANDED_TO_TRAVELER",
                                `Accepted by ${db.user?.name ?? "traveler"}.`,
                              );
                              toast.success("Request accepted");
                            }}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeclined((d) => [...d, s.id])}
                          >
                            Decline
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
