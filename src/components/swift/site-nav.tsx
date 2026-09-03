import { Link, useRouterState } from "@tanstack/react-router";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { useDB, logout } from "@/lib/swift/store";
import { LogOut, Menu } from "lucide-react";
import { useState } from "react";

const links = [
  { to: "/book", label: "Send a parcel" },
  { to: "/track", label: "Track" },
  { to: "/dashboard", label: "My shipments" },
  { to: "/traveler", label: "Become a traveler" },
  { to: "/admin", label: "Ops" },
] as const;

export function SiteNav() {
  const { db, hydrated } = useDB();
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${
                path.startsWith(l.to)
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {hydrated && db.user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {db.user.name} · {db.user.role.toLowerCase()}
              </span>
              <Button variant="ghost" size="icon" aria-label="Log out" onClick={() => logout()}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link to="/auth">Log in</Link>
            </Button>
          )}
          <Button asChild variant="hero" className="hidden sm:inline-flex">
            <Link to="/book">Book now</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border/60 bg-background/95 px-5 py-3 md:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/auth"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            Log in
          </Link>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-5 text-sm text-muted-foreground sm:flex-row">
        <Logo />
        <p>Crowd-sourced parcel delivery · Hackathon demo · Razorpay test mode</p>
      </div>
    </footer>
  );
}
