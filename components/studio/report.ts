"use client";

import { AgentCompany, ActionMode } from "@/lib/types";

export interface ReportData {
  company: AgentCompany;
  companyId: string | null;
  generationMode: ActionMode | null;
  stripeUrl: string | null;
  stripeMode: ActionMode | null;
  siteUrl: string | null;
  elapsed: number;
  actionsCompleted: number;
  metrics: { mrr: number; arr: number; customers: number; spend: number; earned: number };
  origin: string;
}

const V = [124, 92, 255]; // violet
const C = [34, 211, 238]; // cyan
const MUT = [138, 144, 162];
const FG = [232, 233, 238];

export async function downloadReport(d: ReportData) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 48;
  let y = 0;

  // Header band
  doc.setFillColor(7, 8, 12);
  doc.rect(0, 0, W, 120, "F");
  doc.setFillColor(V[0], V[1], V[2]);
  doc.rect(0, 118, W, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("VentureOS", M, 56);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(C[0], C[1], C[2]);
  doc.text("Autonomous Venture Report", M, 76);
  doc.setTextColor(MUT[0], MUT[1], MUT[2]);
  doc.setFontSize(9);
  doc.text("Built with Hermes + NVIDIA + Stripe", M, 94);
  doc.text(new Date().toLocaleString(), W - M, 56, { align: "right" });

  y = 156;

  // Company title
  doc.setTextColor(FG[0], FG[1], FG[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text(d.company.name || "Company", M, y);
  y += 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(MUT[0], MUT[1], MUT[2]);
  doc.text(`${d.company.category}  ·  ${d.company.domain}`, M, y);
  y += 28;

  const label = (t: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(V[0], V[1], V[2]);
    doc.text(t.toUpperCase(), M, y);
    y += 16;
  };
  const para = (t: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(FG[0], FG[1], FG[2]);
    const lines = doc.splitTextToSize(t, W - M * 2);
    doc.text(lines, M, y);
    y += lines.length * 15 + 10;
  };
  const kv = (k: string, v: string, mode?: ActionMode | null) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(MUT[0], MUT[1], MUT[2]);
    doc.text(k, M, y);
    doc.setTextColor(FG[0], FG[1], FG[2]);
    const vLines = doc.splitTextToSize(v, W - M * 2 - 150);
    doc.text(vLines, M + 150, y);
    if (mode) {
      doc.setTextColor(mode === "real" ? 52 : 245, mode === "real" ? 211 : 158, mode === "real" ? 153 : 11);
      doc.setFontSize(8);
      doc.text(mode === "real" ? "REAL" : "SIMULATED", W - M, y, { align: "right" });
    }
    y += Math.max(vLines.length * 14, 18);
  };

  label("Idea");
  para(d.company.idea);

  label("Value proposition");
  para(d.company.valueProp);

  label("Status & launch");
  kv("Business status", "Operational");
  kv("Time to launch", `${d.elapsed.toFixed(1)}s`);
  kv("Agent actions completed", String(d.actionsCompleted));
  kv("Company record", d.companyId || "—", "real");
  y += 8;

  label("Assets");
  kv("Landing page URL", d.siteUrl ? `${d.origin}${d.siteUrl}` : "—", "real");
  kv("Stripe checkout URL", d.stripeUrl || "—", d.stripeMode);
  y += 8;

  label("Pricing");
  d.company.pricing.forEach((t) => {
    kv(t.name, `$${t.price}/mo — ${t.features.slice(0, 3).join(", ")}`, d.generationMode);
  });
  y += 8;

  label("Projected traction (simulated)");
  kv("MRR", `$${d.metrics.mrr.toLocaleString()}`, "simulated");
  kv("ARR", `$${d.metrics.arr.toLocaleString()}`, "simulated");
  kv("Customers", String(d.metrics.customers), "simulated");
  kv("Spent / earned", `$${d.metrics.spend} / $${d.metrics.earned}`, "simulated");

  // Footer
  doc.setDrawColor(40, 42, 54);
  doc.line(M, 800, W - M, 800);
  doc.setFontSize(8);
  doc.setTextColor(MUT[0], MUT[1], MUT[2]);
  doc.text("Generated autonomously by VentureOS — Real actions verified; growth metrics simulated.", M, 815);

  const safe = (d.company.name || "company").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  doc.save(`ventureos-${safe}-report.pdf`);
}
