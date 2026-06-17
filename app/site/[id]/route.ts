import { getCompany } from "@/lib/db";
import { renderLandingHTML } from "@/lib/landing-template";

export const runtime = "nodejs";

// Serves the autonomously generated landing page as a real, live HTML document.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const record = getCompany(id);
  if (!record) {
    return new Response("<h1>Site not found</h1>", {
      status: 404,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
  const html = renderLandingHTML(record.company, { stripeUrl: record.stripeUrl });
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
