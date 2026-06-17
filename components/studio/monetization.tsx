"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, CreditCard, Loader2, Sparkles } from "lucide-react";
import { Company, PricingPlan } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";

export function Monetization({ company }: { company: Company }) {
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const checkout = async (plan: PricingPlan) => {
    if (plan.custom) {
      setNotice("Enterprise plans route to your sales team. Add a contact flow here.");
      return;
    }
    setLoading(plan.id);
    setNotice(null);
    try {
      const price = yearly ? plan.price * 10 : plan.price;
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: plan.name,
          price,
          interval: yearly ? "year" : "month",
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setNotice(
          data.message ||
            "Demo checkout: add STRIPE_SECRET_KEY in .env.local to create a real session."
        );
      }
    } catch {
      setNotice("Could not reach the checkout endpoint.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Monetization
          </h1>
          <p className="mt-1 text-muted-foreground">
            Subscription tiers with Stripe checkout, ready to charge.
          </p>
        </div>
        {/* Billing toggle */}
        <div className="inline-flex items-center gap-1 rounded-xl glass p-1">
          <ToggleBtn active={!yearly} onClick={() => setYearly(false)}>
            Monthly
          </ToggleBtn>
          <ToggleBtn active={yearly} onClick={() => setYearly(true)}>
            Yearly
            <Badge variant="emerald" className="ml-1.5 px-1.5 py-0 text-[0.65rem]">
              -17%
            </Badge>
          </ToggleBtn>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {company.pricing.map((plan, i) => {
          const monthly = plan.custom
            ? null
            : yearly
              ? Math.round((plan.price * 10) / 12)
              : plan.price;
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                "relative flex flex-col rounded-2xl p-6",
                plan.highlighted
                  ? "glass-strong shadow-glow ring-1 ring-violet/40"
                  : "glass"
              )}
            >
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-6 gap-1">
                  <Sparkles className="size-3" /> Recommended
                </Badge>
              )}
              <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {plan.description}
              </p>
              <div className="mt-5 flex items-baseline gap-1.5">
                {plan.custom ? (
                  <span className="font-display text-3xl font-semibold">
                    Custom
                  </span>
                ) : (
                  <>
                    <span className="font-display text-4xl font-semibold tracking-tight">
                      {formatCurrency(monthly ?? 0)}
                    </span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </>
                )}
              </div>
              {yearly && !plan.custom && (
                <p className="mt-1 font-mono text-xs text-emerald">
                  {formatCurrency(plan.price * 10)} billed yearly
                </p>
              )}
              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald" />
                    <span className="text-foreground/85">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => checkout(plan)}
                disabled={loading === plan.id}
                variant={plan.highlighted ? "gradient" : "secondary"}
                className="mt-6 w-full"
              >
                {loading === plan.id ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Starting…
                  </>
                ) : (
                  <>
                    {!plan.custom && <CreditCard className="size-4" />}
                    {plan.cta}
                  </>
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {notice && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-violet/30 bg-violet/[0.06] px-4 py-3 text-sm text-foreground/90"
        >
          {notice}
        </motion.div>
      )}

      <div className="rounded-2xl glass p-5 text-sm text-muted-foreground">
        <p className="flex items-center gap-2 font-medium text-foreground">
          <CreditCard className="size-4 text-cyan" /> Stripe integration
        </p>
        <p className="mt-2 leading-relaxed">
          Checkout calls <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs">POST /api/checkout</code>,
          which creates a real Stripe Checkout Session when
          <code className="mx-1 rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs">STRIPE_SECRET_KEY</code>
          is set. Without it, the flow runs in demo mode so you can present
          without any setup.
        </p>
      </div>
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all",
        active
          ? "bg-white/[0.08] text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
