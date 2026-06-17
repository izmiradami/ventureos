import { NextResponse } from "next/server";
import { generateAgentCompany } from "@/lib/agent";
import { saveCompany } from "@/lib/db";
import { CompanyRecord } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { goal } = await req.json();
    const g = typeof goal === "string" && goal.trim() ? goal.trim() : "Find a profitable SaaS business";
    const { company, mode } = await generateAgentCompany(g);
    const id = `co_${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
    const record: CompanyRecord = {
      id,
      goal: g,
      company,
      generationMode: mode,
      createdAt: Date.now(),
    };
    saveCompany(record);
    return NextResponse.json({ id, company, mode });
  } catch {
    return NextResponse.json({ error: "Generation failed." }, { status: 500 });
  }
}
