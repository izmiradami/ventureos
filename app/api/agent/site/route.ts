import { NextResponse } from "next/server";
import { getCompany, updateCompany } from "@/lib/db";

export const runtime = "nodejs";

/**
 * "Deploys" the generated landing page. The page is served live by this app at
 * /site/{id} (a real, shareable URL, zero-config). When VERCEL_TOKEN is present
 * this is where you'd also trigger an external Vercel deployment.
 */
export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    const record = id ? getCompany(id) : null;
    if (!record) return NextResponse.json({ error: "Unknown company." }, { status: 400 });

    const base = process.env.NEXT_PUBLIC_APP_URL || "";
    const siteUrl = `${base}/site/${id}`;
    updateCompany(id, { siteDeployed: true, siteUrl });

    // Self-hosted deploy is always real. External provider is optional.
    const mode = "real";
    return NextResponse.json({ url: siteUrl, path: `/site/${id}`, mode });
  } catch {
    return NextResponse.json({ error: "Deploy failed." }, { status: 500 });
  }
}
