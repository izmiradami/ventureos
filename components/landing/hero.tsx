"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradientText } from "@/components/shared/gradient-text";

const STEPS = [
  "Researching market",
  "Finding opportunity",
  "Creating company",
  "Setting pricing",
  "Launch ready",
];

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.08, duration: 0.6, ease: [0.21, 0.5, 0.3, 1] },
  }),
};

export function Hero() {
  return (
    <section className="relative pt-36 pb-20 sm:pt-44">
      <div className="absolute inset-0 -z-10 grid-bg" />
      <div className="container flex flex-col items-center text-center">
        <motion.a
          custom={0}
          variants={fade}
          initial="hidden"
          animate="show"
          href="#demo"
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <Sparkles className="size-3.5 text-violet" />
          Autonomous venture studio
          <span className="text-foreground">· now live</span>
        </motion.a>

        <motion.h1
          custom={1}
          variants={fade}
          initial="hidden"
          animate="show"
          className="max-w-4xl font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
        >
          Launch a startup with <GradientText>one prompt</GradientText>
        </motion.h1>

        <motion.p
          custom={2}
          variants={fade}
          initial="hidden"
          animate="show"
          className="mt-6 max-w-2xl text-lg text-muted-foreground"
        >
          VentureOS discovers opportunities, creates businesses, and prepares
          them for revenue — landing page, pricing, Stripe and marketing
          included.
        </motion.p>

        <motion.div
          custom={3}
          variants={fade}
          initial="hidden"
          animate="show"
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Button asChild size="lg" variant="gradient">
            <Link href="/dashboard">
              Open the Studio <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/dashboard?sim=1">Watch a company built live</Link>
          </Button>
        </motion.div>

        {/* Signature: a live "company in a box" terminal */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.21, 0.5, 0.3, 1] }}
          className="mt-16 w-full max-w-3xl"
        >
          <div className="glass-strong overflow-hidden rounded-2xl text-left shadow-card">
            <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
              <span className="size-3 rounded-full bg-red-500/70" />
              <span className="size-3 rounded-full bg-amber/70" />
              <span className="size-3 rounded-full bg-emerald/70" />
              <span className="ml-3 font-mono text-xs text-muted-foreground">
                ventureos · agent
              </span>
            </div>
            <div className="space-y-3 p-5 font-mono text-sm">
              <p className="text-muted-foreground">
                <span className="text-violet">$</span> ventureos build
                &quot;Find a profitable SaaS business&quot;
              </p>
              <div className="space-y-2 pt-1">
                {STEPS.map((step, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + i * 0.45, duration: 0.4 }}
                    className="flex items-center gap-2.5"
                  >
                    <span className="grid size-4 place-items-center rounded-full bg-emerald/15">
                      <Check className="size-2.5 text-emerald" />
                    </span>
                    <span className="text-foreground/90">{step}</span>
                  </motion.div>
                ))}
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3.4, duration: 0.5 }}
                className="pt-2 text-emerald"
              >
                ✓ Company assembled in 11.4s — ready for revenue
              </motion.p>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="mt-8 text-sm text-muted-foreground"
        >
          Works instantly with realistic mock data — no API keys required.
        </motion.p>
      </div>
    </section>
  );
}
