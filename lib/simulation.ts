"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AgentLogKind } from "./types";

export interface SimMetrics {
  mrr: number;
  arr: number;
  customers: number;
  cash: number; // agent treasury balance
  spend: number; // total spent on tools
  earned: number; // total revenue collected
  tools: number;
  campaigns: number;
  compute: number; // inference calls (NVIDIA flavor)
  impressions: number;
}

export interface SimCompany {
  name: string;
  domain: string;
  tagline: string;
  valueProp: string;
}

export interface LedgerEntry {
  id: string;
  channel: "stripe" | "agent" | "system";
  label: string;
  sub?: string;
  amount?: number; // signed; negative = outflow
  ts: number;
  mode?: "real" | "simulated";
}

export interface SimLog {
  id: string;
  kind: AgentLogKind;
  label: string;
  detail?: string;
  ts: number;
}

export interface SimStageDef {
  id: number;
  title: string;
  caption: string;
  icon: string; // lucide name
}

export const SIM_STAGES: SimStageDef[] = [
  { id: 1, title: "Find opportunity", caption: "Scanning the market for signal", icon: "Telescope" },
  { id: 2, title: "Incorporate company", caption: "Naming & positioning the venture", icon: "Building2" },
  { id: 3, title: "Model pricing", caption: "Designing subscription tiers", icon: "Tags" },
  { id: 4, title: "Wire Stripe billing", caption: "Creating products & subscriptions", icon: "CreditCard" },
  { id: 5, title: "Procure tools", caption: "Agent pays vendors via Stripe", icon: "ShoppingCart" },
  { id: 6, title: "Launch marketing", caption: "Shipping campaigns across channels", icon: "Megaphone" },
  { id: 7, title: "Acquire customer", caption: "Converting the first signup", icon: "UserPlus" },
  { id: 8, title: "First revenue", caption: "Collecting live subscription revenue", icon: "TrendingUp" },
];

export type StageStatus = "pending" | "active" | "complete";

interface Beat {
  delay: number;
  stage?: number;
  complete?: number;
  log?: { kind: AgentLogKind; label: string; detail?: string };
  ledger?: Omit<LedgerEntry, "id" | "ts">;
  add?: Partial<SimMetrics>;
  company?: Partial<SimCompany>;
}

const SEED_CAPITAL = 1000;

