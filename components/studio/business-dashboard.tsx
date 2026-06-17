"use client";

import { motion } from "framer-motion";
import {
  Gauge,
  DollarSign,
  Swords,
  TrendingUp,
  Globe,
  Activity,
} from "lucide-react";
import { Company } from "@/lib/types";
import { KpiCard } from "./kpi-card";
import { RevenueChart } from "./revenue-chart";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export function BusinessDashboard({ company }: { company: Company }) {
  const m = company.metrics;
  const lastMonth = company.projection[company.projection.length - 1];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              {company.name}
            </h1>
            <Badge variant="emerald" className="gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald animate-pulse-ring" />
              {m.status}
            </Badge>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
            <Globe className="size-3.5" /> {company.domain} · {company.tagline}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          index={0}
          label="Market score"
          value={`${m.marketScore}/100`}
          delta="Top-quartile fit"
          icon={Gauge}
          accent="violet"
        />
        <KpiCard
          index={1}
          label="Est. MRR (M12)"
          value={formatCurrency(m.estimatedMrr, { compact: true })}
          delta={`+${company.projection.length}mo ramp`}
          icon={DollarSign}
          accent="emerald"
        />
        <KpiCard
          index={2}
          label="Revenue potential"
          value={formatCurrency(m.revenuePotential, { compact: true })}
          delta="Annual run-rate"
          icon={TrendingUp}
          accent="cyan"
        />
        <KpiCard
          index={3}
          label="Competition"
          value={m.competition}
          delta={`Difficulty ${m.difficulty}/100`}
          icon={Swords}
          accent="amber"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl glass p-6 lg:col-span-2"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold">Revenue projection</h3>
              <p className="text-sm text-muted-foreground">
                Modeled MRR over the first 12 months
              </p>
            </div>
            <Badge variant="cyan" className="gap-1">
              <Activity className="size-3" />
              {lastMonth.customers} customers
            </Badge>
          </div>
          <RevenueChart data={company.projection} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="rounded-2xl glass p-6"
        >
          <h3 className="font-display font-semibold">Value proposition</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {company.valueProposition}
          </p>
          <div className="mt-5 space-y-3 border-t border-white/5 pt-5">
            <Stat label="Target customer" value={company.persona.role} />
            <Stat label="Pricing tiers" value={`${company.pricing.length} plans`} />
            <Stat
              label="Entry price"
              value={formatCurrency(company.pricing[0].price)}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
