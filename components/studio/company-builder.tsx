"use client";

import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Quote, Target, User, type LucideIcon } from "lucide-react";
import { Company } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function FeatureIcon({ name }: { name: string }) {
  const lib = Icons as unknown as Record<string, LucideIcon>;
  const Icon = lib[name] ?? Icons.Sparkles;
  return <Icon className="size-5 text-violet" />;
}

export function CompanyBuilder({ company }: { company: Company }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Company
        </h1>
        <p className="mt-1 text-muted-foreground">
          Everything the agent generated, ready to ship.
        </p>
      </div>

      {/* Landing page preview */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="ring-glow overflow-hidden rounded-2xl glass-strong"
      >
        <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-red-500/60" />
          <span className="size-2.5 rounded-full bg-amber/60" />
          <span className="size-2.5 rounded-full bg-emerald/60" />
          <span className="ml-2 rounded-md bg-white/[0.04] px-2 py-0.5 font-mono text-[0.7rem] text-muted-foreground">
            {company.domain}
          </span>
        </div>
        <div className="relative px-6 py-14 text-center sm:px-12">
          <div className="absolute inset-0 -z-10 grid-bg opacity-50" />
          <Badge variant="secondary" className="mb-5">
            {company.landing.socialProof}
          </Badge>
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {company.landing.headline}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            {company.landing.subheadline}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button variant="gradient" size="lg">
              {company.landing.cta}
            </Button>
            <Button variant="secondary" size="lg">
              Book a demo
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl glass p-6 lg:col-span-2"
        >
          <h3 className="font-display font-semibold">Features</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {company.features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
              >
                <div className="mb-2 inline-grid size-9 place-items-center rounded-lg bg-white/[0.04]">
                  <FeatureIcon name={f.icon} />
                </div>
                <h4 className="text-sm font-medium">{f.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Persona */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="rounded-2xl glass p-6"
        >
          <h3 className="font-display font-semibold">Customer persona</h3>
          <div className="mt-4 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-violet to-cyan font-display text-sm font-semibold text-white">
              {company.persona.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
            <div>
              <p className="text-sm font-medium">{company.persona.name}</p>
              <p className="text-xs text-muted-foreground">
                {company.persona.role}, {company.persona.company}
              </p>
            </div>
          </div>
          <p className="mt-4 flex gap-2 text-sm text-muted-foreground">
            <Quote className="size-4 shrink-0 text-violet" />
            {company.persona.bio}
          </p>
          <div className="mt-5 space-y-4 border-t border-white/5 pt-5">
            <PersonaList
              icon={<Target className="size-3.5 text-amber" />}
              title="Pain points"
              items={company.persona.painPoints}
            />
            <PersonaList
              icon={<User className="size-3.5 text-emerald" />}
              title="Goals"
              items={company.persona.goals}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function PersonaList({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {icon} {title}
      </p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-foreground/85">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
