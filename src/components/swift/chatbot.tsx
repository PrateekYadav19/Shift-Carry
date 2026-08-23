import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  greeting,
  initialBotState,
  msg,
  reply,
  type BotState,
  type ChatMsg,
} from "@/lib/swift/chatbot";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";

const PREFILL_KEY = "swiftcarry.prefill";

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>(() => greeting());
  const [state, setState] = useState<BotState>(initialBotState);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, typing]);

  const send = (text: string) => {
    const t = text.trim().slice(0, 300);
    if (!t) return;
    setInput("");
    setMessages((m) => [...m, msg("user", t)]);

    if (/open tracking page/i.test(t)) {
      void navigate({ to: "/track" });
      return;
    }

    setTyping(true);
    setTimeout(() => {
      const res = reply(state, t);
      setState(res.state);
      setMessages((m) => [...m, ...res.messages]);
      setTyping(false);

      if (/prefill/i.test(t) && res.state.prefs.tier) {
        const p = res.state.prefs;
        window.localStorage.setItem(
          PREFILL_KEY,
          JSON.stringify({
            originCity: p.originCity,
            destinationCity: p.destinationCity,
            weightKg: p.weightKg,
            tier: p.tier,
          }),
        );
        setTimeout(() => void navigate({ to: "/book" }), 600);
      }
      if (/^book a parcel$/i.test(t)) setState({ step: "priority", prefs: res.state.prefs });
    }, 520);
  };

  const last = messages[messages.length - 1];

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open delivery assistant"
        className="brand-bg glow fixed right-5 bottom-5 z-50 flex h-14 w-14 items-center justify-center rounded-2xl text-primary-foreground transition-transform hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div className="surface-glass fixed right-5 bottom-24 z-50 flex h-[540px] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl bg-card/95">
          <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4">
            <span className="brand-bg flex h-9 w-9 items-center justify-center rounded-xl">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </span>
            <div>
              <p className="text-sm font-semibold">Carry</p>
              <p className="text-xs text-muted-foreground">Books & tracks parcels for you</p>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m) =>
              m.tool ? (
                <p
                  key={m.id}
                  className="mx-auto w-fit max-w-full rounded-lg bg-secondary/60 px-3 py-1.5 font-mono text-[10px] break-all text-muted-foreground"
                >
                  ⚡ {m.text}
                </p>
              ) : (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                      m.role === "user"
                        ? "brand-bg text-primary-foreground"
                        : "bg-secondary/70 text-foreground"
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: m.text
                        .replace(/[<>]/g, "")
                        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                        .replace(/`(.+?)`/g, "<code>$1</code>"),
                    }}
                  />
                </div>
              ),
            )}
            {typing && (
              <div className="flex gap-1 pl-2">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                    style={{ animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          {last?.chips && !typing && (
            <div className="flex flex-wrap gap-2 px-4 pb-2">
              {last.chips.map((c) => (
                <button
                  key={c}
                  onClick={() => send(c)}
                  className="rounded-full border border-primary/40 bg-primary/8 px-3 py-1.5 text-xs text-primary transition-colors hover:bg-primary/15"
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          <form
            className="flex gap-2 border-t border-border/60 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <Input
              value={input}
              maxLength={300}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything…"
              className="h-10"
            />
            <Button type="submit" variant="hero" size="icon" className="h-10 w-10 shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
