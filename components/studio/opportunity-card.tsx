"use client";

import { motion } from "framer-motion";
import { ArrowRight, Gauge, TrendingUp, Users } from "lucide-react";
import { Opportunity } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

const competitionVariant = {
  Low: "emerald",
  Medium: "amber",
  High: "secondary",
} as const;

export function OpportunityCard({
  opp,
  index,
  onSelect,
  selecting,
}: {
  opp: Opportunity;
  index: number;
  onSelect: (o: Opportunity) => void;
  selecting: boolean;
}) {
  const circumference = 2 * Math.PI * 22;
  const offset = circumference - (opp.score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.45 }}
      className="ring-glow group flex flex-col rounded-2xl glass p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Badge variant="secondary" className="mb-2">
            {opp.category}
          </Badge>
          <h3 className="font-display text-base font-semibold leading-snug">
            {opp.title}
          </h3>
        </div>
        {/* Score ring */}
        <div className="relative shrink-0">
          <svg width="56" height="56" className="-rotate-90">
            <circle
              cx="28"
              cy="28"
              r="22"
              fill="none"
              stroke="hsl(230 18% 16%)"
              strokeWidth="4"
            />
            <motion.circle
              cx="28"
              cy="28"
              r="22"
              fill="none"
              stroke="hsl(258 90% 66%)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ delay: index * 0.07 + 0.2, duration: 0.8, ease: "easeOut" }}
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center font-mono text-sm font-semibold">
            {opp.score}
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {opp.description}
      </p>

      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/5 pt-4 text-sm">
        <Metric
          icon={TrendingUp}
          label="MRR"
          value={formatCurrency(opp.estimatedMrr, { compact: true })}
        />
        <Metric
          icon={Gauge}
          label="TAM"
          value={formatCurrency(opp.marketSize, { compact: true })}
        />
        <Metric
          icon={Users}
          label="Competition"
          value={opp.competition}
          badge={competitionVariant[opp.competition]}
        />
      </div>

      <Button
        onClick={() => onSelect(opp)}
        disabled={selecting}
        variant="gradient"
        className="mt-5 w-full"
      >
        Build this company <ArrowRight className="size-4" />
      </Button>
    </motion.div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  badge,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
  badge?: "emerald" | "amber" | "secondary";
}) {
  return (
    <div className="space-y-1">
      <span className="flex items-center gap-1 text-[0.7rem] text-muted-foreground">
        <Icon className="size-3" /> {label}
      </span>
      {badge ? (
        <Badge variant={badge} className="px-2 py-0 text-[0.7rem]">
          {value}
        </Badge>
      ) : (
        <span className="font-mono text-sm font-medium">{value}</span>
      )}
    </div>
  );
}
