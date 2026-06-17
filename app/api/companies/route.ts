import { NextResponse } from "next/server";
import { listCompanies } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const records = listCompanies();
  return NextResponse.json({
    count: records.length,
    companies: records.slice(0, 25).map((r) => ({
      id: r.id,
      name: r.company.name,
      goal: r.goal,
      generationMode: r.generationMode,
      stripeUrl: r.stripeUrl,
      siteUrl: r.siteUrl,
      createdAt: r.createdAt,
    })),
  });
}
