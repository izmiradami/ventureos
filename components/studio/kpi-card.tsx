"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  delta?: string;
  icon: LucideIcon;
  accent?: "violet" | "cyan" | "emerald" | "amber";
  index?: number;
}

const accentMap = {
  violet: "text-violet bg-violet/10",
  cyan: "text-cyan bg-cyan/10",
  emerald: "text-emerald bg-emerald/10",
  amber: "text-amber bg-amber/10",
};

export function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  accent = "violet",
  index = 0,
}: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="ring-glow relative overflow-hidden rounded-2xl glass p-5"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span
          className={cn(
            "grid size-8 place-items-center rounded-lg",
            accentMap[accent]
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <div className="mt-3 font-display text-2xl font-semibold tracking-tight md:text-3xl">
        {value}
      </div>
      {delta && (
        <div className="mt-1 font-mono text-xs text-emerald">{delta}</div>
      )}
    </motion.div>
  );
}
