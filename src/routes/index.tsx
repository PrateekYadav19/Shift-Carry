import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/swift/site-nav";
import { RouteMarquee } from "@/components/swift/fleet-layer";
import { PoweredByRazorpay, RazorpayMark } from "@/components/swift/razorpay";
import { PartnersStrip } from "@/components/swift/partners";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useReveal, useCountUp } from "@/hooks/use-reveal";
import heroImg from "@/assets/hero-traveler.jpg";
import planeImg from "@/assets/fleet-plane.png";
import trainImg from "@/assets/fleet-train.png";
import busImg from "@/assets/fleet-bus.png";
import bikeImg from "@/assets/fleet-bike.png";
import type { ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeIndianRupee,
  Boxes,
  Bus,
  Clock,
  CreditCard,
  Handshake,
  Lock,
  Plane,
  QrCode,
  Quote,
  Radar,
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

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const r = useReveal<HTMLDivElement>(delay);
  return (
    <div ref={r.ref} style={r.style} className={`${r.className} ${className}`}>
      {children}
    </div>
  );
}

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const c = useCountUp(value);
  return (
    <div className="surface-glass rounded-2xl px-5 py-6 text-center">
      <p className="font-display text-4xl font-bold">
        <span ref={c.ref} className="text-gradient">
          {c.value}
          {suffix}
        </span>
      </p>
      <p className="mt-2 text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
    </div>
  );
}

