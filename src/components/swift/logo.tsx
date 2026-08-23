import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`group flex items-center gap-2.5 ${className}`}>
      <span className="brand-bg relative flex h-9 w-9 items-center justify-center rounded-xl">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 13h8l3-6 3 6h4" className="text-primary-foreground" />
          <circle cx="7" cy="18" r="2" className="text-primary-foreground" />
          <circle cx="17" cy="18" r="2" className="text-primary-foreground" />
        </svg>
      </span>
      <span className="font-display text-lg font-bold tracking-tight">
        Swift<span className="text-gradient">Carry</span>
      </span>
    </Link>
  );
}
