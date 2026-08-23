import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/swift/site-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import heroImg from "@/assets/hero-traveler.jpg";
import {
  ArrowRight,
  BadgeIndianRupee,
  Bus,
  Clock,
  Handshake,
  Lock,
  Plane,
  QrCode,
  ShieldCheck,
  Sparkles,
  Train,
  Truck,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SwiftCarry — Parcels that ride along with travelers" },
      {
        name: "description",
        content:
          "SwiftCarry matches your parcel with verified travelers already heading to its destination. Express in 24 hours by flight, Standard in 1–3 days — cheaper than couriers.",
      },
      { property: "og:title", content: "SwiftCarry — Parcels that ride along with travelers" },
      {
        property: "og:description",
        content:
          "Crowd-sourced parcel delivery: sealed parcels, verified travelers, OTP handover, live chain-of-custody tracking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const steps = [
  { icon: QrCode, title: "Drop & seal", text: "Leave your parcel at a verification point. We scan it and apply a tamper seal." },
  { icon: Handshake, title: "Partner pickup", text: "A local partner collects the sealed parcel and hands it to your matched traveler." },
  { icon: Plane, title: "It rides along", text: "A verified traveler already on that route carries it in their spare capacity." },
  { icon: ShieldCheck, title: "OTP handover", text: "A partner at the destination delivers it. The recipient confirms with an OTP." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteNav />

      <main>
        {/* HERO */}
        <section className="hero-bg relative overflow-hidden">
          <div className="grid-lines absolute inset-0 opacity-60" aria-hidden />
          <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.05fr_1fr] lg:py-28">
            <div>
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                <Sparkles className="mr-1.5 h-3 w-3 text-primary" /> Matched in seconds by AI
              </Badge>
              <h1 className="mt-5 text-5xl leading-[1.03] font-bold sm:text-6xl lg:text-7xl">
                Your parcel <span className="text-gradient">flies today</span> — with someone
                already going there.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                Couriers take 5–6 days. SwiftCarry matches your sealed parcel to a verified traveler
                on the exact route — 24 hours by flight, 1–3 days by train or bus, always cheaper.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button asChild variant="hero" size="xl">
                  <Link to="/book">
                    Send a parcel <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outlineGlow" size="xl">
                  <Link to="/traveler">Earn as a traveler</Link>
                </Button>
              </div>
              <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6">
                {[
                  ["24h", "Express delivery"],
                  ["45%", "Cheaper than courier"],
                  ["100%", "Sealed & OTP verified"],
                ].map(([v, l]) => (
                  <div key={l}>
                    <dt className="font-display text-3xl font-bold text-gradient">{v}</dt>
                    <dd className="mt-1 text-xs text-muted-foreground">{l}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative">
              <div className="surface-glass overflow-hidden rounded-[2rem] p-2">
                <img
                  src={heroImg}
                  alt="Traveler carrying a sealed SwiftCarry parcel through an airport terminal"
                  width={1408}
                  height={1104}
                  className="h-full w-full rounded-[1.6rem] object-cover"
                />
              </div>
              <div className="surface-glass animate-float absolute -bottom-6 -left-4 w-64 rounded-2xl p-4 sm:-left-8">
                <p className="text-xs text-muted-foreground">Matched traveler</p>
                <p className="mt-1 font-display text-base font-semibold">Priya · DEL → BOM</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-success">
                  <Clock className="h-3 w-3" /> Departs in 2h 10m · 6 kg free
                </p>
              </div>
              <div className="surface-glass absolute -top-5 right-0 rounded-2xl px-4 py-3 sm:-right-6">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <Lock className="h-4 w-4 text-primary" /> Seal #77213 intact
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TIERS */}
        <section className="mx-auto w-full max-w-7xl px-5 py-20">
          <h2 className="text-3xl font-bold sm:text-4xl">Two speeds. Both beat the courier.</h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <article className="surface-glass relative overflow-hidden rounded-3xl p-8">
              <span className="absolute inset-x-0 top-0 h-px overflow-hidden">
                <span className="brand-bg animate-shimmer block h-px w-1/3" />
              </span>
              <Plane className="h-7 w-7 text-primary" />
              <h3 className="mt-5 font-display text-2xl font-bold">Express · within 24 hours</h3>
              <p className="mt-3 text-muted-foreground">
                Matched to travelers on flights. Ideal for documents, spare parts, medicines and
                anything that can't wait until next week.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                {["Flight-only traveler pool", "Priority partner pickup slot", "Insurance included"].map(
                  (t) => (
                    <li key={t} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {t}
                    </li>
                  ),
                )}
              </ul>
            </article>
            <article className="surface-glass rounded-3xl p-8">
              <div className="flex gap-3">
                <Train className="h-7 w-7 text-accent" />
                <Bus className="h-7 w-7 text-accent" />
              </div>
              <h3 className="mt-5 font-display text-2xl font-bold">Standard · 1–3 days</h3>
              <p className="mt-3 text-muted-foreground">
                Matched to travelers on trains, buses and cars. Still less than half the time a
                traditional courier takes, at a lower price.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                {["Widest traveler network", "Same sealed chain of custody", "Best price per kg"].map(
                  (t) => (
                    <li key={t} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {t}
                    </li>
                  ),
                )}
              </ul>
            </article>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="border-y border-border/60 bg-card/30">
          <div className="mx-auto w-full max-w-7xl px-5 py-20">
            <h2 className="text-3xl font-bold sm:text-4xl">A sealed chain of custody</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Nobody touches your parcel without a scan. Every handover is logged and visible on
              your tracking page in real time.
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <div key={s.title} className="surface-glass rounded-3xl p-6">
                  <div className="flex items-center justify-between">
                    <s.icon className="h-6 w-6 text-primary" />
                    <span className="font-display text-3xl font-bold text-muted-foreground/25">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TRAVELER / TRUST */}
        <section className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-20 lg:grid-cols-2">
          <div className="surface-glass rounded-3xl p-8">
            <BadgeIndianRupee className="h-7 w-7 text-primary" />
            <h2 className="mt-5 text-3xl font-bold">Travelling anyway? Get paid for it.</h2>
            <p className="mt-3 text-muted-foreground">
              A Delhi–Mumbai flyer with 6 spare kilos earns up to ₹1,300 a trip. Complete KYC once,
              publish your journey, accept the requests you like.
            </p>
            <Button asChild variant="hero" size="lg" className="mt-7">
              <Link to="/traveler">Start earning</Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [ShieldCheck, "KYC-verified travelers", "Government ID checked before a first parcel."],
              [Lock, "Tamper-evident seals", "Scanned at every handover point."],
              [Truck, "Local partners", "Trained pickup and drop agents at both ends."],
              [Clock, "Live timeline", "Seven states from booked to delivered."],
            ].map(([Icon, t, d]) => {
              const I = Icon as typeof ShieldCheck;
              return (
                <div key={t as string} className="surface-glass rounded-2xl p-6">
                  <I className="h-5 w-5 text-accent" />
                  <h3 className="mt-3 font-display font-semibold">{t as string}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{d as string}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto w-full max-w-7xl px-5 pb-24">
          <div className="brand-bg relative overflow-hidden rounded-[2rem] px-8 py-16 text-center">
            <h2 className="mx-auto max-w-2xl text-4xl font-bold text-primary-foreground">
              Send your first parcel in under a minute.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
              Ask Carry, our assistant — it picks your tier, quotes the price and fills the form for
              you.
            </p>
            <Button asChild size="xl" variant="secondary" className="mt-8">
              <Link to="/book">
                Book now <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