function SectionHead({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: string;
}) {
  return (
    <Reveal>
      <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
        <span className="h-px w-8 bg-primary/60" />
        {eyebrow}
      </p>
      <h2 className="mt-4 max-w-3xl text-3xl font-bold sm:text-4xl lg:text-5xl">{title}</h2>
      {sub && <p className="mt-4 max-w-2xl text-muted-foreground">{sub}</p>}
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const steps = [
  {
    icon: Boxes,
    title: "Enter shipment details",
    text: "Pickup and drop city, parcel category, approximate weight and when it has to land.",
  },
  {
    icon: Sparkles,
    title: "AI finds travellers & routes",
    text: "We scan people already travelling that corridor and score them on capacity, timing and reliability.",
  },
  {
    icon: QrCode,
    title: "Verify sender & parcel",
    text: "Sender KYC, parcel declaration, weighing, photo evidence and a tamper-evident seal with a unique ID.",
  },
  {
    icon: Radar,
    title: "Select the best option",
    text: "Fastest, Balanced or Cheapest — with the AI's recommendation against your deadline and budget.",
  },
  {
    icon: CreditCard,
    title: "Pay securely with Razorpay",
    text: "Digital checkout designed for the Razorpay API. The order is created server-side and the signature verified before anything moves.",
  },
  {
    icon: Handshake,
    title: "Traveller receives the parcel",
    text: "A local partner hands the already-sealed parcel to your matched traveller with a QR/OTP handoff.",
  },
  {
    icon: Plane,
    title: "Track every handoff",
    text: "Chain-of-custody records at each step: sender, pickup partner, verification, traveller, destination partner, receiver.",
  },
  {
    icon: ShieldCheck,
    title: "Delivery completed",
    text: "The receiver confirms with a one-time code, and the traveller reward moves to Processing then Completed.",
  },
];

const fleet = [
  {
    img: planeImg,
    w: 1536,
    h: 768,
    icon: Plane,
    mode: "Flight",
    tier: "Express",
    time: "Within 24 hours",
    copy: "Documents, spare parts, medicines — anything that cannot wait until next week.",
  },
  {
    img: trainImg,
    w: 1920,
    h: 640,
    icon: Train,
    mode: "Train",
    tier: "Standard",
    time: "1–2 days",
    copy: "The widest traveler pool in the country, at the lowest price per kilogram.",
  },
  {
    img: busImg,
    w: 1536,
    h: 768,
    icon: Bus,
    mode: "Bus",
    tier: "Standard",
    time: "2–3 days",
    copy: "Intercity coaches cover the routes flights skip, still twice as fast as a courier.",
  },
  {
    img: bikeImg,
    w: 1024,
    h: 768,
    icon: Truck,
    mode: "Last mile",
    tier: "Both tiers",
    time: "Same hour",
    copy: "Local rider partners handle the first and last legs at both ends of every journey.",
  },
];

const testimonials = [
  {
    quote:
      "I sent a passport to Mumbai at 9am and it was delivered by 6pm the same day. A courier quoted four days.",
    name: "Ananya R.",
    role: "Sender · Delhi",
  },
  {
    quote:
      "I fly Delhi–Bengaluru twice a month anyway. Six spare kilos now pays for my airport cab and then some.",
    name: "Vikram S.",
    role: "Traveler · 41 trips",
  },
  {
    quote:
      "The seal ID and the photo trail is what sold it to me. I know exactly what I am carrying and who packed it.",
    name: "Meera K.",
    role: "Traveler · Train routes",
  },
];

const faqs = [
  {
    q: "How do you know the parcel is safe to carry?",
    a: "Every parcel is opened and inspected at a verification point against a prohibited-items list, photographed, weighed, and then sealed. A traveler only ever receives a sealed, already-inspected parcel.",
  },
  {
    q: "What happens if my traveler cancels their trip?",
    a: "Matching runs continuously against a backup pool. If a handoff is not OTP-confirmed by the cutoff, the shipment is automatically re-matched to another traveler on the same corridor.",
  },
  {
    q: "When is the traveler paid?",
    a: "Payment sits in escrow from checkout and is released only after the recipient confirms delivery with their OTP.",
  },
  {
    q: "How is this cheaper than a courier?",
    a: "The long leg of the journey is already happening. You are paying for spare capacity plus two short local legs, not for an entire logistics network.",
  },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteNav />

      <main>
        {/* ---------------- HERO ---------------- */}
        <section className="relative overflow-hidden">
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

              <div className="mt-12 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat value={24} suffix="h" label="Express" />
                <Stat value={45} suffix="%" label="Cheaper" />
                <Stat value={100} suffix="%" label="Sealed" />
                <Stat value={7} suffix="" label="Custody steps" />
              </div>
            </div>

            <div className="relative">
              <div className="surface-glass group relative overflow-hidden rounded-[2rem] p-2">
                <div className="relative overflow-hidden rounded-[1.6rem]">
                  <img
                    src={heroImg}
                    alt="Traveler carrying a sealed SwiftCarry parcel through an airport terminal at golden hour"
                    width={1024}
                    height={1280}
                    fetchPriority="high"
                    className="aspect-[4/5] w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
                  />
                  {/* cinematic grade so the photo sits inside the brand palette */}
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,oklch(0.16_0.028_250/0.75)_100%)]" />
                  <div className="pointer-events-none absolute inset-0 mix-blend-soft-light bg-[radial-gradient(80%_60%_at_70%_20%,oklch(0.79_0.17_78/0.35),transparent_70%)]" />
                  <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[1.6rem]" />
                </div>
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

              <div className="surface-glass absolute top-1/2 -left-6 hidden items-center gap-3 rounded-2xl px-4 py-3 lg:flex">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ring absolute inline-flex h-full w-full rounded-full bg-accent" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-accent" />
                </span>
                <span className="text-xs text-muted-foreground">Live matching</span>
              </div>
            </div>
          </div>
        </section>

        <RouteMarquee />

        <PartnersStrip />

        {/* ---------------- FLEET ---------------- */}
        <section className="mx-auto w-full max-w-7xl px-5 py-24">
          <SectionHead
            eyebrow="The fleet you already ride"
            title={
              <>
                Four ways your parcel moves. <span className="text-gradient">All of them beat the courier.</span>
              </>
            }
            sub="Every shipment is routed to the transport mode that fits your deadline and budget, then handed between verified people with a scan at each step."
          />

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {fleet.map((f, i) => (
              <Reveal key={f.mode} delay={i * 90}>
                <article className="surface-glass group relative h-full overflow-hidden rounded-[1.75rem] p-8 transition-transform duration-500 hover:-translate-y-1.5">
                  <span className="absolute inset-x-0 top-0 h-px overflow-hidden">
                    <span className="brand-bg animate-shimmer block h-px w-1/3" />
                  </span>

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-primary">
                        <f.icon className="h-6 w-6" />
                        <span className="text-xs font-semibold tracking-[0.18em] uppercase">
                          {f.mode}
                        </span>
                      </div>
                      <h3 className="mt-4 font-display text-2xl font-bold">
                        {f.tier} · {f.time}
                      </h3>
                      <p className="mt-3 max-w-sm text-sm text-muted-foreground">{f.copy}</p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary" />
                  </div>

                  <div className="relative mt-8 h-32 overflow-hidden">
                    <img
                      src={f.img}
                      alt={`${f.mode} used for ${f.tier} SwiftCarry shipments`}
                      width={f.w}
                      height={f.h}
                      loading="lazy"
                      className="absolute bottom-0 left-1/2 w-[85%] -translate-x-1/2 object-contain transition-transform duration-700 ease-out group-hover:translate-x-[-42%] group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------------- CHAIN OF CUSTODY ---------------- */}
        <section className="relative border-y border-border/60 bg-card/40 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-7xl px-5 py-24">
            <SectionHead
              eyebrow="How it works"
              title="Eight steps from your desk to their door."
              sub="Sender → verified parcel → AI match → traveller → destination → receiver. Every step timestamped, photographed and visible on your tracking page, with Razorpay sitting at the payment stage."
            />

            <div className="relative mt-14">
              <div className="absolute top-16 right-0 left-0 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block" />
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {steps.map((s, i) => (
                  <Reveal key={s.title} delay={i * 110}>
                    <div className="surface-glass relative h-full rounded-3xl p-6 transition-transform duration-500 hover:-translate-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="brand-bg flex h-11 w-11 items-center justify-center rounded-xl">
                          <s.icon className="h-5 w-5 text-primary-foreground" />
                        </span>
                        <span className="font-display text-3xl font-bold text-muted-foreground/25">
                          0{i + 1}
                        </span>
                      </div>
                      <h3 className="mt-5 font-display text-lg font-semibold">{s.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* custody chain rail */}
            <Reveal delay={160}>
              <div className="surface-glass mt-10 rounded-3xl p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-display text-sm tracking-[0.22em] text-muted-foreground uppercase">
                    Chain of custody
                  </p>
                  <Badge variant="secondary" className="text-[10px]">
                    Sealed &amp; scanned at every link
                  </Badge>
                </div>
                <ol className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {[
                    [Boxes, "Sender", "Declares & packs"],
                    [QrCode, "Verified parcel", "Scanned, sealed, photographed"],
                    [Sparkles, "AI match", "Route, capacity, reliability"],
                    [Plane, "Traveller", "Carries on their trip"],
                    [Truck, "Destination partner", "Receives at the drop city"],
                    [ShieldCheck, "Receiver", "OTP handover closes the chain"],
                  ].map(([Icon, label, sub], i) => {
                    const I = Icon as typeof ShieldCheck;
                    return (
                      <li
                        key={label as string}
                        className="group relative rounded-2xl border border-border/60 bg-background/40 p-4 transition-colors duration-500 hover:border-primary/50"
                      >
                        <div className="flex items-center gap-2">
                          <I className="h-4 w-4 text-accent" />
                          <span className="font-display text-[11px] tracking-widest text-muted-foreground/60 uppercase">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        </div>
                        <p className="mt-2 font-display text-sm font-semibold">{label as string}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{sub as string}</p>
                        {i < 5 && (
                          <ArrowRight className="absolute top-1/2 -right-3 hidden h-4 w-4 -translate-y-1/2 text-border lg:block" />
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="surface-glass mt-10 flex flex-wrap items-center justify-between gap-6 rounded-3xl p-7">
                <div className="flex items-center gap-4">
                  <Radar className="h-8 w-8 text-accent" />
                  <div>
                    <p className="font-display text-lg font-semibold">
                      Track any shipment with its ID
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Or just ask Carry, the assistant in the corner of every page.
                    </p>
                  </div>
                </div>
                <Button asChild variant="outlineGlow" size="lg">
                  <Link to="/track">
                    Open tracking <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------------- TRUST + TRAVELER ---------------- */}
        <section className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-24 lg:grid-cols-2">
          <Reveal>
            <div className="surface-glass relative h-full overflow-hidden rounded-[1.75rem] p-8">
              <BadgeIndianRupee className="h-7 w-7 text-primary" />
              <h2 className="mt-5 text-3xl font-bold sm:text-4xl">
                Travelling anyway? <span className="text-gradient">Get paid for it.</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                A Delhi–Mumbai flyer with 6 spare kilos earns up to ₹1,300 a trip. Complete KYC
                once, publish your journey, accept only the requests you like.
              </p>
              <Button asChild variant="hero" size="lg" className="mt-8">
                <Link to="/traveler">Start earning</Link>
              </Button>
              <img
                src={bikeImg}
                alt=""
                aria-hidden
                width={1024}
                height={768}
                loading="lazy"
                className="animate-float pointer-events-none absolute -right-10 -bottom-8 w-52 opacity-25"
              />
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [ShieldCheck, "KYC-verified travelers", "Government ID and liveness check before a first parcel."],
              [Lock, "Tamper-evident seals", "Unique serial scanned at every single handover."],
              [Truck, "Local partners", "Trained pickup and drop riders at both ends."],
              [Boxes, "Escrow payouts", "Money releases only after the recipient's OTP."],
            ].map(([Icon, t, d], i) => {
              const I = Icon as typeof ShieldCheck;
              return (
                <Reveal key={t as string} delay={i * 90}>
                  <div className="surface-glass h-full rounded-2xl p-6 transition-transform duration-500 hover:-translate-y-1.5">
                    <I className="h-5 w-5 text-accent" />
                    <h3 className="mt-3 font-display font-semibold">{t as string}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{d as string}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ---------------- TESTIMONIALS ---------------- */}
        <section className="border-y border-border/60 bg-card/40 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-7xl px-5 py-24">
            <SectionHead eyebrow="From both sides of the parcel" title="Senders and travelers agree." />
            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {testimonials.map((t, i) => (
                <Reveal key={t.name} delay={i * 110}>
                  <figure className="surface-glass h-full rounded-3xl p-7">
                    <Quote className="h-6 w-6 text-primary/70" />
                    <blockquote className="mt-4 text-sm leading-relaxed text-foreground/90">
                      {t.quote}
                    </blockquote>
                    <figcaption className="mt-6 border-t border-border/60 pt-4">
                      <p className="font-display font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- PAYMENTS ---------------- */}
        <section className="mx-auto w-full max-w-7xl px-5 py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <SectionHead
                eyebrow="Secure, digital payments"
                title={
                  <>
                    One payment. <span className="text-gradient">Everyone who moves it</span> gets
                    their share.
                  </>
                }
                sub="Payments are designed to be handled through Razorpay APIs, giving customers a trusted digital payment experience while the platform coordinates shipment-related payments between the pickup partner, the traveller and the destination rider."
              />
              <Reveal delay={120}>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <PoweredByRazorpay size="lg" />
                  <span className="text-xs text-muted-foreground">
                    Prototype runs in demo/test mode
                  </span>
                </div>
                <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                  {[
                    ["Order created server-side", "Amounts are never decided by the browser."],
                    ["Signature verified", "HMAC SHA256 check before a parcel is sealed."],
                    ["Webhook as source of truth", "payment.captured / payment.failed."],
                    ["Transparent breakdown", "You see exactly who is being paid, and how much."],
                  ].map(([t, d]) => (
                    <li key={t} className="surface-glass rounded-2xl p-5">
                      <p className="flex items-center gap-2 font-display text-sm font-semibold">
                        <ShieldCheck className="h-4 w-4 text-accent" /> {t}
                      </p>
                      <p className="mt-1.5 text-sm text-muted-foreground">{d}</p>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            <Reveal delay={180}>
              <div className="surface-glass rounded-[1.75rem] p-7">
                <div className="flex items-center justify-between">
                  <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                    Payment flow
                  </p>
                  <RazorpayMark className="h-6 w-6" />
                </div>
                <ol className="mt-5 space-y-3">
                  {[
                    "Customer creates shipment",
                    "AI finds the best traveller option",
                    "Customer sees the final price",
                    "Customer pays through Razorpay",
                    "Payment confirmation",
                    "Traveller & partners' rewards are coordinated",
                    "Shipment is completed",
                    "Payment / reward status is updated",
                  ].map((t, i) => (
                    <li key={t} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-[11px] text-primary">
                        {i + 1}
                      </span>
                      <span className="text-sm text-foreground/90">{t}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-6 border-t border-border/70 pt-4 text-xs text-muted-foreground">
                  Designed for Razorpay integration. Demo amounts and IDs are illustrative until
                  test-mode credentials are configured.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section className="mx-auto w-full max-w-4xl px-5 py-24">
          <SectionHead eyebrow="Questions" title="Everything senders ask us first." />
          <div className="mt-10 space-y-3">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={i * 70}>
                <details className="surface-glass group rounded-2xl px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 font-display font-semibold">
                    {f.q}
                    <span className="text-primary transition-transform duration-300 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------------- CTA ---------------- */}
        <section className="mx-auto w-full max-w-7xl px-5 pb-28">
          <Reveal>
            <div className="brand-bg relative overflow-hidden rounded-[2rem] px-8 py-20 text-center">
              <img
                src={planeImg}
                alt=""
                aria-hidden
                width={1536}
                height={768}
                loading="lazy"
                className="pointer-events-none absolute -top-10 -left-16 w-80 opacity-20"
              />
              <img
                src={trainImg}
                alt=""
                aria-hidden
                width={1920}
                height={640}
                loading="lazy"
                className="pointer-events-none absolute -right-24 -bottom-6 w-[36rem] opacity-20"
              />
              <h2 className="relative mx-auto max-w-2xl text-4xl font-bold text-primary-foreground sm:text-5xl">
                Send your first parcel in under a minute.
              </h2>
              <p className="relative mx-auto mt-5 max-w-xl text-primary-foreground/80">
                Ask Carry, our assistant — it picks your tier, quotes the price and fills the form
                for you.
              </p>
              <Button asChild size="xl" variant="secondary" className="relative mt-9">
                <Link to="/book">
                  Book now <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
