"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Play, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";

const PIPELINE = [
  "Find a SaaS opportunity",
  "Incorporate the company",
  "Model the pricing",
  "Wire up Stripe billing",
  "Pay for tools autonomously",
  "Launch marketing campaigns",
  "Acquire the first customer",
  "Collect first revenue",
];

export function DemoSection() {
  return (
    <section id="demo" className="container scroll-mt-24 py-24">
      <div className="ring-glow relative overflow-hidden rounded-3xl glass-strong p-8 sm:p-12">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Live demo"
              title={<>Watch an AI company being created</>}
              description="One click runs the full autonomous pipeline in the Control Center — from market scan to first paid Stripe invoice, visualized in real time."
            />
            <Button asChild size="lg" variant="gradient" className="mt-8">
              <Link href="/dashboard?sim=1">
                <Play className="size-4" /> Open the Control Center
              </Link>
            </Button>
          </div>

          <div className="space-y-2.5">
            {PIPELINE.map((step, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-violet to-cyan font-mono text-[0.65rem] font-bold text-white">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm text-foreground/90">{step}</span>
                <ArrowRight className="ml-auto size-3.5 text-muted-foreground/40" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
