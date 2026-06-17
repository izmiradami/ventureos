"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/shared/section-heading";
import { cn } from "@/lib/utils";

const TIERS = [
  {
    name: "Solo",
    price: "$0",
    period: "free forever",
    description: "For founders exploring their first idea.",
    features: [
      "3 opportunity scans / day",
      "1 company build",
      "Mock data engine",
      "Export landing copy",
    ],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Studio",
    price: "$49",
    period: "per month",
    description: "For builders shipping real companies.",
    features: [
      "Unlimited scans & builds",
      "Live AI generation",
      "Stripe checkout integration",
      "Marketing engine",
      "Revenue projections",
    ],
    cta: "Start 14-day trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "let's talk",
    description: "For teams launching at scale.",
    features: [
      "Everything in Studio",
      "SSO, SAML & audit logs",
      "Dedicated success manager",
      "Custom agents & API access",
      "Priority compute",
    ],
    cta: "Talk to sales",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="container scroll-mt-24 py-24">
      <SectionHeading
        eyebrow="Pricing"
        title="Start free. Scale when you ship."
        description="Every plan runs on the same autonomous engine. Upgrade only when you're ready for revenue."
      />
      <div className="mt-14 grid gap-5 lg:grid-cols-3">
        {TIERS.map((tier, i) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className={cn(
              "relative flex flex-col rounded-2xl p-7",
              tier.highlighted
                ? "glass-strong shadow-glow ring-1 ring-violet/40"
                : "glass"
            )}
          >
            {tier.highlighted && (
              <Badge className="absolute -top-3 left-7">Most popular</Badge>
            )}
            <h3 className="font-display text-lg font-semibold">{tier.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {tier.description}
            </p>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="font-display text-4xl font-semibold tracking-tight">
                {tier.price}
              </span>
              <span className="text-sm text-muted-foreground">{tier.period}</span>
            </div>
            <ul className="mt-6 flex-1 space-y-3">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald" />
                  <span className="text-foreground/85">{f}</span>
                </li>
              ))}
            </ul>
            <Button
              asChild
              className="mt-7 w-full"
              variant={tier.highlighted ? "gradient" : "secondary"}
            >
              <Link href="/dashboard">{tier.cta}</Link>
            </Button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
