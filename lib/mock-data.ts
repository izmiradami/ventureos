import {
  Company,
  CompetitionLevel,
  Opportunity,
  RevenuePoint,
} from "./types";
import { seededRandom } from "./utils";

interface OpportunitySeed {
  title: string;
  category: string;
  description: string;
  tags: string[];
  baseMrr: number;
  baseTam: number;
  difficulty: number;
  competition: CompetitionLevel;
}

/** A curated library the mock engine draws from, weighted by the user's goal. */
const LIBRARY: OpportunitySeed[] = [
  {
    title: "AI Compliance Copilot for Fintech",
    category: "B2B SaaS",
    description:
      "Continuous SOC2 and PCI monitoring that reads your infra and writes the evidence for you. Replaces $40k/yr consultants for early-stage fintechs.",
    tags: ["Fintech", "Compliance", "AI Agents"],
    baseMrr: 62000,
    baseTam: 4_200_000_000,
    difficulty: 64,
    competition: "Medium",
  },
  {
    title: "Headless Returns API for DTC Brands",
    category: "Commerce Infra",
    description:
      "One API to power instant exchanges, store credit, and reverse logistics. Brands cut return costs 30% and keep revenue in-house.",
    tags: ["E-commerce", "API", "Logistics"],
    baseMrr: 48000,
    baseTam: 2_800_000_000,
    difficulty: 52,
    competition: "Medium",
  },
  {
    title: "Vertical CRM for Solo Med Spas",
    category: "Vertical SaaS",
    description:
      "Booking, intake, payments, and HIPAA-safe messaging for the 40k US med spas still running on spreadsheets and texts.",
    tags: ["Healthcare", "Vertical SaaS", "Payments"],
    baseMrr: 71000,
    baseTam: 1_600_000_000,
    difficulty: 45,
    competition: "Low",
  },
  {
    title: "Usage-Based Billing for AI Startups",
    category: "Dev Tools",
    description:
      "Meter tokens, GPU-seconds, and seats, then turn them into invoices and Stripe subscriptions without a billing team.",
    tags: ["Developer Tools", "Billing", "AI"],
    baseMrr: 55000,
    baseTam: 3_500_000_000,
    difficulty: 58,
    competition: "High",
  },
  {
    title: "Field Service Scheduler for HVAC Crews",
    category: "Vertical SaaS",
    description:
      "Dispatch, route, quote, and collect payment from one mobile app built for the trades. Sticky, underserved, recession-resistant.",
    tags: ["Field Service", "Mobile", "SMB"],
    baseMrr: 84000,
    baseTam: 2_100_000_000,
    difficulty: 41,
    competition: "Low",
  },
  {
    title: "Creator Payout Rails for Marketplaces",
    category: "Fintech",
    description:
      "Embedded Stripe Connect onboarding, tax forms, and instant payouts for marketplaces with thousands of sellers.",
    tags: ["Fintech", "Marketplace", "Payments"],
    baseMrr: 39000,
    baseTam: 5_100_000_000,
    difficulty: 67,
    competition: "Medium",
  },
  {
    title: "Auto-Generated Onboarding for B2B SaaS",
    category: "Growth SaaS",
    description:
      "Watches product usage and ships personalized interactive walkthroughs that lift activation 2x — no PM required.",
    tags: ["Growth", "Activation", "AI"],
    baseMrr: 44000,
    baseTam: 1_900_000_000,
    difficulty: 49,
    competition: "Medium",
  },
  {
    title: "Spend Controls for Restaurant Groups",
    category: "Fintech",
    description:
      "Virtual cards, per-location budgets, and receipt capture for multi-unit restaurants drowning in supplier invoices.",
    tags: ["Fintech", "Hospitality", "Cards"],
    baseMrr: 76000,
    baseTam: 2_400_000_000,
    difficulty: 55,
    competition: "Low",
  },
];

const competitionScore: Record<CompetitionLevel, number> = {
  Low: 0.95,
  Medium: 0.75,
  High: 0.55,
};

