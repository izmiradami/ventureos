import { NextResponse } from "next/server";
import { discoverOpportunities } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { goal } = await req.json();
    if (typeof goal !== "string" || goal.trim().length < 2) {
      return NextResponse.json(
        { error: "Enter a goal to discover opportunities." },
        { status: 400 }
      );
    }
    const result = await discoverOpportunities(goal);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Discovery engine is unavailable." },
      { status: 500 }
    );
  }
}
