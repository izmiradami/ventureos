"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Telescope,
  LayoutDashboard,
  Building2,
  CreditCard,
  Megaphone,
  Radio,
  Lock,
  RotateCcw,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

export type StudioSection =
  | "control"
  | "discover"
  | "overview"
  | "company"
  | "monetization"
  | "marketing";

const NAV: {
  id: StudioSection;
  label: string;
  icon: typeof Telescope;
  requiresCompany?: boolean;
  featured?: boolean;
}[] = [
  { id: "control", label: "Control Center", icon: Radio, featured: true },
  { id: "discover", label: "Discovery", icon: Telescope },
  { id: "overview", label: "Dashboard", icon: LayoutDashboard, requiresCompany: true },
  { id: "company", label: "Company", icon: Building2, requiresCompany: true },
  { id: "monetization", label: "Monetization", icon: CreditCard, requiresCompany: true },
  { id: "marketing", label: "Marketing", icon: Megaphone, requiresCompany: true },
];

export function Sidebar({
  active,
  onSelect,
  hasCompany,
  onReset,
}: {
  active: StudioSection;
  onSelect: (s: StudioSection) => void;
  hasCompany: boolean;
  onReset: () => void;
}) {
  return (
    <aside className="flex h-full flex-col gap-6 p-4">
      <Link href="/" className="px-2 pt-2" aria-label="Back to home">
        <Logo />
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const locked = item.requiresCompany && !hasCompany;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => !locked && onSelect(item.id)}
              disabled={locked}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "text-foreground"
                  : locked
                    ? "cursor-not-allowed text-muted-foreground/40"
                    : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 -z-10 rounded-xl bg-white/[0.06]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <item.icon className="size-4" />
              <span>{item.label}</span>
              {item.featured && !locked && (
                <span className="ml-auto size-1.5 rounded-full bg-emerald animate-pulse-ring" />
              )}
              {locked && <Lock className="ml-auto size-3" />}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto">
        <button
          onClick={onReset}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
        >
          <RotateCcw className="size-4" />
          New venture
        </button>
      </div>
    </aside>
  );
}
