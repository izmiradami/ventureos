"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStudio } from "@/lib/store";
import { Sidebar, type StudioSection } from "@/components/studio/sidebar";
import { AgentStream } from "@/components/studio/agent-stream";
import { OpportunityDiscovery } from "@/components/studio/opportunity-discovery";
import { BusinessDashboard } from "@/components/studio/business-dashboard";
import { CompanyBuilder } from "@/components/studio/company-builder";
import { Monetization } from "@/components/studio/monetization";
import { MarketingEngine } from "@/components/studio/marketing-engine";
import { DemoMode } from "@/components/studio/demo-mode";
import { ControlCenter } from "@/components/studio/control-center";
import { Logo } from "@/components/shared/logo";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const MOBILE_NAV: { id: StudioSection; label: string }[] = [
  { id: "control", label: "Control Center" },
  { id: "discover", label: "Discovery" },
  { id: "overview", label: "Dashboard" },
  { id: "company", label: "Company" },
  { id: "monetization", label: "Monetization" },
  { id: "marketing", label: "Marketing" },
];

export default function DashboardPage() {
  const {
    stage,
    company,
    logs,
    isDiscovering,
    isBuilding,
    source,
    reset,
  } = useStudio();
  const [section, setSection] = useState<StudioSection>("control");
  const [autoDemo, setAutoDemo] = useState(false);
  const [autoSim, setAutoSim] = useState(false);
  const jumpedRef = useRef(false);

  // Read deep-link params once on mount (avoids useSearchParams Suspense need).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "1") {
      setAutoDemo(true);
      setSection("discover");
    }
    if (params.get("sim") === "1") {
      setAutoSim(true);
      setSection("control");
    }
  }, []);

  // When a company is freshly built, jump to the dashboard overview.
  useEffect(() => {
    if (stage === "ready" && company && !jumpedRef.current) {
      jumpedRef.current = true;
      setSection("overview");
    }
    if (stage !== "ready") jumpedRef.current = false;
  }, [stage, company]);

  const hasCompany = stage === "ready" && !!company;
  const active = isDiscovering || isBuilding;

  const handleReset = () => {
    reset();
    setSection("control");
    setAutoDemo(false);
    setAutoSim(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar (desktop) */}
      <div className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-white/[0.06] md:block">
        <Sidebar
          active={section}
          onSelect={setSection}
          hasCompany={hasCompany}
          onReset={handleReset}
        />
      </div>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/[0.06] bg-background/70 px-5 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3 md:hidden">
            <Logo />
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <h2 className="font-display text-sm font-medium capitalize text-muted-foreground">
              Studio / <span className="text-foreground">{section}</span>
            </h2>
            {source && (
              <Badge variant={source === "ai" ? "cyan" : "secondary"}>
                {source === "ai" ? "Live AI" : "Mock engine"}
              </Badge>
            )}
          </div>
          <DemoMode compact />
        </header>

        {/* Mobile section nav */}
        <div className="flex gap-1 overflow-x-auto border-b border-white/[0.06] px-4 py-2 md:hidden">
          {MOBILE_NAV.map((item) => {
            const locked =
              item.id !== "discover" && item.id !== "control" && !hasCompany;
            return (
              <button
                key={item.id}
                disabled={locked}
                onClick={() => setSection(item.id)}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors",
                  section === item.id
                    ? "bg-white/[0.06] text-foreground"
                    : locked
                      ? "text-muted-foreground/40"
                      : "text-muted-foreground"
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {section === "control" ? (
          <div className="flex-1 p-5">
            <ControlCenter autoStart={autoSim} />
          </div>
        ) : (
          <div className="grid flex-1 gap-6 p-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <main className="min-w-0">
              {section === "discover" && (
                <div className="space-y-8">
                  <DemoMode autoStart={autoDemo} />
                  <OpportunityDiscovery />
                </div>
              )}

              <AnimatePresence mode="wait">
                {hasCompany && section !== "discover" && (
                  <motion.div
                    key={section}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    {section === "overview" && <BusinessDashboard company={company!} />}
                    {section === "company" && <CompanyBuilder company={company!} />}
                    {section === "monetization" && <Monetization company={company!} />}
                    {section === "marketing" && <MarketingEngine company={company!} />}
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

            {/* Agent stream rail (stacks below on smaller screens) */}
            <div className="h-[420px] xl:sticky xl:top-24 xl:h-[calc(100vh-7rem)]">
              <AgentStream logs={logs} active={active} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
