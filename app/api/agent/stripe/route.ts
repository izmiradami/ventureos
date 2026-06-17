import { NextResponse } from "next/server";
import { createStripePaymentLink } from "@/lib/agent";
import { getCompany, updateCompany } from "@/lib/db";
import { AgentCompany } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { id, company } = (await req.json()) as {
      id?: string;
      company?: AgentCompany;
    };
    const co = (id ? getCompany(id)?.company : null) ?? company;
    if (!co) return NextResponse.json({ error: "No company." }, { status: 400 });
    const { url, mode } = await createStripePaymentLink(co);
    if (id) updateCompany(id, { stripeUrl: url, stripeMode: mode });
    return NextResponse.json({ url, mode });
  } catch (err) {
    return NextResponse.json(
      { error: "Stripe link failed.", detail: String(err) },
      { status: 500 }
    );
  }
}
