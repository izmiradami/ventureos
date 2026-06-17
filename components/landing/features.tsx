"use client";

import { motion } from "framer-motion";
import {
  Telescope,
  Building2,
  LineChart,
  CreditCard,
  Megaphone,
  Rocket,
} from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";

const FEATURES = [
  {
    icon: Telescope,
    title: "Opportunity discovery",
    body: "Describe a goal and the agent surfaces scored, sized, ranked startup opportunities in seconds.",
    accent: "text-violet",
    span: "md:col-span-2",
  },
  {
    icon: Building2,
    title: "Autonomous company builder",
    body: "Names, value props, personas, pricing and landing copy — a founding team in a box.",
    accent: "text-cyan",
    span: "",
  },
  {
    icon: LineChart,
    title: "Live business dashboard",
    body: "Market score, MRR projection and competition in KPI cards and charts.",
    accent: "text-emerald",
    span: "",
  },
  {
    icon: CreditCard,
    title: "Stripe monetization",
    body: "Subscription tiers and checkout sessions scaffolded and ready to charge.",
    accent: "text-amber",
    span: "md:col-span-2",
  },
  {
    icon: Megaphone,
    title: "Marketing engine",
    body: "Launch tweet, Product Hunt post, email campaign and ad copy generated on demand.",
    accent: "text-violet",
    span: "md:col-span-2",
  },
  {
    icon: Rocket,
    title: "One-click demo mode",
    body: "Watch the agent run the entire pipeline end-to-end with live progress.",
    accent: "text-cyan",
    span: "",
  },
];

export function Features() {
  return (
    <section id="features" className="container scroll-mt-24 py-24">
      <SectionHeading
        eyebrow="The platform"
        title="Everything a founder does, automated"
        description="VentureOS runs the full zero-to-revenue pipeline — and shows its work at every step."
      />
      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            className={`ring-glow group relative overflow-hidden rounded-2xl glass p-6 ${f.span}`}
          >
            <div className={`mb-4 inline-grid size-11 place-items-center rounded-xl bg-white/[0.04] ${f.accent}`}>
              <f.icon className="size-5" />
            </div>
            <h3 className="font-display text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {f.body}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
