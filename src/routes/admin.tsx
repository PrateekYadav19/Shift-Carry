import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/swift/site-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { addEvent, advance, inr, mutateShipment, useDB } from "@/lib/swift/store";
import { STATUS_LABEL } from "@/lib/swift/types";
import { toast } from "sonner";
import { AlertTriangle, PackageCheck, ShieldCheck, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Ops console | SwiftCarry Admin" },
      {
        name: "description",
        content:
          "Operations console for SwiftCarry: every shipment, the seal verification queue, flagged disputes and Razorpay payment status in one view.",
      },
      { property: "og:title", content: "Ops console | SwiftCarry Admin" },
      {
        property: "og:description",
        content: "Shipments, disputes, verification queue and payment status for the network.",
      },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { db, hydrated } = useDB();
  const shipments = db.shipments;
  const disputes = shipments.filter((s) => s.flagged);
  const queue = shipments.filter((s) => s.status === "BOOKED" || s.status === "VERIFIED_SEALED");
  const gmv = shipments
    .filter((s) => s.payment.status === "CAPTURED")
    .reduce((a, s) => a + s.priceInPaise, 0);

  const stats = [
    { label: "Total shipments", value: String(shipments.length), icon: PackageCheck },
    { label: "Verification queue", value: String(queue.length), icon: ShieldCheck },
    { label: "Open disputes", value: String(disputes.length), icon: AlertTriangle },
    { label: "Captured GMV", value: inr(gmv), icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="hero-bg min-h-[80vh]">
        <div className="mx-auto w-full max-w-7xl px-5 py-12">
          <h1 className="text-3xl font-bold sm:text-4xl">Ops console</h1>
          <p className="mt-2 text-muted-foreground">
            Every shipment, seal and rupee in the network — live.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="surface-glass rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <s.icon className="h-4 w-4 text-primary" />
                </div>
                <p className="mt-2 font-display text-2xl font-bold">{hydrated ? s.value : "—"}</p>
              </div>
            ))}
          </div>

          <Tabs defaultValue="all" className="mt-8">
            <TabsList>
              <TabsTrigger value="all">All shipments</TabsTrigger>
              <TabsTrigger value="queue">Verification queue</TabsTrigger>
              <TabsTrigger value="disputes">Disputes</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-5">
              <div className="surface-glass overflow-x-auto rounded-3xl p-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shipment</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Settlement</TableHead>
                      <TableHead className="text-right">Traveller reward</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shipments.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono text-xs">{s.id}</TableCell>
                        <TableCell className="text-sm">
                          {s.originCity} → {s.destinationCity}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{s.tier}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{STATUS_LABEL[s.status]}</TableCell>
                        <TableCell>
                          <span
                            className={
                              s.payment.status === "CAPTURED"
                                ? "text-success"
                                : s.payment.status === "FAILED"
                                  ? "text-destructive"
                                  : "text-warning"
                            }
                          >
                            {s.payment.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{inr(s.priceInPaise)}</TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm" variant="ghost">
                            <Link to="/track" search={{ id: s.id }}>
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="queue" className="mt-5 space-y-3">
              {queue.length === 0 && (
                <p className="text-sm text-muted-foreground">Queue is clear.</p>
              )}
              {queue.map((s) => (
                <div
                  key={s.id}
                  className="surface-glass flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5"
                >
                  <div>
                    <p className="font-mono text-sm">{s.id}</p>
                    <p className="text-sm text-muted-foreground">
                      Seal {s.sealId} · {s.category} · {s.weightKg} kg · {STATUS_LABEL[s.status]}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="hero"
                      onClick={() => {
                        advance(s.id);
                        toast.success("Seal scan recorded");
                      }}
                    >
                      Approve seal
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        mutateShipment(s.id, (x) => ({ ...x, flagged: true }));
                        addEvent(s.id, "NOTE", "Held by ops for manual inspection.");
                        toast.error("Shipment held for inspection");
                      }}
                    >
                      Hold
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="disputes" className="mt-5 space-y-3">
              {disputes.length === 0 && (
                <p className="text-sm text-muted-foreground">No open disputes. </p>
              )}
              {disputes.map((s) => (
                <div
                  key={s.id}
                  className="surface-glass flex flex-wrap items-center justify-between gap-3 rounded-2xl border-l-4 border-l-destructive p-5"
                >
                  <div>
                    <p className="font-mono text-sm">{s.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {s.senderName} · {s.originCity} → {s.destinationCity}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="soft"
                    onClick={() => {
                      mutateShipment(s.id, (x) => ({ ...x, flagged: false }));
                      addEvent(s.id, "NOTE", "Dispute resolved by ops.");
                      toast.success("Dispute resolved");
                    }}
                  >
                    Resolve
                  </Button>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
