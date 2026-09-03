import type { ReactNode } from "react";
import { Check, CircleDashed, Loader2, ShieldCheck } from "lucide-react";
import { inr } from "@/lib/swift/store";
import {
  SETTLEMENT_LABEL,
  lifecycleStages,
  payoutSplit,
  paymentSteps,
  settlementStatus,
  type SettlementStatus,
} from "@/lib/swift/payments";
import type { Shipment } from "@/lib/swift/types";

/* ------------------------------------------------------------------ *
 * Razorpay presentation kit.
 * The mark is used sparingly: checkout, payment summaries and one
 * landing-page section. Copy always says "powered by the Razorpay API",
 * never claims an official partnership or live settlements.
 * ------------------------------------------------------------------ */

export function RazorpayMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label="Razorpay">
      <circle cx="16" cy="16" r="16" fill="var(--razorpay)" />
      <path d="M20.6 7.4 18 17.2l-3.3 1.4 2-7.6-6.4 3.9-1.6 6H5.9L9.4 7.9l11.2-.5Z" fill="#fff" opacity=".9" />
      <path d="m22.9 9.6-4.7 14.9h-4.4l2.4-7.5 6.7-7.4Z" fill="#fff" />
    </svg>
  );
}

export function PoweredByRazorpay({
  size = "sm",
  className = "",
}: {
  size?: "sm" | "lg";
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary/50 px-3 py-1.5 ${
        size === "lg" ? "text-sm" : "text-xs"
      } text-muted-foreground ${className}`}
    >
      <RazorpayMark className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
      Payments powered by <span className="font-semibold text-foreground">Razorpay</span>
    </span>
  );
}

export function DemoTag({ children = "Demo value" }: { children?: ReactNode }) {
  return (
    <span className="rounded-md border border-warning/40 bg-warning/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-warning uppercase">
      {children}
    </span>
  );
}

/* ------------------------------ status ---------------------------- */

export function StepRow({
  label,
  done,
  active = false,
}: {
  label: string;
  done: boolean;
  active?: boolean;
}) {
  return (
    <li className="flex items-center gap-3 text-sm">
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
          done
            ? "border-success/50 bg-success/15 text-success"
            : active
              ? "border-primary/50 bg-primary/10 text-primary"
              : "border-border bg-secondary/40 text-muted-foreground"
        }`}
      >
        {done ? (
          <Check className="h-3.5 w-3.5" />
        ) : active ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <CircleDashed className="h-3.5 w-3.5" />
        )}
      </span>
      <span className={done ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </li>
  );
}

export function PaymentStatusCard({ shipment }: { shipment: Shipment }) {
  const steps = paymentSteps(shipment);
  const firstPending = steps.findIndex((s) => !s.done);

  return (
    <div className="surface-glass rounded-3xl p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-base font-semibold">
          <RazorpayMark className="h-5 w-5" /> Payment status
        </h3>
        <DemoTag>{shipment.payment.razorpayPaymentId?.includes("demo") ? "Demo" : "Test mode"}</DemoTag>
      </div>

      <ul className="mt-4 space-y-2.5">
        {steps.map((s, i) => (
          <StepRow key={s.label} label={s.label} done={s.done} active={i === firstPending} />
        ))}
      </ul>

      <dl className="mt-5 space-y-2 border-t border-border/70 pt-4 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Payment ID</dt>
          <dd className="truncate font-mono text-xs">
            {shipment.payment.razorpayPaymentId ?? "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Order ID</dt>
          <dd className="truncate font-mono text-xs">{shipment.payment.razorpayOrderId}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Shipment ID</dt>
          <dd className="truncate font-mono text-xs">{shipment.id}</dd>
        </div>
      </dl>
    </div>
  );
}

export function SettlementBadge({ status }: { status: SettlementStatus }) {
  const tone =
    status === "COMPLETED"
      ? "border-success/40 bg-success/10 text-success"
      : status === "PROCESSING"
        ? "border-primary/40 bg-primary/10 text-primary"
        : "border-border bg-secondary/50 text-muted-foreground";
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${tone}`}>
      Settlement status: {SETTLEMENT_LABEL[status]}
    </span>
  );
}

/* ---------------------------- breakdown --------------------------- */

export function PayoutBreakdown({
  totalPaise,
  title = "Where your payment goes",
}: {
  totalPaise: number;
  title?: string;
}) {
  const s = payoutSplit(totalPaise);
  const rows: { label: string; value: number; hint: string }[] = [
    { label: "Pickup partner", value: s.pickupPartnerPaise, hint: "Collects & delivers to the verification point" },
    { label: "Traveller reward", value: s.travellerRewardPaise, hint: "Carries the sealed parcel on their trip" },
    { label: "Destination delivery", value: s.destinationDeliveryPaise, hint: "Last-mile rider at the drop city" },
    { label: "Insurance / protection", value: s.insurancePaise, hint: "Declared-value cover for the parcel" },
    { label: "Platform / service fee", value: s.platformFeePaise, hint: "Verification, matching, support, payment fees" },
  ];

  return (
    <div className="surface-glass rounded-3xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-base font-semibold">{title}</h3>
        <DemoTag>Illustrative split</DemoTag>
      </div>

      <div className="mt-4 flex items-baseline justify-between border-b border-border/70 pb-4">
        <span className="text-sm text-muted-foreground">Customer payment</span>
        <span className="font-display text-2xl font-bold">{inr(totalPaise)}</span>
      </div>

      <ul className="mt-4 space-y-3">
        {rows.map((r) => {
          const pct = Math.max(2, Math.round((r.value / totalPaise) * 100));
          return (
            <li key={r.label}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span>{r.label}</span>
                <span className="font-medium">{inr(r.value)}</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <span
                  className="brand-bg block h-full rounded-full transition-[width] duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{r.hint}</p>
            </li>
          );
        })}
      </ul>

      <p className="mt-5 flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        The platform coordinates these rewards between the sender, partners and the traveller.
        Amounts shown are illustrative demo values, not a live settlement schedule.
      </p>
    </div>
  );
}

/* ---------------------------- lifecycle --------------------------- */

export function PaymentLifecycleRail({ shipment }: { shipment: Shipment }) {
  const stages = lifecycleStages(shipment);
  return (
    <div className="surface-glass rounded-3xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-base font-semibold">Payment ↔ handoff lifecycle</h3>
        <SettlementBadge status={settlementStatus(shipment)} />
      </div>
      <ol className="mt-5 space-y-2.5">
        {stages.map((s, i) => (
          <StepRow
            key={s.label}
            label={s.label}
            done={s.done}
            active={!s.done && stages.slice(0, i).every((x) => x.done)}
          />
        ))}
      </ol>
    </div>
  );
}
