import { generateCompany, generateOpportunities } from "./mock-data";
import { Company, Opportunity } from "./types";

const PROVIDER = (process.env.AI_PROVIDER || "mock").toLowerCase();

export function hasLiveProvider() {
  if (PROVIDER === "anthropic") return !!process.env.ANTHROPIC_API_KEY;
  if (PROVIDER === "openai") return !!process.env.OPENAI_API_KEY;
  return false;
}

/** Pull the first JSON object/array out of a model response. */
export function extractJson<T>(text: string): T {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = Math.min(
    ...[cleaned.indexOf("{"), cleaned.indexOf("[")].filter((n) => n >= 0)
  );
  const end = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
  return JSON.parse(cleaned.slice(start, end + 1)) as T;
}

async function callAnthropic(system: string, prompt: string): Promise<string> {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const res = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    system,
    messages: [{ role: "user", content: prompt }],
  });
  const block = res.content.find((b) => b.type === "text");
  return block && "text" in block ? block.text : "";
}

async function callOpenAI(system: string, prompt: string): Promise<string> {
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
  });
  return res.choices[0]?.message?.content ?? "";
}

export async function llm(system: string, prompt: string): Promise<string> {
  if (PROVIDER === "anthropic") return callAnthropic(system, prompt);
  if (PROVIDER === "openai") return callOpenAI(system, prompt);
  return "";
}

export async function discoverOpportunities(
  goal: string
): Promise<{ opportunities: Opportunity[]; source: "ai" | "mock" }> {
  if (!hasLiveProvider()) {
    return { opportunities: generateOpportunities(goal), source: "mock" };
  }
  try {
    const system =
      "You are VentureOS, an autonomous venture analyst. Return ONLY valid JSON.";
    const prompt = `Goal: "${goal}". Return a JSON array of 4 startup opportunities. Each item must match this TypeScript type exactly:
{ "id": string, "title": string, "category": string, "description": string, "score": number (0-100), "marketSize": number (USD TAM), "difficulty": number (0-100), "competition": "Low"|"Medium"|"High", "estimatedMrr": number (USD), "growthRate": number (% YoY), "tags": string[] }
Make numbers realistic. Return ONLY the JSON array.`;
    const raw = await llm(system, prompt);
    const opportunities = extractJson<Opportunity[]>(raw);
    if (!Array.isArray(opportunities) || opportunities.length === 0)
      throw new Error("empty");
    return { opportunities, source: "ai" };
  } catch {
    return { opportunities: generateOpportunities(goal), source: "mock" };
  }
}

export async function buildCompany(
  opp: Opportunity
): Promise<{ company: Company; source: "ai" | "mock" }> {
  // The company shape is rich and nested; we always scaffold deterministically
  // from mock-data so the UI is guaranteed valid, then (optionally) let the
  // model rewrite the narrative copy when a key is present.
  const company = generateCompany(opp);
  if (!hasLiveProvider()) return { company, source: "mock" };

  try {
    const system =
      "You are VentureOS, a founding team in a box. Return ONLY valid JSON.";
    const prompt = `Improve the marketing & positioning copy for this startup. Opportunity: ${JSON.stringify(
      opp
    )}. Return ONLY a JSON object with keys: name (string), tagline (string), valueProposition (string), landingHeadline (string), landingSubheadline (string), tweet (string), productHuntTagline (string), productHuntBody (string), emailSubject (string), emailBody (string). Keep it sharp and specific.`;
    const raw = await llm(system, prompt);
    const c = extractJson<Record<string, string>>(raw);
    if (c.name) company.name = c.name;
    if (c.tagline) company.tagline = c.tagline;
    if (c.valueProposition) company.valueProposition = c.valueProposition;
    if (c.landingHeadline) company.landing.headline = c.landingHeadline;
    if (c.landingSubheadline) company.landing.subheadline = c.landingSubheadline;
    if (c.tweet) company.marketing.tweet = c.tweet;
    if (c.productHuntTagline)
      company.marketing.productHunt.tagline = c.productHuntTagline;
    if (c.productHuntBody) company.marketing.productHunt.body = c.productHuntBody;
    if (c.emailSubject) company.marketing.email.subject = c.emailSubject;
    if (c.emailBody) company.marketing.email.body = c.emailBody;
    return { company, source: "ai" };
  } catch {
    return { company, source: "mock" };
  }
}
