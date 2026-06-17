"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sleep } from "./utils";
import {
  LedgerEntry,
  SimLog,
  SimMetrics,
  StageStatus,
} from "./simulation";
import { ActionMode, AgentCompany } from "./types";

export interface RunStageDef {
  id: number;
  title: string;
  caption: string;
  icon: string;
  intended: ActionMode; // best-case mode (becomes "real" with keys)
}

export const RUN_STAGES: RunStageDef[] = [
  { id: 1, title: "Discover opportunity", caption: "LLM finds a fundable SaaS idea", icon: "Telescope", intended: "real" },
  { id: 2, title: "Incorporate company", caption: "Name, domain & positioning", icon: "Building2", intended: "real" },
  { id: 3, title: "Design pricing", caption: "Subscription tiers", icon: "Tags", intended: "real" },
  { id: 4, title: "Write landing page", caption: "Hero, copy & features", icon: "FileText", intended: "real" },
  { id: 5, title: "Create Stripe link", caption: "Real Payment Link via Stripe", icon: "CreditCard", intended: "real" },
  { id: 6, title: "Deploy website", caption: "Live, shareable URL", icon: "Globe", intended: "real" },
  { id: 7, title: "Run go-to-market", caption: "Tools & campaigns", icon: "Megaphone", intended: "simulated" },
  { id: 8, title: "Acquire customers", caption: "Signups & first revenue", icon: "TrendingUp", intended: "simulated" },
];

const SEED_CAPITAL = 1000;
const ZERO: SimMetrics = {
  mrr: 0, arr: 0, customers: 0, cash: SEED_CAPITAL, spend: 0,
  earned: 0, tools: 0, campaigns: 0, compute: 0, impressions: 0,
};

const EMPTY_COMPANY: AgentCompany = {
  idea: "", category: "", name: "", domain: "", tagline: "", valueProp: "",
  pricing: [], landing: { headline: "", subheadline: "", cta: "", bullets: [] },
};

let uid = 0;

