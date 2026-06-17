import { AgentCompany } from "./types";

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Produces a complete, self-contained HTML landing page for a generated company. */
export function renderLandingHTML(
  company: AgentCompany,
  opts: { stripeUrl?: string } = {}
): string {
  const { name, domain, tagline, landing, pricing } = company;
  const checkout = opts.stripeUrl || "#pricing";

  const tiers = pricing
    .map(
      (t) => `
      <div class="tier${t.highlighted ? " tier--hot" : ""}">
        ${t.highlighted ? '<span class="pill">Most popular</span>' : ""}
        <h3>${esc(t.name)}</h3>
        <div class="price">$${t.price}<span>/mo</span></div>
        <ul>${t.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
        <a class="btn ${t.highlighted ? "btn--grad" : "btn--ghost"}" href="${esc(checkout)}">Get ${esc(t.name)}</a>
      </div>`
    )
    .join("");

  const bullets = landing.bullets
    .map(
      (b) => `<div class="feature"><span class="dot"></span><p>${esc(b)}</p></div>`
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(name)} — ${esc(tagline)}</title>
<meta name="description" content="${esc(company.valueProp)}" />
<style>
  :root{--bg:#07080c;--fg:#e7e9ee;--mut:#8a90a2;--violet:#8b5cf6;--cyan:#22d3ee;--em:#34d399;--line:rgba(255,255,255,.08)}
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:var(--bg);color:var(--fg);font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;line-height:1.5;
    background-image:radial-gradient(50rem 30rem at 80% -10%,rgba(139,92,246,.18),transparent 60%),radial-gradient(40rem 25rem at 0% 0%,rgba(34,211,238,.12),transparent 55%);background-attachment:fixed}
  a{text-decoration:none;color:inherit}
  .wrap{max-width:1040px;margin:0 auto;padding:0 24px}
  header{display:flex;align-items:center;justify-content:space-between;padding:22px 0}
  .brand{font-weight:700;font-size:18px;letter-spacing:-.02em}
  .brand b{background:linear-gradient(120deg,var(--violet),var(--cyan));-webkit-background-clip:text;background-clip:text;color:transparent}
  .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:12px;padding:12px 20px;font-weight:600;font-size:14px;transition:.2s;cursor:pointer}
  .btn--grad{background:linear-gradient(120deg,var(--violet),var(--cyan));color:#fff;box-shadow:0 8px 40px -8px rgba(139,92,246,.5)}
  .btn--grad:hover{filter:brightness(1.1)}
  .btn--ghost{border:1px solid var(--line);color:var(--fg)}
  .btn--ghost:hover{background:rgba(255,255,255,.04)}
  .hero{text-align:center;padding:90px 0 70px}
  .eyebrow{display:inline-block;border:1px solid var(--line);background:rgba(255,255,255,.03);color:var(--mut);
    border-radius:999px;padding:6px 14px;font-size:13px;margin-bottom:22px}
  h1{font-size:clamp(38px,6vw,68px);line-height:1.04;letter-spacing:-.03em;font-weight:700;max-width:14ch;margin:0 auto}
  .sub{color:var(--mut);font-size:19px;max-width:60ch;margin:20px auto 0}
  .cta{display:flex;gap:12px;justify-content:center;margin-top:34px;flex-wrap:wrap}
  section{padding:56px 0}
  .grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));margin-top:28px}
  .feature{display:flex;gap:12px;align-items:flex-start;border:1px solid var(--line);background:rgba(255,255,255,.02);border-radius:16px;padding:20px}
  .dot{width:10px;height:10px;border-radius:50%;background:linear-gradient(120deg,var(--violet),var(--cyan));margin-top:6px;flex:0 0 auto}
  h2{font-size:30px;letter-spacing:-.02em;text-align:center}
  .tiers{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));margin-top:28px}
  .tier{position:relative;border:1px solid var(--line);background:rgba(255,255,255,.02);border-radius:20px;padding:26px;display:flex;flex-direction:column}
  .tier--hot{border-color:rgba(139,92,246,.4);box-shadow:0 8px 50px -16px rgba(139,92,246,.5)}
  .pill{position:absolute;top:-12px;left:26px;background:rgba(139,92,246,.18);color:#c4b5fd;border-radius:999px;padding:4px 12px;font-size:12px;font-weight:600}
  .tier h3{font-size:18px}
  .price{font-size:40px;font-weight:700;letter-spacing:-.02em;margin:10px 0 4px}
  .price span{font-size:15px;color:var(--mut);font-weight:500}
  .tier ul{list-style:none;margin:16px 0 22px;flex:1}
  .tier li{padding:6px 0 6px 24px;position:relative;color:#cfd3dd;font-size:14px}
  .tier li:before{content:"✓";position:absolute;left:0;color:var(--em)}
  footer{border-top:1px solid var(--line);padding:40px 0;color:var(--mut);font-size:13px;text-align:center;margin-top:40px}
  .madeby{display:inline-block;margin-top:6px;opacity:.7;font-size:12px}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <div class="brand"><b>${esc(name)}</b></div>
    <a class="btn btn--ghost" href="${esc(checkout)}">Get started</a>
  </header>

  <div class="hero">
    <span class="eyebrow">${esc(company.category)} · ${esc(domain)}</span>
    <h1>${esc(landing.headline)}</h1>
    <p class="sub">${esc(landing.subheadline)}</p>
    <div class="cta">
      <a class="btn btn--grad" href="${esc(checkout)}">${esc(landing.cta)}</a>
      <a class="btn btn--ghost" href="#pricing">See pricing</a>
    </div>
  </div>

  <section>
    <h2>Why ${esc(name)}</h2>
    <div class="grid">${bullets}</div>
  </section>

  <section id="pricing">
    <h2>Simple, scalable pricing</h2>
    <div class="tiers">${tiers}</div>
  </section>

  <footer>
    © ${new Date().getFullYear()} ${esc(name)} — ${esc(tagline)}
    <span class="madeby">Generated &amp; deployed autonomously by VentureOS</span>
  </footer>
</div>
</body>
</html>`;
}
