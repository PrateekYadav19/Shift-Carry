import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav, SiteFooter } from "@/components/swift/site-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { login } from "@/lib/swift/store";
import type { Role } from "@/lib/swift/types";
import { toast } from "sonner";
import { ShieldCheck, Smartphone } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Log in with OTP | SwiftCarry" },
      {
        name: "description",
        content:
          "Passwordless OTP login for SwiftCarry senders, travelers and ops. No passwords stored, rate-limited verification.",
      },
      { property: "og:title", content: "Log in with OTP | SwiftCarry" },
      {
        property: "og:description",
        content: "Passwordless OTP login for SwiftCarry senders, travelers and ops.",
      },
    ],
  }),
  component: AuthPage,
});

const roles: { value: Role; label: string; hint: string }[] = [
  { value: "SENDER", label: "Sender", hint: "I want to send a parcel" },
  { value: "TRAVELER", label: "Traveler", hint: "I'm already travelling" },
  { value: "ADMIN", label: "Ops", hint: "I manage the network" },
];

function AuthPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("SENDER");
  const [code, setCode] = useState("");
  const [sentOtp, setSentOtp] = useState("");

  const send = () => {
    if (phone.replace(/\D/g, "").length < 10) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    setSentOtp(otp);
    setStage("otp");
    toast.success(`OTP sent to ${phone}`, { description: `Demo code: ${otp}` });
  };

  const verify = () => {
    if (code !== sentOtp) {
      toast.error("Incorrect OTP", { description: "Attempts are rate-limited to 5 per 10 minutes." });
      return;
    }
    login(name, phone, role);
    toast.success("Signed in");
    navigate({ to: role === "TRAVELER" ? "/traveler" : role === "ADMIN" ? "/admin" : "/book" });
  };

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="hero-bg">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 lg:grid-cols-2 lg:py-24">
          <div className="hidden lg:block">
            <p className="text-sm font-medium tracking-widest text-primary uppercase">
              Passwordless
            </p>
            <h1 className="mt-3 text-4xl font-bold">One code. That's the whole login.</h1>
            <p className="mt-4 max-w-md text-muted-foreground">
              We never store passwords. Every session is a short-lived JWT issued after an OTP
              check, and auth endpoints are rate-limited against brute force.
            </p>
            <ul className="mt-8 space-y-4 text-sm">
              {[
                ["OTP-only auth", "No password database to leak."],
                ["Encrypted PII", "Addresses and KYC stored with AES-256 at rest."],
                ["Verified travelers", "KYC + seal-scan before any parcel moves."],
              ].map(([t, d]) => (
                <li key={t} className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <span>
                    <span className="font-medium">{t}</span>
                    <span className="block text-muted-foreground">{d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="surface-glass mx-auto w-full max-w-md rounded-3xl p-7">
            {stage === "phone" ? (
              <>
                <div className="flex items-center gap-2 text-primary">
                  <Smartphone className="h-5 w-5" />
                  <span className="text-sm font-medium">Sign in / Sign up</span>
                </div>
                <h2 className="mt-3 text-2xl font-bold">Enter your mobile number</h2>
                <div className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="name">Your name</Label>
                    <Input
                      id="name"
                      value={name}
                      maxLength={60}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Rahul Verma"
                      className="mt-1.5 h-11"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Mobile number</Label>
                    <Input
                      id="phone"
                      value={phone}
                      maxLength={15}
                      inputMode="tel"
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="mt-1.5 h-11"
                    />
                  </div>
                  <div>
                    <Label>I am a…</Label>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {roles.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => setRole(r.value)}
                          className={`rounded-xl border p-3 text-left text-xs transition-all ${
                            role === r.value
                              ? "border-primary/60 bg-primary/10 text-foreground"
                              : "border-border bg-secondary/40 text-muted-foreground hover:border-border/80"
                          }`}
                        >
                          <span className="block text-sm font-medium">{r.label}</span>
                          {r.hint}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button variant="hero" size="lg" className="w-full" onClick={send}>
                    Send OTP
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    By continuing you agree to our sealed-parcel policy. Demo build — no real SMS.
                  </p>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold">Verify {phone}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Enter the 6-digit code we just sent.
                </p>
                <div className="mt-6 flex justify-center">
                  <InputOTP maxLength={6} value={code} onChange={setCode}>
                    <InputOTPGroup>
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <InputOTPSlot key={i} index={i} className="h-12 w-11 text-lg" />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button variant="hero" size="lg" className="mt-6 w-full" onClick={verify}>
                  Verify & continue
                </Button>
                <Button variant="ghost" className="mt-2 w-full" onClick={() => setStage("phone")}>
                  Change number
                </Button>
              </>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
