export interface AgentStep {
  label: string;
  detail: string;
  kind: "thinking" | "action" | "success" | "data";
  duration: number; // ms
}

/** The scripted run shown in Demo Mode — the product's signature moment. */
export const DEMO_SCRIPT: AgentStep[] = [
  {
    label: "Researching market",
    detail: "Scanning 12,400 signals across funding, search trends & job posts",
    kind: "thinking",
    duration: 1500,
  },
  {
    label: "Finding opportunity",
    detail: "Ranked 28 candidates → selected the highest score-to-difficulty ratio",
    kind: "action",
    duration: 1400,
  },
  {
    label: "Scoring & sizing",
    detail: "TAM $2.4B · MRR potential $84k · competition Low",
    kind: "data",
    duration: 1200,
  },
  {
    label: "Creating company",
    detail: "Named the company, wrote the value prop & defined the persona",
    kind: "action",
    duration: 1300,
  },
  {
    label: "Generating landing page",
    detail: "Hero, features, FAQ & social proof drafted",
    kind: "action",
    duration: 1400,
  },
  {
    label: "Setting pricing",
    detail: "3 tiers modeled against willingness-to-pay",
    kind: "data",
    duration: 1100,
  },
  {
    label: "Preparing Stripe checkout",
    detail: "Products, prices & subscription objects scaffolded",
    kind: "action",
    duration: 1300,
  },
  {
    label: "Creating marketing campaign",
    detail: "Launch tweet, Product Hunt post, email & ad copy ready",
    kind: "action",
    duration: 1200,
  },
  {
    label: "Launch ready",
    detail: "Company assembled in 11.4s — ready for revenue",
    kind: "success",
    duration: 900,
  },
];
