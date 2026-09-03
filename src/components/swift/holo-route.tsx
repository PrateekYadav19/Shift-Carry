import { useReveal } from "@/hooks/use-reveal";
import parcel3d from "@/assets/3d-parcel.png";
import plane3d from "@/assets/3d-plane.png";
import train3d from "@/assets/3d-train.png";
import bus3d from "@/assets/3d-bus.png";
import { ShieldCheck, Sparkles, Timer } from "lucide-react";

/**
 * Holographic Route Map — dark glass panel, glowing SVG arcs, pulsing nodes and
 * 3D transport objects floating above the corridor. Purely presentational.
 */

const nodes = [
  { id: "DEL", label: "Delhi", x: 12, y: 68 },
  { id: "JAI", label: "Jaipur", x: 30, y: 40 },
  { id: "BOM", label: "Mumbai", x: 52, y: 78 },
  { id: "HYD", label: "Hyderabad", x: 70, y: 52 },
  { id: "BLR", label: "Bengaluru", x: 88, y: 30 },
];

const arcs = [
  "M 12 68 C 24 22, 40 22, 52 78",
  "M 52 78 C 60 40, 64 36, 70 52",
  "M 70 52 C 76 20, 82 20, 88 30",
  "M 12 68 C 34 96, 40 88, 70 52",
];

const objects = [
  { img: plane3d, label: "Flight · Express", cls: "left-[8%] top-[6%]", delay: "0s" },
  { img: train3d, label: "Train · Standard", cls: "left-[44%] top-[2%]", delay: "1.2s" },
  { img: bus3d, label: "Bus · Standard", cls: "right-[6%] top-[14%]", delay: "2.4s" },
];

const chips = [
  { icon: ShieldCheck, text: "Tamper seal verified at every node" },
  { icon: Timer, text: "Express corridors settle inside 24h" },
  { icon: Sparkles, text: "AI re-scores the corridor every minute" },
];

export function HoloRoute() {
  const r = useReveal<HTMLDivElement>(0);

  return (
    <section className="relative mx-auto w-full max-w-7xl px-5 py-20">
      <div ref={r.ref} style={r.style} className={r.className}>
        <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
          <span className="h-px w-8 bg-primary/60" />
          Live corridor intelligence
        </p>
        <h2 className="mt-4 max-w-3xl text-3xl font-bold sm:text-4xl lg:text-5xl">
          A <span className="text-gradient-live">holographic map</span> of every route your parcel
          can ride.
        </h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Each glowing node is a verification point. Each arc is spare capacity already moving —
          flights overhead, trains and coaches on the ground, riders closing the last mile.
        </p>

        <div className="neon-edge sheen glow-violet relative mt-10 overflow-hidden rounded-[2rem] bg-[oklch(0.18_0.03_255/0.75)] p-6 sm:p-10">
          {/* aurora wash */}
          <div
            aria-hidden
            className="animate-aurora pointer-events-none absolute inset-0 bg-[radial-gradient(55%_60%_at_20%_20%,var(--violet-glow),transparent_65%),radial-gradient(50%_60%_at_85%_35%,var(--cyan-glow),transparent_65%)] opacity-70"
          />
          <div aria-hidden className="grid-lines pointer-events-none absolute inset-0 opacity-40" />

          <div className="relative aspect-[16/8] w-full">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
              aria-hidden
            >
              <defs>
                <linearGradient id="holo-arc" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="oklch(0.82 0.14 195)" stopOpacity="0.15" />
                  <stop offset="50%" stopColor="oklch(0.86 0.15 82)" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="oklch(0.72 0.15 295)" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              {arcs.map((d, i) => (
                <g key={d}>
                  <path
                    d={d}
                    fill="none"
                    stroke="oklch(1 0 0 / 0.1)"
                    strokeWidth="0.5"
                    vectorEffect="non-scaling-stroke"
                  />
                  <path
                    d={d}
                    fill="none"
                    stroke="url(#holo-arc)"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeDasharray="6 10"
                    vectorEffect="non-scaling-stroke"
                    className="animate-dash"
                    style={{ animationDelay: `${i * 0.7}s` }}
                  />
                </g>
              ))}
            </svg>

            {nodes.map((n, i) => (
              <div
                key={n.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${n.x}%`, top: `${n.y}%` }}
              >
                <span className="relative flex h-3 w-3">
                  <span
                    className="animate-node absolute inline-flex h-full w-full rounded-full bg-primary/70"
                    style={{ animationDelay: `${i * 0.4}s` }}
                  />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-primary shadow-[0_0_18px_var(--gold-glow)]" />
                </span>
                <span className="mt-2 block text-[10px] font-medium tracking-[0.18em] text-foreground/70 uppercase">
                  {n.label}
                </span>
              </div>
            ))}

            {objects.map((o) => (
              <div
                key={o.label}
                className={`animate-float absolute w-24 sm:w-32 lg:w-40 ${o.cls}`}
                style={{ animationDelay: o.delay }}
              >
                <img
                  src={o.img}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  width={768}
                  height={768}
                  className="w-full drop-shadow-[0_18px_40px_oklch(0.05_0.02_250/0.85)]"
                />
                <p className="mt-1 text-center text-[10px] tracking-wide text-muted-foreground uppercase">
                  {o.label}
                </p>
              </div>
            ))}
          </div>

          <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
            {chips.map((c) => (
              <div
                key={c.text}
                className="surface-glass lift flex items-center gap-3 rounded-2xl px-4 py-3"
              >
                <c.icon className="h-4 w-4 shrink-0 text-accent" />
                <p className="text-xs text-muted-foreground">{c.text}</p>
              </div>
            ))}
          </div>

          <div className="relative mt-6 flex items-center gap-4">
            <img
              src={parcel3d}
              alt="Sealed SwiftCarry parcel with a tamper-evident gold seal"
              loading="lazy"
              width={768}
              height={768}
              className="animate-float h-20 w-20 object-contain"
            />
            <div>
              <p className="font-display text-sm font-semibold">One sealed parcel, one seal ID</p>
              <p className="text-xs text-muted-foreground">
                The same seal travels every arc above — scanned at each node, released only by OTP.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
