import { SHIPMENT_STATUSES, STATUS_LABEL, type Shipment } from "@/lib/swift/types";
import { Check, Circle, Loader2 } from "lucide-react";

export function StatusTimeline({ shipment }: { shipment: Shipment }) {
  const current = SHIPMENT_STATUSES.indexOf(shipment.status);
  return (
    <ol className="relative space-y-1">
      {SHIPMENT_STATUSES.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const event = [...shipment.events].reverse().find((e) => e.type === s);
        return (
          <li key={s} className="relative flex gap-4 pb-6 last:pb-0">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all ${
                  done
                    ? "border-success/40 bg-success/15 text-success"
                    : active
                      ? "border-primary/60 bg-primary/15 text-primary glow"
                      : "border-border bg-secondary/40 text-muted-foreground"
                }`}
              >
                {done ? (
                  <Check className="h-4 w-4" />
                ) : active ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
              </span>
              {i < SHIPMENT_STATUSES.length - 1 && (
                <span
                  className={`mt-1 w-px flex-1 ${done ? "bg-success/40" : "bg-border"}`}
                  aria-hidden
                />
              )}
            </div>
            <div className="min-w-0 pt-1">
              <p
                className={`text-sm font-medium ${active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"}`}
              >
                {STATUS_LABEL[s]}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {event
                  ? `${new Date(event.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} · ${event.note}`
                  : "Pending"}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
