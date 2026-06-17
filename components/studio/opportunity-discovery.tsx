"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { useStudio } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OpportunityCard } from "./opportunity-card";
import { Skeleton } from "@/components/ui/skeleton";

const EXAMPLES = [
  "Find a profitable SaaS business",
  "A fintech product for SMBs",
  "An AI tool developers will pay for",
  "A vertical SaaS in healthcare",
];

export function OpportunityDiscovery() {
  const {
    goal,
    setGoal,
    discover,
    isDiscovering,
    opportunities,
    select,
    isBuilding,
  } = useStudio();
  const [value, setValue] = useState(goal);

  const run = (g: string) => {
    setValue(g);
    setGoal(g);
    discover(g);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Discover an opportunity
        </h1>
        <p className="mt-1 text-muted-foreground">
          Describe a goal. The agent finds, scores and sizes startup
          opportunities.
        </p>
      </div>

      <div className="ring-glow rounded-2xl glass-strong p-2">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && value.trim() && run(value)}
              placeholder="e.g. Find a profitable SaaS business"
              className="h-12 border-0 bg-transparent pl-10 text-base focus-visible:ring-0"
            />
          </div>
          <Button
            size="lg"
            variant="gradient"
            disabled={isDiscovering || !value.trim()}
            onClick={() => run(value)}
            className="sm:w-44"
          >
            {isDiscovering ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Discovering
              </>
            ) : (
              <>
                <Sparkles className="size-4" /> Discover
              </>
            )}
          </Button>
        </div>
      </div>

      {opportunities.length === 0 && !isDiscovering && (
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => run(ex)}
              className="rounded-full border border-white/10 bg-white/[0.02] px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-violet/40 hover:text-foreground"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {isDiscovering && (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl glass p-5">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="mt-3 h-5 w-3/4" />
              <Skeleton className="mt-4 h-12 w-full" />
              <Skeleton className="mt-4 h-10 w-full" />
            </div>
          ))}
        </div>
      )}

      {opportunities.length > 0 && !isDiscovering && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-4 md:grid-cols-2"
        >
          {opportunities.map((opp, i) => (
            <OpportunityCard
              key={opp.id}
              opp={opp}
              index={i}
              onSelect={select}
              selecting={isBuilding}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