// The cinematic script. Deltas in `add` are accumulated onto current metrics.
const SCRIPT: Beat[] = [
  { delay: 200, stage: 1, log: { kind: "thinking", label: "Booting autonomous run", detail: "Goal: launch a profitable SaaS company" } },
  { delay: 900, log: { kind: "thinking", label: "Scanning 12,400 market signals", detail: "funding, search trends, job posts, churn data" }, add: { compute: 1840 } },
  { delay: 1100, log: { kind: "data", label: "Ranked 28 candidates", detail: "Optimizing score-to-difficulty ratio" }, add: { compute: 920 } },
  { delay: 900, complete: 1, log: { kind: "success", label: "Selected: AI Compliance Copilot for Fintech", detail: "Score 92 · TAM $4.2B · competition Medium" } },

  { delay: 700, stage: 2, log: { kind: "action", label: "Incorporating company" }, company: { name: "Ledgerly", domain: "ledgerly.com" } },
  { delay: 1000, complete: 2, company: { tagline: "Compliance that runs itself.", valueProp: "Continuous SOC2 & PCI evidence, written by agents." }, log: { kind: "success", label: "Ledgerly is born", detail: "ledgerly.com · positioning locked" } },

  { delay: 700, stage: 3, log: { kind: "action", label: "Modeling willingness-to-pay" }, add: { compute: 640 } },
  { delay: 1000, complete: 3, log: { kind: "data", label: "3 tiers set", detail: "Starter $49 · Growth $147 · Enterprise custom" } },

  { delay: 700, stage: 4, log: { kind: "action", label: "Connecting Stripe" } },
  { delay: 800, ledger: { channel: "stripe", label: "Product created", sub: "Ledgerly Growth" }, log: { kind: "action", label: "Creating Stripe products" } },
  { delay: 700, ledger: { channel: "stripe", label: "Price created", sub: "price_1Q7x · $147/mo" } },
  { delay: 800, complete: 4, ledger: { channel: "stripe", label: "Subscriptions enabled", sub: "checkout + billing portal live" }, log: { kind: "success", label: "Stripe billing wired", detail: "Ready to charge customers" } },

  { delay: 700, stage: 5, log: { kind: "thinking", label: "Provisioning the stack", detail: "Agent authorizing payments via Stripe" } },
  { delay: 750, ledger: { channel: "agent", label: "Paid Namecheap", sub: "ledgerly.com · domain", amount: -14 }, add: { cash: -14, spend: 14, tools: 1 }, log: { kind: "action", label: "Bought domain", detail: "$14.00 charged to agent card" } },
  { delay: 650, ledger: { channel: "agent", label: "Paid Vercel", sub: "Pro hosting", amount: -20 }, add: { cash: -20, spend: 20, tools: 1 } },
  { delay: 650, ledger: { channel: "agent", label: "Paid Resend", sub: "Transactional email", amount: -20 }, add: { cash: -20, spend: 20, tools: 1 } },
  { delay: 650, ledger: { channel: "agent", label: "Paid Anthropic", sub: "Inference credits", amount: -100 }, add: { cash: -100, spend: 100, tools: 1, compute: 2400 } },
  { delay: 800, complete: 5, log: { kind: "success", label: "Stack provisioned autonomously", detail: "4 vendors paid · $154.00 deployed" } },

  { delay: 700, stage: 6, log: { kind: "action", label: "Launching campaigns" }, add: { campaigns: 1 } },
  { delay: 700, ledger: { channel: "agent", label: "Paid Google Ads", sub: "Launch campaign budget", amount: -120 }, add: { cash: -120, spend: 120, campaigns: 1, impressions: 4200 } },
  { delay: 700, log: { kind: "action", label: "Posted launch tweet + Product Hunt", detail: "Organic reach climbing" }, add: { campaigns: 1, impressions: 9800 } },
  { delay: 900, complete: 6, log: { kind: "data", label: "Campaigns live", detail: "3 channels · 14k impressions and rising" }, add: { impressions: 5400 } },

  { delay: 800, stage: 7, log: { kind: "thinking", label: "Watching the funnel", detail: "visitor → signup → trial" }, add: { impressions: 6200 } },
  { delay: 900, log: { kind: "action", label: "First signup", detail: "acme-fintech.com started a trial" } },
  { delay: 900, complete: 7, log: { kind: "success", label: "First customer converted", detail: "Trial → paid in 4 minutes" }, add: { customers: 1 } },

  { delay: 700, stage: 8, ledger: { channel: "stripe", label: "Payment received", sub: "invoice paid · Growth", amount: 147 }, add: { cash: 147, earned: 147, mrr: 147, arr: 1764 }, log: { kind: "success", label: "💸 First revenue: $147.00", detail: "Stripe charge succeeded" } },
  { delay: 800, ledger: { channel: "stripe", label: "Payment received", sub: "invoice paid · Starter", amount: 49 }, add: { cash: 49, earned: 49, mrr: 49, arr: 588, customers: 1 } },
  { delay: 800, ledger: { channel: "stripe", label: "Payment received", sub: "invoice paid · Growth", amount: 147 }, add: { cash: 147, earned: 147, mrr: 147, arr: 1764, customers: 1 } },
  { delay: 750, ledger: { channel: "stripe", label: "Payment received", sub: "invoice paid · Growth", amount: 147 }, add: { cash: 147, earned: 147, mrr: 147, arr: 1764, customers: 1 } },
  { delay: 750, ledger: { channel: "stripe", label: "Payment received", sub: "invoice paid · Enterprise", amount: 390 }, add: { cash: 390, earned: 390, mrr: 390, arr: 4680, customers: 1 } },
  { delay: 900, complete: 8, log: { kind: "success", label: "Ledgerly is LIVE and earning", detail: "5 customers · $880 MRR · cash-flow positive" }, add: { customers: 1, mrr: 0 } },
];

