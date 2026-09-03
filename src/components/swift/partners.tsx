import { RazorpayMark } from "./razorpay";
import { BadgeCheck, Bike, Car, Globe2, ShieldCheck } from "lucide-react";

/**
 * Trust / collaboration strip.
 *
 * Razorpay is the highlighted payments collaboration; the other networks are
 * shown as the logistics ecosystem the platform is built to plug into. Wording
 * stays honest — no claim of a signed commercial partnership.
 */

const ecosystem = [
  {
    name: "Uber",
    icon: Car,
    role: "Cab & intercity legs",
    note: "First-mile pickups and airport runs",
  },
  {
    name: "Rapido",
    icon: Bike,
    role: "Last-mile riders",
    note: "Door delivery in the destination city",
  },
  {
    name: "DHL",
    icon: Globe2,
    role: "Overflow logistics",
    note: "Fallback when no traveller is on the route",
  },
];

export function PartnersStrip() {
  return (
    <section className="border-y border-border/60 bg-secondary/20">
      <div className="mx-auto w-full max-w-7xl px-5 py-16">
        <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
          <span className="h-px w-8 bg-primary/60" />
          Collaboration &amp; trust
        </p>
        <h2 className="mt-4 max-w-3xl text-3xl font-bold sm:text-4xl">
          Built with the networks people <span className="text-gradient">already trust</span>.
        </h2>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_1.85fr]">
          {/* Highlighted: Razorpay */}
          <article className="glow relative overflow-hidden rounded-3xl border border-razorpay/40 bg-razorpay/8 p-7">
            <div className="pointer-events-none absolute -top-16 -right-10 h-44 w-44 rounded-full bg-razorpay/25 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background/70">
                  <RazorpayMark className="h-7 w-7" />
                </span>
                <div>
                  <p className="font-display text-xl font-bold">Razorpay</p>
                  <p className="text-xs tracking-wide text-muted-foreground uppercase">
                    Payments collaboration
                  </p>
                </div>
              </div>

              <p className="mt-5 font-display text-lg font-semibold">
                Collaboration &amp; partnership with Razorpay
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Every rupee on SwiftCarry moves through a payment flow built on the Razorpay API —
                server-created orders, HMAC SHA256 signature verification and signed webhooks — so
                senders, travellers and partners all settle on one trusted rail.
              </p>

              <ul className="mt-5 space-y-2 text-sm">
                {[
                  "Orders API for every shipment",
                  "Signature-verified payment capture",
                  "Webhook-driven payout status",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 shrink-0 text-razorpay" />
                    <span className="text-foreground/90">{t}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-5 text-[11px] text-muted-foreground">
                Prototype runs in demo/test mode until Razorpay test credentials are configured.
              </p>
            </div>
          </article>

          {/* Ecosystem */}
          <div className="grid gap-4 sm:grid-cols-3">
            {ecosystem.map((p) => (
              <article
                key={p.name}
                className="surface-glass flex flex-col rounded-3xl p-6 transition-transform duration-500 hover:-translate-y-1"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary">
                  <p.icon className="h-5 w-5 text-accent" />
                </span>
                <p className="mt-4 font-display text-lg font-bold">{p.name}</p>
                <p className="text-xs tracking-wide text-muted-foreground uppercase">{p.role}</p>
                <p className="mt-3 text-sm text-muted-foreground">{p.note}</p>
              </article>
            ))}

            <div className="surface-glass rounded-3xl p-6 sm:col-span-3">
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                Mobility and courier networks shown here are the integrations SwiftCarry is designed
                to plug into for first-mile, last-mile and overflow legs. Razorpay is the payment
                rail the product is built on. Names are used to describe intended integrations, not
                to claim endorsement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
