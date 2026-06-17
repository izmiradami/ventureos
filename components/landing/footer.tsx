"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="container pb-12 pt-8">
      <div className="ring-glow relative overflow-hidden rounded-3xl glass-strong px-8 py-14 text-center sm:py-20">
        <div className="absolute inset-0 -z-10 grid-bg opacity-60" />
        <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Your next company is one prompt away
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Open the Studio and let the agent take the first pass — from
          opportunity to checkout.
        </p>
        <Button asChild size="lg" variant="gradient" className="mt-8">
          <Link href="/dashboard">
            Open the Studio <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-10 flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
        <Logo />
        <p>Built with Hermes + NVIDIA + Stripe.</p>
        <p>© {new Date().getFullYear()} VentureOS</p>
      </div>
    </footer>
  );
}
