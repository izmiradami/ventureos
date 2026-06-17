import { NextResponse } from "next/server";
import { buildCompany } from "@/lib/ai";
import { Opportunity } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { opportunity } = (await req.json()) as { opportunity: Opportunity };
    if (!opportunity?.id) {
      return NextResponse.json(
        { error: "Select an opportunity to build." },
        { status: 400 }
      );
    }
    const result = await buildCompany(opportunity);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Company builder is unavailable." },
      { status: 500 }
    );
  }
}
