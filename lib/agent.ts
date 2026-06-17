import { extractJson, hasLiveProvider, llm } from "./ai";
import { generateCompany, generateOpportunities } from "./mock-data";
import { ActionMode, AgentCompany, AgentTier } from "./types";

function mockAgentCompany(goal: string): AgentCompany {
  const opp = generateOpportunities(goal)[0];
  const c = generateCompany(opp);
  const pricing: AgentTier[] = c.pricing.slice(0, 3).map((p) => ({
    name: p.name,
    price: p.custom ? Math.max(499, p.price || 499) : p.price,
    features: p.features,
    highlighted: p.highlighted,
  }));
  return {
    idea: opp.description,
    category: opp.category,
    name: c.name,
    domain: c.domain,
    tagline: c.tagline,
    valueProp: c.valueProposition,
    pricing,
    landing: {
      headline: c.landing.headline,
      subheadline: c.landing.subheadline,
      cta: c.landing.cta,
      bullets: c.features.map((f) => `${f.title} — ${f.description}`),
    },
  };
}

export async function generateAgentCompany(
  goal: string
): Promise<{ company: AgentCompany; mode: ActionMode }> {
  if (!hasLiveProvider()) {
    return { company: mockAgentCompany(goal), mode: "simulated" };
  }
  try {
    const system =
      "You are VentureOS, an autonomous founder. You return ONLY valid minified JSON, no prose, no markdown.";
    const prompt = `Goal: "${goal}".
Invent ONE real, specific, fundable SaaS company and return JSON exactly matching:
{"idea":string,"category":string,"name":string,"domain":string,"tagline":string,"valueProp":string,"pricing":[{"name":string,"price":number,"features":string[],"highlighted":boolean}],"landing":{"headline":string,"subheadline":string,"cta":string,"bullets":string[]}}
Rules: 3 pricing tiers with realistic monthly USD prices (one highlighted:true). 4-6 landing bullets. domain ends in .com. Be concrete and specific to the goal. Return ONLY the JSON.`;
    const raw = await llm(system, prompt);
    const company = extractJson<AgentCompany>(raw);
    if (!company?.name || !Array.isArray(company.pricing) || !company.landing)
      throw new Error("malformed");
    // Defensive defaults
    company.domain ||= company.name.toLowerCase().replace(/\s+/g, "") + ".com";
    company.pricing = company.pricing.slice(0, 3).map((t) => ({
      name: String(t.name),
      price: Number(t.price) || 0,
      features: Array.isArray(t.features) ? t.features.slice(0, 6) : [],
      highlighted: !!t.highlighted,
    }));
    return { company, mode: "real" };
  } catch {
    return { company: mockAgentCompany(goal), mode: "simulated" };
  }
}

export async function createStripePaymentLink(
  company: AgentCompany
): Promise<{ url: string; mode: ActionMode }> {
  const secret = process.env.STRIPE_SECRET_KEY;
  const tier =
    company.pricing.find((t) => t.highlighted && t.price > 0) ||
    company.pricing.find((t) => t.price > 0) ||
    company.pricing[0];

  if (!secret) {
    const slug = company.name.toLowerCase().replace(/[^a-z0-9]+/g, "");
    return {
      url: `https://buy.stripe.com/test_DEMO_${slug}`,
      mode: "simulated",
    };
  }

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(secret);
  const product = await stripe.products.create({
    name: `${company.name} — ${tier?.name ?? "Plan"}`,
    description: company.tagline,
  });
  const price = await stripe.prices.create({
    product: product.id,
    currency: "usd",
    unit_amount: Math.max(100, Math.round((tier?.price ?? 49) * 100)),
    recurring: { interval: "month" },
  });
  const link = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
  });
  return { url: link.url, mode: "real" };
}
