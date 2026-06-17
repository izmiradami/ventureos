"use client";

import { create } from "zustand";
import { AgentLog, Company, Opportunity } from "./types";

type Stage = "idle" | "discovered" | "building" | "ready";

interface StudioState {
  stage: Stage;
  goal: string;
  isDiscovering: boolean;
  isBuilding: boolean;
  opportunities: Opportunity[];
  selected: Opportunity | null;
  company: Company | null;
  logs: AgentLog[];
  source: "ai" | "mock" | null;

  setGoal: (goal: string) => void;
  discover: (goal: string) => Promise<void>;
  select: (opp: Opportunity) => Promise<void>;
  pushLog: (log: Omit<AgentLog, "id" | "ts">) => void;
  clearLogs: () => void;
  loadDemo: (opportunities: Opportunity[], company: Company) => void;
  reset: () => void;
}

let logCounter = 0;

export const useStudio = create<StudioState>((set, get) => ({
  stage: "idle",
  goal: "",
  isDiscovering: false,
  isBuilding: false,
  opportunities: [],
  selected: null,
  company: null,
  logs: [],
  source: null,

  setGoal: (goal) => set({ goal }),

  pushLog: (log) =>
    set((s) => ({
      logs: [
        ...s.logs,
        { ...log, id: `log_${logCounter++}`, ts: Date.now() },
      ].slice(-40),
    })),

  clearLogs: () => set({ logs: [] }),

  discover: async (goal) => {
    set({ isDiscovering: true, goal });
    get().pushLog({ kind: "thinking", label: "Analyzing your goal", detail: goal });
    try {
      const res = await fetch("/api/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal }),
      });
      const data = await res.json();
      get().pushLog({
        kind: "success",
        label: `Found ${data.opportunities.length} opportunities`,
        detail: `Source: ${data.source === "ai" ? "live AI" : "mock engine"}`,
      });
      set({
        opportunities: data.opportunities,
        stage: "discovered",
        source: data.source,
        isDiscovering: false,
      });
    } catch {
      set({ isDiscovering: false });
      get().pushLog({
        kind: "action",
        label: "Discovery failed",
        detail: "Could not reach the discovery engine.",
      });
    }
  },

  select: async (opp) => {
    set({ selected: opp, isBuilding: true, stage: "building" });
    get().pushLog({
      kind: "action",
      label: "Building company",
      detail: opp.title,
    });
    try {
      const res = await fetch("/api/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunity: opp }),
      });
      const data = await res.json();
      get().pushLog({
        kind: "success",
        label: `${data.company.name} assembled`,
        detail: "Landing page, pricing & marketing ready",
      });
      set({ company: data.company, stage: "ready", isBuilding: false });
    } catch {
      set({ isBuilding: false });
    }
  },

  loadDemo: (opportunities, company) =>
    set({
      opportunities,
      selected: opportunities[0] ?? null,
      company,
      stage: "ready",
      source: "mock",
      goal: "Find a profitable SaaS business",
    }),

  reset: () =>
    set({
      stage: "idle",
      goal: "",
      opportunities: [],
      selected: null,
      company: null,
      logs: [],
      source: null,
      isDiscovering: false,
      isBuilding: false,
    }),
}));
