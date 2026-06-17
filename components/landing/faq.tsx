"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "Does VentureOS work without API keys?",
    a: "Yes. The entire product runs immediately on a realistic mock engine. Add an Anthropic or OpenAI key only when you want live, prompt-specific generation.",
  },
  {
    q: "What does the agent actually generate?",
    a: "Scored opportunities, a company name and value prop, a customer persona, pricing tiers, full landing page copy, a 12-month revenue projection, and a complete marketing campaign.",
  },
  {
    q: "How does the Stripe integration work?",
    a: "The Monetization section scaffolds subscription tiers and creates Stripe Checkout sessions. Without a Stripe key it runs in demo mode; add STRIPE_SECRET_KEY to charge for real.",
  },
  {
    q: "Is it really production-ready?",
    a: "It's a clean Next.js 15 + TypeScript codebase with reusable components, responsive layouts and a professional folder structure — deployable to Vercel in one click.",
  },
  {
    q: "Can I customize the generated businesses?",
    a: "Everything is editable. The mock library and prompts are centralized in /lib, so you can swap in your own opportunity sets or change the generation logic.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="container scroll-mt-24 py-24">
      <SectionHeading eyebrow="FAQ" title="Questions, answered" />
      <div className="mx-auto mt-12 max-w-3xl space-y-3">
        {FAQS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              key={item.q}
              className="overflow-hidden rounded-2xl glass"
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="font-medium">{item.q}</span>
                <Plus
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform duration-300",
                    isOpen && "rotate-45 text-violet"
                  )}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
