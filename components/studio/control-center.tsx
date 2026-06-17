"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Telescope,
  Building2,
  Tags,
  FileText,
  CreditCard,
  Globe,
  Megaphone,
  TrendingUp,
  Play,
  RotateCcw,
  Cpu,
  DollarSign,
  Users,
  Wallet,
  Radio,
  Check,
  Copy,
  ExternalLink,
  Database,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Rocket,
  FileDown,
  Gavel,
  type LucideIcon,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { RUN_STAGES, useAutonomousRun } from "@/lib/agent-run";
import { LedgerEntry, StageStatus } from "@/lib/simulation";
import { ActionMode } from "@/lib/types";
import { AgentStream } from "./agent-stream";
import { Counter } from "./counter";
import { downloadReport } from "./report";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";

const STAGE_ICONS: Record<string, LucideIcon> = {
  Telescope, Building2, Tags, FileText, CreditCard, Globe, Megaphone, TrendingUp,
};

type Run = ReturnType<typeof useAutonomousRun>;

export function ControlCenter({ autoStart = false }: { autoStart?: boolean }) {
  const run = useAutonomousRun();
  const started = useRef(false);
  const [judgeMode, setJudgeMode] = useState(false);
  const [mrrHistory, setMrrHistory] = useState<{ i: number; mrr: number }[]>([]);
  const tick = useRef(0);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const finalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoStart && !started.current) {
      started.current = true;
      setJudgeMode(true);
      run.start(undefined, { judge: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  // Judge Mode: auto-scroll important events into view.
  useEffect(() => {
    if (!judgeMode) return;
    if (run.done) {
      finalRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (run.running) {
      spotlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [judgeMode, run.activeStage, run.running, run.done]);

  useEffect(() => {
    if (!run.running && !run.done) {
      setMrrHistory([]);
      tick.current = 0;
      return;
    }
    setMrrHistory((h) => [...h, { i: tick.current++, mrr: run.metrics.mrr }].slice(-60));
  }, [run.metrics.mrr, run.metrics.earned, run.running, run.done]);

  const completed = Object.values(run.stages).filter((s) => s === "complete").length;
  const progress = (completed / RUN_STAGES.length) * 100;
  const idle = !run.running && !run.done;
  const actionsCompleted = completed + run.ledger.length;

  const launch = () => {
    setJudgeMode(false);
    run.start();
  };
  const launchJudge = () => {
    setJudgeMode(true);
    run.start(undefined, { judge: true });
  };
  const fullReset = () => {
    setJudgeMode(false);
    run.reset();
  };

  return (
    <div className="space-y-6">
      <HackathonBanner />

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              Agent Control Center
            </h1>
            <LiveBadge running={run.running} done={run.done} />
            {judgeMode && (run.running || run.done) && (
              <Badge variant="default" className="gap-1">
                <Gavel className="size-3" /> Judge Mode
              </Badge>
            )}
          </div>
          <p className="mt-1 text-muted-foreground">
            A partially real autonomous run — live LLM, database, Stripe and deploy, with simulated growth.
          </p>
          <Legend />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden rounded-lg glass px-3 py-2 font-mono text-sm sm:block">
            <span className="text-muted-foreground">T+</span>{" "}
            <span className="tabular-nums">{run.elapsed.toFixed(1)}s</span>
          </div>
          {idle ? (
            <>
              <Button variant="gradient" onClick={launchJudge}>
                <Gavel className="size-4" /> Judge Mode
              </Button>
              <Button variant="secondary" onClick={launch}>
                <Play className="size-4" /> Launch run
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={fullReset}>
              <RotateCcw className="size-4" /> Reset
            </Button>
          )}
        </div>
      </div>

      {/* Mission progress */}
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet via-cyan to-emerald"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Metric strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricTile icon={DollarSign} label="MRR" accent="emerald"
          value={<Counter value={run.metrics.mrr} prefix="$" suffix="/mo" />}
          foot={`ARR ≈ ${formatCurrency(run.metrics.arr, { compact: true })}`} />
        <MetricTile icon={Users} label="Customers" accent="cyan"
          value={<Counter value={run.metrics.customers} />}
          foot={`${run.metrics.campaigns} campaigns live`} />
        <MetricTile icon={Wallet} label="Agent treasury" accent={run.metrics.cash >= 1000 ? "emerald" : "amber"}
          value={<Counter value={run.metrics.cash} prefix="$" decimals={2} />}
          foot={`spent ${formatCurrency(run.metrics.spend)} · earned ${formatCurrency(run.metrics.earned)}`} />
        <MetricTile icon={Cpu} label="Inference calls" accent="violet"
          value={<Counter value={run.metrics.compute} />}
          foot="GPU-accelerated reasoning" />
      </div>

      {/* Final screen */}
      <AnimatePresence>
        {run.done && (
          <FinalScreen
            run={run}
            actionsCompleted={actionsCompleted}
            innerRef={finalRef}
            onReset={fullReset}
            onRunAgain={launchJudge}
          />
        )}
      </AnimatePresence>

      {/* SPLIT VIEW */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* LEFT — Real AI outputs */}
        <RealOutputs run={run} idle={idle} />

        {/* RIGHT — Agent activity timeline */}
        <div className="space-y-4">
          <PanelLabel icon={Radio} title="Agent activity timeline" tone="muted" />
          <div ref={spotlightRef}>
            <Spotlight run={run} idle={idle} mrrHistory={mrrHistory} />
          </div>
          <StageTimeline stages={run.stages} stageMode={run.stageMode} active={run.activeStage} />
          <Ledger entries={run.ledger} />
          <div className="h-[240px]">
            <AgentStream logs={run.logs} active={run.running} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- shared bits ---------- */

function HackathonBanner() {
  return (
    <div className="ring-glow relative overflow-hidden rounded-2xl glass-strong px-5 py-3">
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-violet/10 via-transparent to-cyan/10" />
      <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-center sm:gap-3">
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Built with
        </span>
        <div className="flex items-center gap-2.5 font-display text-sm font-semibold">
          <span className="rounded-lg bg-white/[0.05] px-2.5 py-1">Hermes</span>
          <span className="text-muted-foreground/50">+</span>
          <span className="rounded-lg bg-emerald/10 px-2.5 py-1 text-emerald">NVIDIA</span>
          <span className="text-muted-foreground/50">+</span>
          <span className="rounded-lg bg-cyan/10 px-2.5 py-1 text-cyan">Stripe</span>
        </div>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <span className="size-2 rounded-full bg-emerald" /> Real actions
      </span>
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <span className="size-2 rounded-full bg-amber" /> Simulated actions
      </span>
    </div>
  );
}

function ModeBadge({ mode }: { mode?: ActionMode | null }) {
  if (!mode) return null;
  return mode === "real" ? (
    <Badge variant="emerald" className="gap-1">
      <span className="size-1.5 rounded-full bg-emerald" /> Real
    </Badge>
  ) : (
    <Badge variant="amber" className="gap-1">
      <span className="size-1.5 rounded-full bg-amber" /> Simulated
    </Badge>
  );
}

function LiveBadge({ running, done }: { running: boolean; done: boolean }) {
  if (running)
    return (
      <Badge variant="emerald" className="gap-1.5">
        <span className="size-1.5 rounded-full bg-emerald animate-pulse-ring" /> Live
      </Badge>
    );
  if (done)
    return (
      <Badge variant="cyan" className="gap-1.5">
        <Check className="size-3" /> Complete
      </Badge>
    );
  return (
    <Badge variant="secondary" className="gap-1.5">
      <Radio className="size-3" /> Standby
    </Badge>
  );
}

function PanelLabel({
  icon: Icon,
  title,
  tone,
  right,
}: {
  icon: LucideIcon;
  title: string;
  tone: "real" | "muted";
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "grid size-7 place-items-center rounded-lg",
            tone === "real" ? "bg-emerald/10 text-emerald" : "bg-white/[0.04] text-muted-foreground"
          )}
        >
          <Icon className="size-3.5" />
        </span>
        <h3 className="font-display text-sm font-medium">{title}</h3>
      </div>
      {right}
    </div>
  );
}

function MetricTile({
  icon: Icon, label, value, foot, accent,
}: {
  icon: LucideIcon; label: string; value: React.ReactNode; foot: string;
  accent: "violet" | "cyan" | "emerald" | "amber";
}) {
  const map = {
    violet: "text-violet bg-violet/10", cyan: "text-cyan bg-cyan/10",
    emerald: "text-emerald bg-emerald/10", amber: "text-amber bg-amber/10",
  };
  return (
    <div className="ring-glow relative overflow-hidden rounded-2xl glass p-4">
      <div className="flex items-center gap-2">
        <span className={cn("grid size-7 place-items-center rounded-lg", map[accent])}>
          <Icon className="size-3.5" />
        </span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="mt-2.5 font-display text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </div>
      <div className="mt-1 truncate font-mono text-[0.7rem] text-muted-foreground">{foot}</div>
    </div>
  );
}

/* ---------- LEFT: real outputs ---------- */

function RealOutputs({ run, idle }: { run: Run; idle: boolean }) {
  const c = run.company;
  const has = !!c.name;
  return (
    <div className="space-y-4">
      <PanelLabel
        icon={Sparkles}
        title="Real AI outputs"
        tone="real"
        right={
          run.dbCount > 0 ? (
            <Badge variant="secondary" className="gap-1.5">
              <Database className="size-3" /> {run.dbCount} in DB
            </Badge>
          ) : run.companyId ? (
            <Badge variant="secondary" className="gap-1.5">
              <Database className="size-3" /> saved
            </Badge>
          ) : null
        }
      />

      {idle && (
        <div className="rounded-2xl glass p-6 text-sm text-muted-foreground">
          Outputs from the live LLM, database, Stripe and deploy will appear here as
          the agent works. Press <span className="text-foreground">Launch run</span>.
        </div>
      )}

      {/* Identity */}
      <AnimatePresence>
        {has && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="ring-glow rounded-2xl glass-strong p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-mono text-xs text-muted-foreground">{c.category}</div>
                <div className="font-display text-2xl font-semibold tracking-tight">{c.name}</div>
                <div className="font-mono text-xs text-cyan">{c.domain}</div>
              </div>
              <ModeBadge mode={run.generationMode} />
            </div>
            <p className="mt-3 text-sm text-foreground/85">{c.valueProp}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pricing */}
      <AnimatePresence>
        {run.revealPricing && c.pricing.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl glass p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium">Pricing tiers</span>
              <ModeBadge mode={run.generationMode} />
            </div>
            <div className="grid gap-2.5 sm:grid-cols-3">
              {c.pricing.map((t) => (
                <div
                  key={t.name}
                  className={cn(
                    "rounded-xl border p-3",
                    t.highlighted ? "border-violet/40 bg-violet/[0.06]" : "border-white/[0.06] bg-white/[0.02]"
                  )}
                >
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="font-display text-xl font-semibold">
                    ${t.price}
                    <span className="text-xs text-muted-foreground">/mo</span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {t.features.slice(0, 3).map((f) => (
                      <li key={f} className="flex gap-1.5 text-[0.72rem] text-muted-foreground">
                        <Check className="mt-0.5 size-3 shrink-0 text-emerald" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Landing + deploy */}
      <AnimatePresence>
        {run.revealLanding && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl glass p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium">Landing page</span>
              <ModeBadge mode={run.siteUrl ? "real" : run.generationMode} />
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="font-display text-lg font-semibold leading-tight">{c.landing.headline}</div>
              <p className="mt-1 text-sm text-muted-foreground">{c.landing.subheadline}</p>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button asChild variant="gradient" size="sm" disabled={!run.siteUrl}>
                {run.siteUrl ? (
                  <a href={run.siteUrl} target="_blank" rel="noreferrer">
                    <Rocket className="size-4" /> Launch website
                  </a>
                ) : (
                  <span><Rocket className="size-4" /> Launch website</span>
                )}
              </Button>
              {run.siteUrl && (
                <a
                  href={run.siteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-cyan hover:underline"
                >
                  {run.siteUrl} <ExternalLink className="inline size-3" />
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stripe */}
      <AnimatePresence>
        {run.stripeUrl && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl glass p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium">
                <CreditCard className="size-4 text-cyan" /> Stripe Payment Link
              </span>
              <ModeBadge mode={run.stripeMode} />
            </div>
            <StripeUrlBox url={run.stripeUrl} mode={run.stripeMode} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StripeUrlBox({ url, mode }: { url: string; mode: ActionMode | null }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-black/30 px-3 py-2">
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground/90">{url}</span>
        <button onClick={copy} className="shrink-0 text-muted-foreground hover:text-foreground" aria-label="Copy">
          {copied ? <Check className="size-3.5 text-emerald" /> : <Copy className="size-3.5" />}
        </button>
      </div>
      {mode === "real" ? (
        <Button asChild variant="secondary" size="sm" className="w-full">
          <a href={url} target="_blank" rel="noreferrer">
            <ExternalLink className="size-4" /> Open live checkout
          </a>
        </Button>
      ) : (
        <p className="text-[0.72rem] text-muted-foreground">
          Simulated link. Add <code className="rounded bg-white/[0.06] px-1 font-mono">STRIPE_SECRET_KEY</code> to mint a real, clickable Payment Link.
        </p>
      )}
    </div>
  );
}

/* ---------- RIGHT: timeline ---------- */

function Spotlight({
  run, idle, mrrHistory,
}: {
  run: Run; idle: boolean; mrrHistory: { i: number; mrr: number }[];
}) {
  if (idle) {
    return (
      <div className="ring-glow relative flex min-h-[200px] flex-col items-center justify-center overflow-hidden rounded-2xl glass-strong p-7 text-center">
        <div className="absolute inset-0 -z-10 grid-bg opacity-50" />
        <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-violet to-cyan shadow-glow">
          <Sparkles className="size-5 text-white" />
        </span>
        <h2 className="font-display text-lg font-semibold">Ready to build a company from zero</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          The agent will generate a real company, save it, mint a Stripe link and deploy a live site — then simulate growth.
        </p>
      </div>
    );
  }

  const stage = RUN_STAGES.find((s) => s.id === run.activeStage) ?? RUN_STAGES[0];
  const Icon = STAGE_ICONS[stage.icon] ?? Telescope;
  const mode = run.stageMode[stage.id] ?? stage.intended;

  return (
    <div className="ring-glow relative overflow-hidden rounded-2xl glass-strong p-6">
      <div className="absolute inset-0 -z-10 grid-bg opacity-40" />
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Stage {stage.id} / {RUN_STAGES.length}
        </span>
        <ModeBadge mode={mode} />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={stage.id}
          initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
          transition={{ duration: 0.4 }}
          className="mt-5 flex items-center gap-4"
        >
          <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-violet to-cyan shadow-glow">
            <Icon className="size-6 text-white" />
          </span>
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight">{stage.title}</h2>
            <p className="text-sm text-muted-foreground">{stage.caption}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-5 h-20 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mrrHistory} margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="ccFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(158 76% 52%)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="hsl(158 76% 52%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis hide domain={[0, "dataMax + 100"]} />
            <Area type="monotone" dataKey="mrr" stroke="hsl(158 76% 52%)" strokeWidth={2}
              fill="url(#ccFill)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StageTimeline({
  stages, stageMode, active,
}: {
  stages: Record<number, StageStatus>;
  stageMode: Record<number, ActionMode>;
  active: number;
}) {
  return (
    <div className="rounded-2xl glass p-3">
      <div className="space-y-1.5">
        {RUN_STAGES.map((s) => {
          const status = stages[s.id] ?? "pending";
          const mode = stageMode[s.id] ?? s.intended;
          const Icon = STAGE_ICONS[s.icon] ?? Telescope;
          return (
            <div
              key={s.id}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2 transition-colors",
                status === "complete" ? "border-emerald/15 bg-emerald/[0.04]"
                  : status === "active" ? "border-violet/30 bg-violet/[0.07]"
                  : "border-transparent"
              )}
            >
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-lg",
                  status === "complete" ? "bg-emerald/15 text-emerald"
                    : status === "active" ? "bg-violet/15 text-violet"
                    : "bg-white/[0.04] text-muted-foreground/50"
                )}
              >
                {status === "complete" ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className={cn("truncate text-sm", status === "pending" ? "text-muted-foreground/60" : "text-foreground/90")}>
                  {s.title}
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[0.6rem] uppercase",
                  mode === "real" ? "bg-emerald/10 text-emerald" : "bg-amber/10 text-amber"
                )}
              >
                {mode}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Ledger({ entries }: { entries: LedgerEntry[] }) {
  return (
    <div className="flex h-[240px] flex-col overflow-hidden rounded-2xl glass-strong">
      <div className="flex items-center gap-2.5 border-b border-white/5 px-4 py-2.5">
        <span className="grid size-7 place-items-center rounded-lg bg-white/[0.04]">
          <CreditCard className="size-3.5 text-cyan" />
        </span>
        <span className="font-display text-sm font-medium">Stripe ledger</span>
        <span className="ml-auto font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">live</span>
      </div>
      <div className="flex-1 space-y-1.5 overflow-y-auto p-3">
        {entries.length === 0 && (
          <p className="px-1 py-2 font-mono text-xs text-muted-foreground/60">No transactions yet…</p>
        )}
        <AnimatePresence initial={false}>
          {entries.map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, x: 12, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              className="flex items-center gap-2.5 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2"
            >
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-md text-[0.55rem] font-bold uppercase",
                  e.channel === "stripe" ? "bg-cyan/15 text-cyan"
                    : e.channel === "agent" ? "bg-violet/15 text-violet"
                    : "bg-white/[0.05] text-muted-foreground"
                )}
              >
                {e.channel === "stripe" ? "S" : e.channel === "agent" ? "AI" : "·"}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm text-foreground/90">{e.label}</span>
                  {e.mode && (
                    <span className={cn("rounded-full px-1 text-[0.55rem] uppercase", e.mode === "real" ? "bg-emerald/10 text-emerald" : "bg-amber/10 text-amber")}>
                      {e.mode === "real" ? "real" : "sim"}
                    </span>
                  )}
                </div>
                {e.sub && <div className="truncate font-mono text-[0.68rem] text-muted-foreground">{e.sub}</div>}
              </div>
              {typeof e.amount === "number" && (
                <span className={cn("flex shrink-0 items-center gap-0.5 font-mono text-sm tabular-nums", e.amount >= 0 ? "text-emerald" : "text-amber")}>
                  {e.amount >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                  {formatCurrency(Math.abs(e.amount))}
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------- Final screen ---------- */

function FinalScreen({
  run,
  actionsCompleted,
  innerRef,
  onReset,
  onRunAgain,
}: {
  run: Run;
  actionsCompleted: number;
  innerRef: React.RefObject<HTMLDivElement | null>;
  onReset: () => void;
  onRunAgain: () => void;
}) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const fullSite = run.siteUrl ? `${origin}${run.siteUrl}` : "—";

  const onDownload = () =>
    downloadReport({
      company: run.company,
      companyId: run.companyId,
      generationMode: run.generationMode,
      stripeUrl: run.stripeUrl,
      stripeMode: run.stripeMode,
      siteUrl: run.siteUrl,
      elapsed: run.elapsed,
      actionsCompleted,
      metrics: {
        mrr: run.metrics.mrr,
        arr: run.metrics.arr,
        customers: run.metrics.customers,
        spend: run.metrics.spend,
        earned: run.metrics.earned,
      },
      origin,
    });

  const rows: { k: string; v: string; href?: string; mode?: ActionMode | null }[] = [
    { k: "Startup name", v: run.company.name || "—", mode: run.generationMode },
    { k: "Landing page URL", v: fullSite, href: run.siteUrl || undefined, mode: "real" },
    {
      k: "Stripe checkout URL",
      v: run.stripeUrl || "—",
      href: run.stripeMode === "real" ? run.stripeUrl || undefined : undefined,
      mode: run.stripeMode,
    },
    { k: "Business status", v: "Operational", mode: undefined },
    { k: "Time to launch", v: `${run.elapsed.toFixed(1)}s`, mode: undefined },
    { k: "Agent actions completed", v: String(actionsCompleted), mode: undefined },
  ];

  return (
    <motion.div
      ref={innerRef}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="ring-glow relative scroll-mt-24 overflow-hidden rounded-2xl glass-strong p-7"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--brand-emerald)/0.16),transparent_60%)]" />
      <div className="flex flex-col items-center gap-3 text-center">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="grid size-14 place-items-center rounded-full bg-emerald/15 ring-1 ring-emerald/40 animate-pulse-ring"
        >
          <Check className="size-7 text-emerald" />
        </motion.span>
        <Badge variant="emerald">Business status: Operational</Badge>
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          {run.company.name || "Your company"} is ready to accept customers
        </h2>
      </div>

      {/* Required summary */}
      <div className="mx-auto mt-6 max-w-2xl divide-y divide-white/[0.06] rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        {rows.map((r) => (
          <div key={r.k} className="flex items-center justify-between gap-4 px-4 py-3">
            <span className="shrink-0 text-sm text-muted-foreground">{r.k}</span>
            <span className="flex min-w-0 items-center gap-2">
              {r.href ? (
                <a
                  href={r.href}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate font-mono text-xs text-cyan hover:underline"
                >
                  {r.v} <ExternalLink className="inline size-3" />
                </a>
              ) : (
                <span
                  className={cn(
                    "truncate text-sm",
                    r.k === "Business status" ? "font-medium text-emerald" : "font-mono text-xs text-foreground/90"
                  )}
                >
                  {r.v}
                </span>
              )}
              {r.mode && <ModeBadge mode={r.mode} />}
            </span>
          </div>
        ))}
      </div>

      {/* Status checks */}
      <div className="mx-auto mt-5 grid max-w-2xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Company Created", ok: !!run.company.name, mode: run.generationMode },
          { label: "Stripe Checkout Ready", ok: !!run.stripeUrl, mode: run.stripeMode },
          { label: "Landing Page Ready", ok: !!run.siteUrl, mode: "real" as ActionMode },
          { label: "Accepting Customers", ok: run.metrics.customers > 0, mode: "simulated" as ActionMode },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
            <span className={cn("mx-auto grid size-7 place-items-center rounded-full", c.ok ? "bg-emerald/15 text-emerald" : "bg-white/[0.05] text-muted-foreground")}>
              <Check className="size-4" />
            </span>
            <div className="mt-2 text-xs font-medium">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button variant="gradient" onClick={onDownload}>
          <FileDown className="size-4" /> Download PDF report
        </Button>
        {run.siteUrl && (
          <Button asChild variant="secondary">
            <a href={run.siteUrl} target="_blank" rel="noreferrer">
              <Globe className="size-4" /> Open live website
            </a>
          </Button>
        )}
        {run.stripeUrl && run.stripeMode === "real" && (
          <Button asChild variant="secondary">
            <a href={run.stripeUrl} target="_blank" rel="noreferrer">
              <CreditCard className="size-4" /> Open Stripe checkout
            </a>
          </Button>
        )}
        <Button variant="outline" onClick={onRunAgain}>
          <RotateCcw className="size-4" /> Run again
        </Button>
        <Button variant="ghost" onClick={onReset}>
          Reset
        </Button>
      </div>
    </motion.div>
  );
}
