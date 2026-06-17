"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Check, Loader2, Sparkles } from "lucide-react";
import { useStudio } from "@/lib/store";
import { DEMO_SCRIPT } from "@/lib/agent-actions";
import { generateCompany, generateOpportunities } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { sleep, cn } from "@/lib/utils";

export function DemoMode({
  compact = false,
  autoStart = false,
}: {
  compact?: boolean;
  autoStart?: boolean;
}) {
  const { pushLog, clearLogs, loadDemo, reset } = useStudio();
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(-1);
  const started = useRef(false);

  const run = useCallback(async () => {
    if (running) return;
    reset();
    clearLogs();
    setRunning(true);
    setStep(-1);

    const goal = "Find a profitable SaaS business";
    pushLog({ kind: "thinking", label: "Booting autonomous run", detail: goal });

    for (let i = 0; i < DEMO_SCRIPT.length; i++) {
      const s = DEMO_SCRIPT[i];
      setStep(i);
      pushLog({ kind: s.kind, label: s.label, detail: s.detail });
      await sleep(s.duration);
    }

    const opportunities = generateOpportunities(goal);
    const company = generateCompany(opportunities[0]);
    loadDemo(opportunities, company);
    setRunning(false);
  }, [running, pushLog, clearLogs, loadDemo, reset]);

  const progress = step < 0 ? 0 : ((step + 1) / DEMO_SCRIPT.length) * 100;

  useEffect(() => {
    if (autoStart && !started.current) {
      started.current = true;
      run();
    }
  }, [autoStart, run]);

  if (compact) {
    return (
      <Button onClick={run} disabled={running} variant="gradient" size="sm">
        {running ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Running
          </>
        ) : (
          <>
            <Play className="size-4" /> Demo
          </>
        )}
      </Button>
    );
  }

  return (
    <div className="ring-glow overflow-hidden rounded-2xl glass-strong p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-violet" />
            <h3 className="font-display font-semibold">Autonomous demo</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Watch VentureOS build a company end-to-end in one click.
          </p>
        </div>
        <Button onClick={run} disabled={running} variant="gradient">
          {running ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Running
            </>
          ) : (
            <>
              <Play className="size-4" /> Run the demo
            </>
          )}
        </Button>
      </div>

      <AnimatePresence>
        {step >= 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5"
          >
            <Progress value={progress} className="mb-4" />
            <div className="grid gap-2 sm:grid-cols-2">
              {DEMO_SCRIPT.map((s, i) => {
                const done = i < step || (i === step && !running);
                const active = i === step && running;
                return (
                  <div
                    key={s.label}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors",
                      done
                        ? "border-emerald/20 bg-emerald/[0.05]"
                        : active
                          ? "border-violet/30 bg-violet/[0.06]"
                          : "border-white/[0.05] bg-white/[0.01] opacity-50"
                    )}
                  >
                    <span className="grid size-5 place-items-center rounded-full">
                      {done ? (
                        <Check className="size-3.5 text-emerald" />
                      ) : active ? (
                        <Loader2 className="size-3.5 animate-spin text-violet" />
                      ) : (
                        <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                      )}
                    </span>
                    <span
                      className={cn(
                        done || active ? "text-foreground/90" : "text-muted-foreground"
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
