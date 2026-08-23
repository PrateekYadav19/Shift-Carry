import { useEffect, useRef, useState } from "react";
import planeImg from "@/assets/fleet-plane.png";
import trainImg from "@/assets/fleet-train.png";
import busImg from "@/assets/fleet-bus.png";
import bikeImg from "@/assets/fleet-bike.png";

/**
 * FleetLayer — the living background of SwiftCarry.
 *
 * Performance notes (this is why it feels smooth now):
 *  - Scroll never triggers a React re-render. We write a single CSS variable
 *    (`--sy`) on the root node inside a rAF loop, and every lane derives its
 *    parallax offset from that variable in pure CSS.
 *  - The parallax value is lerped toward the real scroll position, so the
 *    motion eases instead of snapping frame-to-frame.
 *  - Every animated node is promoted to its own compositor layer
 *    (translate3d + will-change), so nothing repaints on the main thread.
 *
 * Direction notes (the artwork dictates the lane direction):
 *  - The airliner render points NOSE-LEFT  → it must travel right → left.
 *  - The train render points nose-right    → travels left → right.
 *  - The coach is mirrored in CSS          → travels right → left.
 *  - The scooter rider points right        → travels left → right, foreground.
 */

/** Writes a smoothed scroll offset into `--sy` on the given element. */
function useSmoothParallax<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let current = window.scrollY;
    let target = current;
    let raf = 0;
    let idle = 0;

    const onScroll = () => {
      target = window.scrollY;
      idle = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const tick = () => {
      current += (target - current) * 0.12;
      const delta = Math.abs(target - current);
      if (delta < 0.2) {
        current = target;
        idle += 1;
      }
      el.style.setProperty("--sy", `${current.toFixed(2)}px`);
      if (idle > 4) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    el.style.setProperty("--sy", `${current}px`);
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return ref;
}

/** Animations only start after hydration so SSR markup stays identical. */
const useMounted = () => {
  const [m, setM] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setM(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return m;
};

/** A depth lane: parallax speed is a plain multiplier on the shared `--sy`. */
function Lane({
  speed,
  className,
  children,
}: {
  speed: number;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`absolute will-change-transform ${className}`}
      style={{ transform: `translate3d(0, calc(var(--sy, 0px) * ${speed}), 0)` }}
    >
      {children}
    </div>
  );
}

export function FleetLayer() {
  const rootRef = useSmoothParallax<HTMLDivElement>();
  const mounted = useMounted();

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden [contain:strict]"
      suppressHydrationWarning
    >
      {/* --- z0 · atmosphere ------------------------------------------------ */}
      <div className="hero-bg absolute inset-0 opacity-90" />
      <div className="grid-lines absolute inset-0 opacity-30" />
      <div className="noise absolute inset-0 opacity-[0.25]" />

      <Lane speed={0.1} className="-top-40 -left-32 h-[42rem] w-[42rem] rounded-full opacity-40 blur-3xl">
        <div
          className="animate-float h-full w-full rounded-full"
          style={{
            background: "radial-gradient(circle, oklch(0.6 0.14 78 / 0.35), transparent 65%)",
          }}
        />
      </Lane>
      <Lane speed={-0.07} className="top-1/3 -right-40 h-[38rem] w-[38rem] rounded-full opacity-40 blur-3xl">
        <div
          className="h-full w-full rounded-full"
          style={{
            background: "radial-gradient(circle, oklch(0.55 0.12 195 / 0.32), transparent 65%)",
          }}
        />
      </Lane>

      {mounted && (
        <>
          {/* --- z1 · far airliner, hazy, high and slow --------------------- */}
          <Lane speed={0.04} className="top-[7%] left-0 w-[15vw] min-w-[120px] opacity-[0.18] blur-[1.5px]">
            <img
              src={planeImg}
              alt=""
              width={1536}
              height={768}
              loading="lazy"
              decoding="async"
              className="animate-fly-far w-full"
            />
          </Lane>

          {/* --- z2 · hero airliner (Express lane), right → left ------------ */}
          <Lane speed={-0.14} className="top-[15%] left-0 w-[32vw] min-w-[250px] opacity-[0.55]">
            <img
              src={planeImg}
              alt=""
              width={1536}
              height={768}
              loading="lazy"
              decoding="async"
              className="animate-fly w-full drop-shadow-[0_30px_60px_oklch(0.05_0.02_250/0.6)]"
            />
          </Lane>

          {/* --- contrail rail under the flight path ------------------------ */}
          <Lane speed={-0.09} className="top-[29%] left-0 h-24 w-full opacity-25">
            <svg className="h-24 w-full" viewBox="0 0 1200 100" preserveAspectRatio="none">
              <path
                d="M0 12 C 500 20 780 78 1200 84"
                fill="none"
                stroke="oklch(0.79 0.17 78)"
                strokeWidth="1.5"
                strokeDasharray="10 14"
                className="animate-dash"
              />
            </svg>
          </Lane>

          {/* --- z3 · high-speed train (Standard lane), left → right -------- */}
          <Lane speed={0.08} className="top-[52%] left-0 w-[56vw] min-w-[400px] opacity-[0.38]">
            <div className="animate-roll w-full">
              <img
                src={trainImg}
                alt=""
                width={1920}
                height={640}
                loading="lazy"
                decoding="async"
                className="w-full"
              />
              <div className="mt-1 h-px w-full bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
            </div>
          </Lane>

          {/* --- z4 · intercity coach, mirrored, right → left --------------- */}
          <Lane speed={0.15} className="top-[68%] left-0 w-[21vw] min-w-[180px] opacity-[0.32]">
            <img
              src={busImg}
              alt=""
              width={1536}
              height={768}
              loading="lazy"
              decoding="async"
              className="animate-roll-back w-full"
            />
          </Lane>
        </>
      )}

      {/* --- vignette so foreground copy always wins --------------------- */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_40%,transparent_10%,var(--background)_92%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

      {/* --- z5 · last-mile rider sits ABOVE the vignette so it stays visible */}
      {mounted && (
        <Lane speed={0.22} className="bottom-[6%] left-0 w-[15vw] min-w-[150px] opacity-90">
          <div className="animate-ride relative w-full">
            <img
              src={bikeImg}
              alt=""
              width={1024}
              height={768}
              loading="lazy"
              decoding="async"
              className="w-full drop-shadow-[0_22px_38px_oklch(0.05_0.02_250/0.75)]"
            />
            <div className="mt-0.5 h-px w-full bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
          </div>
        </Lane>
      )}
    </div>
  );
}

/** A horizontal, infinitely scrolling strip of live route matches. */
export function RouteMarquee() {
  const routes = [
    { label: "Delhi → Mumbai", mode: "Flight · 24h" },
    { label: "Bengaluru → Hyderabad", mode: "Train · 1 day" },
    { label: "Pune → Ahmedabad", mode: "Bus · 2 days" },
    { label: "Chennai → Kochi", mode: "Flight · 24h" },
    { label: "Jaipur → Delhi", mode: "Bus · 1 day" },
    { label: "Kolkata → Patna", mode: "Train · 2 days" },
  ];
  const doubled = [...routes, ...routes];

  return (
    <div className="relative overflow-hidden border-y border-border/60 bg-card/30 py-4 backdrop-blur-sm">
      <div className="animate-marquee flex w-max gap-10 pr-10">
        {doubled.map((r, i) => (
          <span key={`${r.label}-${i}`} className="flex items-center gap-3 text-sm whitespace-nowrap">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="font-display font-semibold">{r.label}</span>
            <span className="text-muted-foreground">{r.mode}</span>
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