export function useAutonomousRun() {
  const [metrics, setMetrics] = useState<SimMetrics>(ZERO);
  const [stages, setStages] = useState<Record<number, StageStatus>>({});
  const [stageMode, setStageMode] = useState<Record<number, ActionMode>>({});
  const [activeStage, setActiveStage] = useState(0);
  const [logs, setLogs] = useState<SimLog[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [company, setCompany] = useState<AgentCompany>(EMPTY_COMPANY);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [generationMode, setGenerationMode] = useState<ActionMode | null>(null);
  const [revealPricing, setRevealPricing] = useState(false);
  const [revealLanding, setRevealLanding] = useState(false);
  const [stripeUrl, setStripeUrl] = useState<string | null>(null);
  const [stripeMode, setStripeMode] = useState<ActionMode | null>(null);
  const [siteUrl, setSiteUrl] = useState<string | null>(null);
  const [dbCount, setDbCount] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const cancelled = useRef(false);
  const ticker = useRef<ReturnType<typeof setInterval> | null>(null);
  const clock = useRef<ReturnType<typeof setInterval> | null>(null);

  const pushLog = (kind: SimLog["kind"], label: string, detail?: string) =>
    setLogs((l) => [...l, { id: `l${uid++}`, kind, label, detail, ts: Date.now() }].slice(-60));
  const addLedger = (e: Omit<LedgerEntry, "id" | "ts">) =>
    setLedger((x) => [{ ...e, id: `e${uid++}`, ts: Date.now() }, ...x].slice(0, 40));
  const bump = (patch: Partial<SimMetrics>) =>
    setMetrics((m) => {
      const next = { ...m };
      (Object.keys(patch) as (keyof SimMetrics)[]).forEach((k) => {
        next[k] = (next[k] as number) + (patch[k] as number);
      });
      return next;
    });
  const setStage = (id: number, status: StageStatus) =>
    setStages((s) => ({ ...s, [id]: status }));

  const stopTimers = useCallback(() => {
    if (ticker.current) clearInterval(ticker.current);
    if (clock.current) clearInterval(clock.current);
    ticker.current = null;
    clock.current = null;
  }, []);

  const reset = useCallback(() => {
    cancelled.current = true;
    stopTimers();
    setMetrics(ZERO);
    setStages({});
    setStageMode({});
    setActiveStage(0);
    setLogs([]);
    setLedger([]);
    setCompany(EMPTY_COMPANY);
    setCompanyId(null);
    setGenerationMode(null);
    setRevealPricing(false);
    setRevealLanding(false);
    setStripeUrl(null);
    setStripeMode(null);
    setSiteUrl(null);
    setRunning(false);
    setDone(false);
    setElapsed(0);
  }, [stopTimers]);

  const start = useCallback(
    async (
      goal = "Find a profitable SaaS business",
      opts?: { judge?: boolean }
    ) => {
      reset();
      await sleep(20);
      cancelled.current = false;
      // Judge Mode stretches the run to a comfortable 60-90s viewing window.
      const P = opts?.judge ? 3.2 : 1;
      const nap = (ms: number) => sleep(ms * P);
      const dwell = () => sleep(opts?.judge ? 3500 : 0);
      setRunning(true);

      const t0 = Date.now();
      clock.current = setInterval(() => setElapsed((Date.now() - t0) / 1000), 100);
      ticker.current = setInterval(() => {
        setMetrics((m) => ({
          ...m,
          compute: m.compute + Math.round(15 + Math.random() * 55),
          impressions: m.impressions + (m.campaigns > 0 ? Math.round(Math.random() * 40) : 0),
        }));
      }, 120);

      const alive = () => !cancelled.current;

      try {
        // STAGE 1-4 — one real LLM call produces idea, name, pricing, landing.
        setActiveStage(1);
        setStage(1, "active");
        pushLog("thinking", "Calling LLM", `Goal: ${goal}`);
        await nap(500);

        const res = await fetch("/api/agent/company", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ goal }),
        });
        const data = await res.json();
        if (!alive()) return;

        const co: AgentCompany = data.company;
        const mode: ActionMode = data.mode;
        setCompany(co);
        setCompanyId(data.id);
        setGenerationMode(mode);
        setStageMode((s) => ({ ...s, 1: mode, 2: mode, 3: mode, 4: mode }));
        bump({ compute: 1600 });
        pushLog("success", `Idea: ${co.idea.split(".")[0]}`, `${co.category} · ${mode === "real" ? "LLM-generated" : "mock engine"}`);
        setStage(1, "complete");
        await dwell();

        await nap(700);
        if (!alive()) return;
        setActiveStage(2);
        setStage(2, "active");
        pushLog("action", "Incorporating", `${co.name} · ${co.domain}`);
        await nap(800);
        setStage(2, "complete");
        await dwell();

        if (!alive()) return;
        setActiveStage(3);
        setStage(3, "active");
        setRevealPricing(true);
        pushLog("data", `${co.pricing.length} pricing tiers`, co.pricing.map((t) => `${t.name} $${t.price}`).join(" · "));
        await nap(900);
        setStage(3, "complete");
        await dwell();

        if (!alive()) return;
        setActiveStage(4);
        setStage(4, "active");
        setRevealLanding(true);
        pushLog("action", "Landing page written", co.landing.headline);
        await nap(900);
        setStage(4, "complete");
        await dwell();
        addLedger({ channel: "system", label: "Saved to database", sub: `record ${data.id}`, mode: "real" });

        // STAGE 5 — real Stripe Payment Link
        if (!alive()) return;
        setActiveStage(5);
        setStage(5, "active");
        pushLog("action", "Minting Stripe Payment Link");
        const sres = await fetch("/api/agent/stripe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: data.id, company: co }),
        });
        const sdata = await sres.json();
        if (!alive()) return;
        setStripeUrl(sdata.url);
        setStripeMode(sdata.mode);
        setStageMode((s) => ({ ...s, 5: sdata.mode }));
        addLedger({ channel: "stripe", label: "Payment Link created", sub: sdata.mode === "real" ? "live buy.stripe.com link" : "demo link (no Stripe key)", mode: sdata.mode });
        pushLog("success", "Stripe checkout ready", sdata.mode === "real" ? "Real Payment Link minted" : "Simulated — add STRIPE_SECRET_KEY for a live link");
        await nap(700);
        setStage(5, "complete");
        await dwell();

        // STAGE 6 — real self-hosted deploy
        if (!alive()) return;
        setActiveStage(6);
        setStage(6, "active");
        pushLog("action", "Deploying landing page");
        const dres = await fetch("/api/agent/site", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: data.id }),
        });
        const ddata = await dres.json();
        if (!alive()) return;
        setSiteUrl(ddata.path || ddata.url);
        setStageMode((s) => ({ ...s, 6: "real" }));
        addLedger({ channel: "system", label: "Website deployed", sub: ddata.path, mode: "real" });
        pushLog("success", "Website is live", ddata.path);
        await nap(700);
        setStage(6, "complete");
        await dwell();

        // STAGE 7 — simulated go-to-market
        if (!alive()) return;
        setActiveStage(7);
        setStage(7, "active");
        setStageMode((s) => ({ ...s, 7: "simulated" }));
        pushLog("thinking", "Provisioning stack", "simulated agentic spend");
        const tools = [
          { v: "Namecheap", a: 14, s: "domain" },
          { v: "Vercel", a: 20, s: "hosting" },
          { v: "Resend", a: 20, s: "email" },
          { v: "Google Ads", a: 120, s: "launch budget" },
        ];
        for (const t of tools) {
          if (!alive()) return;
          addLedger({ channel: "agent", label: `Paid ${t.v}`, sub: t.s, amount: -t.a, mode: "simulated" });
          bump({ cash: -t.a, spend: t.a, tools: 1 });
          await nap(500);
        }
        bump({ campaigns: 3, impressions: 14200 });
        pushLog("data", "Campaigns live", "3 channels · 14k impressions");
        await nap(700);
        setStage(7, "complete");
        await dwell();

        // STAGE 8 — simulated customers & revenue
        if (!alive()) return;
        setActiveStage(8);
        setStage(8, "active");
        setStageMode((s) => ({ ...s, 8: "simulated" }));
        const charges = [
          { plan: "Growth", a: 147 },
          { plan: "Starter", a: 49 },
          { plan: "Growth", a: 147 },
          { plan: "Enterprise", a: 390 },
          { plan: "Growth", a: 147 },
        ];
        for (const c of charges) {
          if (!alive()) return;
          addLedger({ channel: "stripe", label: "Payment received", sub: `invoice paid · ${c.plan}`, amount: c.a, mode: "simulated" });
          bump({ cash: c.a, earned: c.a, mrr: c.a, arr: c.a * 12, customers: 1 });
          await nap(650);
        }
        pushLog("success", "First revenue collected", "5 customers · cash-flow positive");
        setStage(8, "complete");

        // Pull DB count as proof of persistence.
        try {
          const list = await fetch("/api/companies").then((r) => r.json());
          if (alive()) setDbCount(list.count ?? 0);
        } catch {}

        if (!alive()) return;
        stopTimers();
        setRunning(false);
        setDone(true);
      } catch {
        if (!alive()) return;
        stopTimers();
        setRunning(false);
        pushLog("action", "Run interrupted", "A step could not complete.");
      }
    },
    [reset, stopTimers]
  );

  useEffect(() => () => { cancelled.current = true; stopTimers(); }, [stopTimers]);

  return {
    metrics, stages, stageMode, activeStage, logs, ledger,
    company, companyId, generationMode, revealPricing, revealLanding,
    stripeUrl, stripeMode, siteUrl, dbCount,
    running, done, elapsed, start, reset,
  };
}