export function generateOpportunities(goal: string): Opportunity[] {
  const rand = seededRandom(goal.toLowerCase().trim() || "venture");
  const g = goal.toLowerCase();

  // Light keyword weighting so the result feels responsive to the prompt.
  const scored = LIBRARY.map((seed) => {
    let weight = rand();
    const haystack = (seed.title + seed.category + seed.tags.join(" ")).toLowerCase();
    for (const kw of [
      "fintech",
      "saas",
      "ai",
      "commerce",
      "health",
      "dev",
      "billing",
      "market",
      "payment",
    ]) {
      if (g.includes(kw) && haystack.includes(kw)) weight += 0.6;
    }
    if (g.includes("profitable") && seed.competition === "Low") weight += 0.3;
    return { seed, weight };
  })
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 4);

  return scored.map(({ seed }, i): Opportunity => {
    const jitter = (n: number, pct: number) =>
      Math.round(n * (1 + (rand() - 0.5) * pct));
    const mrr = jitter(seed.baseMrr, 0.4);
    const tam = jitter(seed.baseTam, 0.3);
    const growthRate = 60 + Math.round(rand() * 140);
    const score = Math.min(
      98,
      Math.round(
        (competitionScore[seed.competition] * 50 +
          (100 - seed.difficulty) * 0.3 +
          (mrr / 1000) * 0.25) *
          (i === 0 ? 1.05 : 1)
      )
    );
    return {
      id: `opp_${i}_${Math.floor(rand() * 1e6).toString(36)}`,
      title: seed.title,
      category: seed.category,
      description: seed.description,
      score: Math.max(58, score),
      marketSize: tam,
      difficulty: seed.difficulty,
      competition: seed.competition,
      estimatedMrr: mrr,
      growthRate,
      tags: seed.tags,
    };
  });
}

function buildProjection(targetMrr: number, seed: () => number): RevenuePoint[] {
  const months = [
    "M1", "M2", "M3", "M4", "M5", "M6",
    "M7", "M8", "M9", "M10", "M11", "M12",
  ];
  const start = Math.max(800, targetMrr * 0.02);
  const growth = Math.pow(targetMrr / start, 1 / 11);
  return months.map((month, i) => {
    const mrr = Math.round(start * Math.pow(growth, i) * (0.92 + seed() * 0.16));
    return {
      month,
      mrr,
      customers: Math.max(3, Math.round(mrr / (60 + seed() * 80))),
    };
  });
}

const COMPANY_NAMES = [
  "Ledgerly", "Northstar", "Cadence", "Beacon", "Verra",
  "Stratus", "Onpoint", "Helio", "Kindling", "Axiom",
];

