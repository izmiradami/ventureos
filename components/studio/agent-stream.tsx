"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Zap, CheckCircle2, BarChart3, Terminal } from "lucide-react";
import { AgentLog, AgentLogKind } from "@/lib/types";
import { cn } from "@/lib/utils";

const META: Record<
  AgentLogKind,
  { icon: typeof Brain; color: string; dot: string }
> = {
  thinking: { icon: Brain, color: "text-violet", dot: "bg-violet" },
  action: { icon: Zap, color: "text-cyan", dot: "bg-cyan" },
  success: { icon: CheckCircle2, color: "text-emerald", dot: "bg-emerald" },
  data: { icon: BarChart3, color: "text-amber", dot: "bg-amber" },
};

export function AgentStream({
  logs,
  active,
}: {
  logs: AgentLog[];
  active: boolean;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [logs.length]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl glass-strong">
      <div className="flex items-center gap-2.5 border-b border-white/5 px-4 py-3">
        <span className="grid size-7 place-items-center rounded-lg bg-white/[0.04]">
          <Terminal className="size-3.5 text-violet" />
        </span>
        <span className="font-display text-sm font-medium">Agent activity</span>
        <span className="ml-auto flex items-center gap-1.5">
          <span
            className={cn(
              "size-2 rounded-full",
              active ? "bg-emerald animate-pulse-ring" : "bg-muted-foreground/40"
            )}
          />
          <span className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
            {active ? "running" : "idle"}
          </span>
        </span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-4 font-mono text-xs">
        {logs.length === 0 && (
          <p className="text-muted-foreground/60">
            <span className="text-violet">$</span> waiting for a goal…
          </p>
        )}
        <AnimatePresence initial={false}>
          {logs.map((log) => {
            const meta = META[log.kind];
            const Icon = meta.icon;
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-2.5"
              >
                <Icon className={cn("mt-0.5 size-3.5 shrink-0", meta.color)} />
                <div className="min-w-0">
                  <p className="text-foreground/90">{log.label}</p>
                  {log.detail && (
                    <p className="truncate text-muted-foreground/70">
                      {log.detail}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {active && (
          <div className="flex items-center gap-2 pt-1 text-violet">
            <span className="inline-block size-2 animate-pulse rounded-full bg-violet" />
            <span className="animate-pulse">processing…</span>
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
