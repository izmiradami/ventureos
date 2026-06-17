export type CompetitionLevel = "Low" | "Medium" | "High";
export type BusinessStatus =
  | "Idea"
  | "Building"
  | "Launch Ready"
  | "Live";

export interface Opportunity {
  id: string;
  title: string;
  category: string;
  description: string;
  score: number; // 0-100 overall opportunity score
  marketSize: number; // USD TAM
  difficulty: number; // 0-100, higher = harder
  competition: CompetitionLevel;
  estimatedMrr: number; // USD MRR at month 12
  growthRate: number; // % YoY
  tags: string[];
}

export interface Feature {
  title: string;
  description: string;
  icon: string; // lucide icon name
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number; // monthly USD; 0 means custom
  interval: "month" | "year";
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
  custom?: boolean;
}

export interface Persona {
  name: string;
  role: string;
  company: string;
  bio: string;
  painPoints: string[];
  goals: string[];
}

export interface MarketingAssets {
  tweet: string;
  productHunt: { tagline: string; body: string };
  email: { subject: string; body: string };
  ads: { platform: string; headline: string; body: string }[];
}

export interface RevenuePoint {
  month: string;
  mrr: number;
  customers: number;
}

export interface Company {
  name: string;
  domain: string;
  tagline: string;
  valueProposition: string;
  landing: {
    headline: string;
    subheadline: string;
    cta: string;
    socialProof: string;
  };
  features: Feature[];
  persona: Persona;
  pricing: PricingPlan[];
  marketing: MarketingAssets;
  metrics: {
    marketScore: number;
    revenuePotential: number;
    competition: CompetitionLevel;
    estimatedMrr: number;
    status: BusinessStatus;
    difficulty: number;
  };
  projection: RevenuePoint[];
}

export type AgentLogKind = "thinking" | "action" | "success" | "data";

export interface AgentLog {
  id: string;
  kind: AgentLogKind;
  label: string;
  detail?: string;
  ts: number;
}

// --- Autonomous run (partially real) types ---

export interface AgentTier {
  name: string;
  price: number; // monthly USD
  features: string[];
  highlighted?: boolean;
}

export interface AgentLanding {
  headline: string;
  subheadline: string;
  cta: string;
  bullets: string[];
}

export interface AgentCompany {
  idea: string;
  category: string;
  name: string;
  domain: string;
  tagline: string;
  valueProp: string;
  pricing: AgentTier[];
  landing: AgentLanding;
}

export type ActionMode = "real" | "simulated";

export interface CompanyRecord {
  id: string;
  goal: string;
  company: AgentCompany;
  generationMode: ActionMode;
  stripeUrl?: string;
  stripeMode?: ActionMode;
  siteDeployed?: boolean;
  siteUrl?: string;
  createdAt: number;
}