export function generateCompany(opp: Opportunity): Company {
  const rand = seededRandom(opp.id + opp.title);
  const name =
    COMPANY_NAMES[Math.floor(rand() * COMPANY_NAMES.length)] +
    (rand() > 0.5 ? "" : " " + ["AI", "Labs", "HQ", "OS"][Math.floor(rand() * 4)]);
  const domain = name.toLowerCase().replace(/\s+/g, "") + ".com";
  const projection = buildProjection(opp.estimatedMrr, rand);

  const monthly = Math.max(29, Math.round((opp.estimatedMrr / 1000) * 4));
  const proPrice = monthly * 3;

  return {
    name,
    domain,
    tagline: `${opp.category} that runs itself.`,
    valueProposition: `${name} turns ${opp.title.toLowerCase()} into a one-click workflow. Teams ship in days instead of quarters, with measurable revenue impact from week one.`,
    landing: {
      headline: `The ${opp.category} layer your team has been waiting for`,
      subheadline: opp.description,
      cta: "Start free — no credit card",
      socialProof: `Trusted by ${20 + Math.floor(rand() * 80)} fast-growing teams`,
    },
    features: [
      {
        title: "Autonomous workflows",
        description:
          "Agents handle the repetitive work end-to-end and ask for approval only when it matters.",
        icon: "Workflow",
      },
      {
        title: "Real-time analytics",
        description:
          "Live dashboards turn raw activity into the three numbers your board actually asks about.",
        icon: "LineChart",
      },
      {
        title: "Native integrations",
        description:
          "Connect Stripe, your CRM, and your data warehouse in minutes with first-class APIs.",
        icon: "Plug",
      },
      {
        title: "Enterprise-grade security",
        description:
          "SOC2-ready controls, audit logs, and SSO so procurement says yes the first time.",
        icon: "ShieldCheck",
      },
    ],
    persona: {
      name: ["Jordan Avery", "Priya Mehta", "Marcus Lee", "Sofia Ramos"][
        Math.floor(rand() * 4)
      ],
      role: ["Head of Operations", "Founder & CEO", "VP Finance", "Product Lead"][
        Math.floor(rand() * 4)
      ],
      company: "a 40-person scale-up",
      bio: `Drowning in manual ${opp.category.toLowerCase()} work and tired of stitching together five tools to do one job.`,
      painPoints: [
        "Spends 12+ hours/week on work that should be automated",
        "No single source of truth across tools",
        "Can't forecast revenue with confidence",
      ],
      goals: [
        "Cut operational overhead in half",
        "Launch new revenue lines faster",
        "Look credible to investors and customers",
      ],
    },
    pricing: [
      {
        id: "starter",
        name: "Starter",
        price: monthly,
        interval: "month",
        description: "For founders validating their first workflow.",
        features: [
          "Up to 1,000 actions / mo",
          "Core automation agents",
          "Email support",
          "1 workspace",
        ],
        cta: "Start free",
      },
      {
        id: "growth",
        name: "Growth",
        price: proPrice,
        interval: "month",
        description: "For teams scaling revenue operations.",
        features: [
          "Unlimited actions",
          "All agents + custom workflows",
          "Priority support & onboarding",
          "Advanced analytics",
          "Stripe + CRM integrations",
        ],
        highlighted: true,
        cta: "Start 14-day trial",
      },
      {
        id: "enterprise",
        name: "Enterprise",
        price: 0,
        interval: "month",
        description: "For organizations with security & scale needs.",
        features: [
          "Everything in Growth",
          "SSO, SAML & audit logs",
          "Dedicated success manager",
          "Custom SLAs & data residency",
          "Volume pricing",
        ],
        cta: "Talk to sales",
        custom: true,
      },
    ],
    marketing: {
      tweet: `We just launched ${name} 🚀\n\n${opp.title} used to take a team and a quarter. Now it takes one prompt.\n\n→ ${opp.description.split(".")[0]}.\n\nFirst 100 signups get founder pricing. Link below 👇`,
      productHunt: {
        tagline: `${name} — ${opp.category} that runs itself`,
        body: `Hey hunters! 👋\n\n${name} automates ${opp.title.toLowerCase()} from end to end. We built it because ${opp.category.toLowerCase()} work is still painfully manual.\n\nWhat's inside:\n• Autonomous agents that do the busywork\n• Real-time analytics for the metrics that matter\n• Native Stripe + CRM integrations\n\nWe'd love your feedback — founder pricing for the PH community today only.`,
      },
      email: {
        subject: `Stop doing ${opp.category.toLowerCase()} work by hand`,
        body: `Hi {{firstName}},\n\nMost teams lose 12+ hours a week to manual ${opp.category.toLowerCase()} work. ${name} gives those hours back.\n\nIn 10 minutes you can connect your stack and let our agents take the first pass — you just approve the results.\n\nWant a quick look? Reply "yes" and I'll send a 3-minute demo.\n\n— The ${name} team`,
      },
      ads: [
        {
          platform: "Google Search",
          headline: `${name}: Automate ${opp.category}`,
          body: `Ship ${opp.category.toLowerCase()} workflows in days, not quarters. Free to start. Cancel anytime.`,
        },
        {
          platform: "LinkedIn",
          headline: `Your ops team is doing robot work`,
          body: `${name} automates ${opp.title.toLowerCase()} so your best people focus on growth. Book a demo →`,
        },
      ],
    },
    metrics: {
      marketScore: opp.score,
      revenuePotential: opp.estimatedMrr * 12,
      competition: opp.competition,
      estimatedMrr: opp.estimatedMrr,
      status: "Launch Ready",
      difficulty: opp.difficulty,
    },
    projection,
  };
}
