import { getShipment, quote } from "./store";
import { STATUS_LABEL, type Tier } from "./types";

export interface ChatMsg {
  id: string;
  role: "bot" | "user";
  text: string;
  chips?: string[];
  tool?: string;
}

export interface BotPrefs {
  priority?: "speed" | "cost";
  deadlineHours?: number;
  budgetRupees?: number;
  weightKg?: number;
  originCity?: string;
  destinationCity?: string;
  tier?: Tier;
}

export interface BotState {
  step:
    | "intro"
    | "priority"
    | "deadline"
    | "budget"
    | "route"
    | "weight"
    | "recommend"
    | "done";
  prefs: BotPrefs;
}

export const initialBotState: BotState = { step: "intro", prefs: {} };

const uid = () => Math.random().toString(36).slice(2, 9);
export const msg = (role: ChatMsg["role"], text: string, chips?: string[], tool?: string): ChatMsg =>
  ({ id: uid(), role, text, ...(chips ? { chips } : {}), ...(tool ? { tool } : {}) });

export const greeting = (): ChatMsg[] => [
  msg(
    "bot",
    "Hi! I'm Carry, your delivery assistant. I can book a parcel for you in under a minute, or track one you've already sent.",
    ["Book a parcel", "Track my parcel", "How does it work?"],
  ),
];

function recommend(prefs: BotPrefs): { tier: Tier; why: string } {
  const fast = prefs.priority === "speed" || (prefs.deadlineHours ?? 72) <= 24;
  const budgetTight =
    prefs.budgetRupees !== undefined && prefs.budgetRupees < quote({
      originCity: "",
      destinationCity: "",
      weightKg: prefs.weightKg ?? 1,
      tier: "EXPRESS",
    }).total / 100;
  if (fast && !budgetTight)
    return {
      tier: "EXPRESS",
      why: "you need it fast — I'll match a flight traveler for same-day/24h delivery.",
    };
  if (fast && budgetTight)
    return {
      tier: "STANDARD",
      why: "Express is above your budget, so I'll match the fastest train/bus traveler instead (1–3 days).",
    };
  return { tier: "STANDARD", why: "cost matters more, so a train/bus traveler saves you the most." };
}

/** Simulated LLM function-calling loop. */
export function reply(state: BotState, input: string): { state: BotState; messages: ChatMsg[] } {
  const t = input.trim();
  const lower = t.toLowerCase();
  const p = { ...state.prefs };

  // getShipmentStatus({ shipmentId }) — works at any point
  const idMatch = t.match(/SWC-[A-Z0-9]+/i);
  if (idMatch || /track/.test(lower)) {
    if (!idMatch)
      return {
        state,
        messages: [msg("bot", "Sure — what's the shipment ID? It looks like SWC-XXXXX.")],
      };
    const s = getShipment(idMatch[0]);
    if (!s)
      return {
        state,
        messages: [
          msg("bot", `I couldn't find ${idMatch[0].toUpperCase()}. Double-check the ID?`),
        ],
      };
    return {
      state,
      messages: [
        msg("bot", `getShipmentStatus({ shipmentId: "${s.id}" })`, undefined, "tool"),
        msg(
          "bot",
          `${s.id} is **${STATUS_LABEL[s.status]}** — ${s.originCity} → ${s.destinationCity}, seal ${s.sealId}. Payment: ${s.payment.status.toLowerCase()}. Recipient OTP is shared at handover only.`,
          ["Open tracking page"],
        ),
      ],
    };
  }

  if (/how does it work|how it works/.test(lower))
    return {
      state,
      messages: [
        msg(
          "bot",
          "Simple: you drop the parcel at a verification point, we scan and tamper-seal it, a local partner hands it to a verified traveler already going your way, and another partner delivers it at the other end. The recipient confirms with an OTP.",
          ["Book a parcel"],
        ),
      ],
    };

  switch (state.step) {
    case "intro":
    case "priority": {
      if (/cost|cheap|save|budget/.test(lower)) p.priority = "cost";
      else if (/speed|fast|urgent|express|quick/.test(lower)) p.priority = "speed";
      if (!p.priority)
        return {
          state: { step: "priority", prefs: p },
          messages: [
            msg("bot", "Got it. What matters more for this parcel — speed or cost?", [
              "Speed",
              "Cost",
            ]),
          ],
        };
      return {
        state: { step: "deadline", prefs: p },
        messages: [
          msg("bot", "When does it need to arrive?", ["Within 24 hours", "In 2–3 days", "No rush"]),
        ],
      };
    }
    case "deadline": {
      p.deadlineHours = /24|today|tomorrow|urgent/.test(lower)
        ? 24
        : /2|3|two|three/.test(lower)
          ? 72
          : 120;
      return {
        state: { step: "budget", prefs: p },
        messages: [msg("bot", "And roughly what's your budget in ₹?", ["₹500", "₹900", "Flexible"])],
      };
    }
    case "budget": {
      const n = Number(lower.replace(/[^\d]/g, ""));
      if (n) p.budgetRupees = n;
      return {
        state: { step: "route", prefs: p },
        messages: [msg("bot", "Which cities? Type it like `Delhi to Mumbai`.", ["Delhi to Mumbai"])],
      };
    }
    case "route": {
      const m = t.match(/(.+?)\s+(?:to|→|-)\s+(.+)/i);
      if (!m)
        return {
          state,
          messages: [msg("bot", "Just give me the two cities, e.g. `Delhi to Mumbai`.")],
        };
      p.originCity = m[1]!.trim();
      p.destinationCity = m[2]!.trim();
      return {
        state: { step: "weight", prefs: p },
        messages: [
          msg("bot", "How heavy is it, approximately?", ["Under 1 kg", "2 kg", "5 kg"]),
        ],
      };
    }
    case "weight": {
      const n = parseFloat(lower.replace(/[^\d.]/g, "")) || 1;
      p.weightKg = /under 1/.test(lower) ? 0.8 : n;
      const rec = recommend(p);
      p.tier = rec.tier;
      const q = quote({
        originCity: p.originCity!,
        destinationCity: p.destinationCity!,
        weightKg: p.weightKg,
        tier: rec.tier,
      });
      return {
        state: { step: "recommend", prefs: p },
        messages: [
          msg(
            "bot",
            `setDeliveryPreference({ priority: "${p.priority}", deadline: "${p.deadlineHours}h", budget: ${p.budgetRupees ?? "null"} })`,
            undefined,
            "tool",
          ),
          msg(
            "bot",
            `I recommend **${rec.tier}** — ${rec.why} Estimated total ₹${Math.round(q.total / 100)}, about ₹${Math.round(q.saving / 100)} less than a traditional courier.`,
            ["Prefill my booking", "Show the other tier"],
          ),
        ],
      };
    }
    case "recommend": {
      if (/other|switch|change/.test(lower)) {
        p.tier = p.tier === "EXPRESS" ? "STANDARD" : "EXPRESS";
        return {
          state: { step: "recommend", prefs: p },
          messages: [msg("bot", `Switched to **${p.tier}**.`, ["Prefill my booking"])],
        };
      }
      return {
        state: { step: "done", prefs: p },
        messages: [msg("bot", "Done — I've filled in your booking form. Just review and pay.")],
      };
    }
    default:
      return {
        state: { step: "intro", prefs: p },
        messages: [
          msg("bot", "Anything else I can help with?", ["Book a parcel", "Track my parcel"]),
        ],
      };
  }
}