const ZERO: SimMetrics = {
  mrr: 0,
  arr: 0,
  customers: 0,
  cash: SEED_CAPITAL,
  spend: 0,
  earned: 0,
  tools: 0,
  campaigns: 0,
  compute: 0,
  impressions: 0,
};

export interface SimSnapshot {
  metrics: SimMetrics;
  stages: Record<number, StageStatus>;
  activeStage: number;
  logs: SimLog[];
  ledger: LedgerEntry[];
  company: SimCompany;
  running: boolean;
  done: boolean;
  elapsed: number; // seconds
}

let uid = 0;

export function useSimulation() {
  const [metrics, setMetrics] = useState<SimMetrics>(ZERO);
  const [stages, setStages] = useState<Record<number, StageStatus>>({});
  const [activeStage, setActiveStage] = useState(0);
  const [logs, setLogs] = useState<SimLog[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [company, setCompany] = useState<SimCompany>({ name: "", domain: "", tagline: "", valueProp: "" });
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const cancelled = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const ticker = useRef<ReturnType<typeof setInterval> | null>(null);
  const clock = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    cancelled.current = true;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (ticker.current) clearInterval(ticker.current);
    if (clock.current) clearInterval(clock.current);
    ticker.current = null;
    clock.current = null;
  }, []);

  const reset = useCallback(() => {
    cleanup();
    setMetrics(ZERO);
    setStages({});
    setActiveStage(0);
    setLogs([]);
    setLedger([]);
    setCompany({ name: "", domain: "", tagline: "", valueProp: "" });
    setRunning(false);
    setDone(false);
    setElapsed(0);
  }, [cleanup]);

  const start = useCallback(() => {
    reset();
    cancelled.current = false;
    setRunning(true);
    setDone(false);

    const t0 = Date.now();
    clock.current = setInterval(() => setElapsed((Date.now() - t0) / 1000), 100);

    // Continuous compute + impressions telemetry for constant motion.
    ticker.current = setInterval(() => {
      setMetrics((m) => ({
        ...m,
        compute: m.compute + Math.round(20 + Math.random() * 60),
        impressions: m.impressions + (m.campaigns > 0 ? Math.round(Math.random() * 40) : 0),
      }));
    }, 120);

    let acc = 0;
    SCRIPT.forEach((beat) => {
      acc += beat.delay;
      const timer = setTimeout(() => {
        if (cancelled.current) return;
        if (beat.stage) {
          setActiveStage(beat.stage);
          setStages((s) => ({ ...s, [beat.stage!]: "active" }));
        }
        if (beat.complete) {
          setStages((s) => ({ ...s, [beat.complete!]: "complete" }));
        }
        if (beat.log) {
          setLogs((l) => [...l, { ...beat.log!, id: `l${uid++}`, ts: Date.now() }].slice(-60));
        }
        if (beat.ledger) {
          setLedger((e) => [{ ...beat.ledger!, id: `e${uid++}`, ts: Date.now() }, ...e].slice(0, 40));
        }
        if (beat.add) {
          setMetrics((m) => {
            const next = { ...m };
            for (const k in beat.add) {
              const key = k as keyof SimMetrics;
              next[key] = (next[key] as number) + (beat.add![key] as number);
            }
            return next;
          });
        }
        if (beat.company) setCompany((c) => ({ ...c, ...beat.company }));
      }, acc);
      timers.current.push(timer);
    });

    const endTimer = setTimeout(() => {
      if (cancelled.current) return;
      setRunning(false);
      setDone(true);
      if (ticker.current) clearInterval(ticker.current);
      if (clock.current) clearInterval(clock.current);
    }, acc + 600);
    timers.current.push(endTimer);
  }, [reset]);

  useEffect(() => cleanup, [cleanup]);

  const snapshot: SimSnapshot = {
    metrics,
    stages,
    activeStage,
    logs,
    ledger,
    company,
    running,
    done,
    elapsed,
  };

  return { ...snapshot, start, reset };
}
