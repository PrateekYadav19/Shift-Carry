import { useEffect, useState } from "react";
import planeImg from "@/assets/fleet-plane.png";
import trainImg from "@/assets/fleet-train.png";
import busImg from "@/assets/fleet-bus.png";
import bikeImg from "@/assets/fleet-bike.png";

/**
 * FleetLayer — the living background of SwiftCarry.
 *
 * Layout logic (depth-sorted, slowest/furthest first):
 *   z0  sky wash + drifting cloud haze
 *   z1  a second, tiny airliner crossing the far distance right → left
 *   z2  the hero airliner crossing low-left → high-right (the "Express" lane)
 *   z3  the high-speed train sliding along a horizon rail (the "Standard" lane)
 *   z4  the intercity coach rolling the opposite way, a little larger
 *   z5  the last-mile delivery rider, closest to the viewer and fastest
 *
 * Parallax: each lane translates vertically at a different fraction of the
 * scroll offset, so the whole scene has believable depth as the page moves.
 */

const useScrollY = () => {
  const [y, setY] = useState(0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setY(window.scrollY));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return y;
};

const useMounted = () => {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
};

export function FleetLayer() {
  const y = useScrollY();
  const mounted = useMounted();

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      suppressHydrationWarning
    >
      {/* Sky wash + grid */}
      <div className="hero-bg absolute inset-0 opacity-90" />
      <div className="grid-lines absolute inset-0 opacity-40" />
      <div className="noise absolute inset-0 opacity-[0.35]" />

      {/* Soft moving light blooms */}
      <div
        className="animate-float absolute -top-40 -left-32 h-[42rem] w-[42rem] rounded-full opacity-40 blur-3xl"
        style={{
          background: "radial-gradient(circle, oklch(0.6 0.14 78 / 0.35), transparent 65%)",
          transform: `translateY(${y * 0.12}px)`,
        }}
      />
      <div
        className="absolute top-1/3 -right-40 h-[38rem] w-[38rem] rounded-full opacity-40 blur-3xl"
        style={{
          background: "radial-gradient(circle, oklch(0.55 0.12 195 / 0.32), transparent 65%)",
          transform: `translateY(${y * -0.08}px)`,
        }}
      />

      {mounted && (
        <>
          {/* Far airliner — right to left, tiny, hazy */}
          <div
            className="absolute top-[8%] left-0 w-[16vw] min-w-[130px] opacity-[0.22] blur-[1px]"
            style={{ transform: `translateY(${y * 0.05}px)` }}
          >
            <img
              src={planeImg}
              alt=""
              width={1536}
              height={768}
              loading="lazy"
              className="animate-fly-back w-full"
            />
          </div>

          {/* Hero airliner — the Express lane */}
          <div
            className="absolute top-[16%] left-0 w-[34vw] min-w-[260px] opacity-[0.5]"
            style={{ transform: `translateY(${y * -0.16}px)` }}
          >
            <img
              src={planeImg}
              alt=""
              width={1536}
              height={768}
              loading="lazy"
              className="animate-fly w-full drop-shadow-[0_30px_60px_oklch(0.05_0.02_250/0.6)]"
            />
          </div>

          {/* Contrail rail under the flight path */}
          <svg
            className="absolute top-[30%] left-0 h-24 w-full opacity-30"
            viewBox="0 0 1200 100"
            preserveAspectRatio="none"
            style={{ transform: `translateY(${y * -0.1}px)` }}
          >
            <path
              d="M0 80 C 300 80 500 20 1200 8"
              fill="none"
              stroke="oklch(0.79 0.17 78)"
              strokeWidth="1.5"
              strokeDasharray="10 14"
              className="animate-dash"
            />
          </svg>

          {/* High-speed train — the Standard lane */}
          <div
            className="absolute top-[52%] left-0 w-[58vw] min-w-[420px] opacity-[0.4]"
            style={{ transform: `translateY(${y * 0.1}px)` }}
          >
            <img
              src={trainImg}
              alt=""
              width={1920}
              height={640}
              loading="lazy"
              className="animate-roll w-full"
            />
            <div className="mt-1 h-px w-full bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
          </div>

          {/* Intercity coach — opposite direction */}
          <div
            className="absolute top-[68%] left-0 w-[22vw] min-w-[190px] opacity-[0.35]"
            style={{ transform: `translateY(${y * 0.18}px)` }}
          >
            <img
              src={busImg}
              alt=""
              width={1536}
              height={768}
              loading="lazy"
              className="animate-roll-back w-full"
            />
          </div>

          {/* Last-mile rider — closest, fastest */}
          <div
            className="absolute bottom-[4%] left-0 w-[13vw] min-w-[120px] opacity-[0.45]"
            style={{ transform: `translateY(${y * 0.26}px)` }}
          >
            <img
              src={bikeImg}
              alt=""
              width={1024}
              height={768}
              loading="lazy"
              className="w-full"
              style={{ animation: "roll-right 18s linear infinite" }}
            />
          </div>
        </>
      )}

      {/* Vignette so foreground text always wins */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_40%,transparent_10%,var(--background)_92%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}

/** A horizontal, infinitely scrolling strip of vehicle silhouettes + route names. */
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
