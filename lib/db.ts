import fs from "fs";
import path from "path";
import { CompanyRecord } from "./types";

/**
 * A zero-config persistence layer. Writes companies to ./data/companies.json
 * when the filesystem is writable (local dev), and always keeps an in-memory
 * cache so the current session works even on read-only/serverless hosts.
 *
 * Upgrade path: swap these four functions for Postgres / Vercel KV / Upstash
 * by setting DATABASE_URL — the call sites don't change.
 */

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "companies.json");

// Survives module reloads in dev via globalThis.
const g = globalThis as unknown as { __ventureDb?: Map<string, CompanyRecord> };
const mem = g.__ventureDb ?? (g.__ventureDb = new Map<string, CompanyRecord>());

function readFile(): CompanyRecord[] {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8")) as CompanyRecord[];
  } catch {
    return [];
  }
}

function writeFile(records: CompanyRecord[]) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(records, null, 2));
    return true;
  } catch {
    return false; // read-only filesystem; in-memory cache still holds the data
  }
}

function hydrate() {
  if (mem.size === 0) {
    for (const r of readFile()) mem.set(r.id, r);
  }
}

export function saveCompany(record: CompanyRecord) {
  hydrate();
  mem.set(record.id, record);
  writeFile([...mem.values()].sort((a, b) => b.createdAt - a.createdAt));
  return record;
}

export function updateCompany(id: string, patch: Partial<CompanyRecord>) {
  hydrate();
  const existing = mem.get(id) ?? readFile().find((r) => r.id === id);
  if (!existing) return null;
  const next = { ...existing, ...patch };
  return saveCompany(next);
}

export function getCompany(id: string): CompanyRecord | null {
  hydrate();
  return mem.get(id) ?? readFile().find((r) => r.id === id) ?? null;
}

export function listCompanies(): CompanyRecord[] {
  hydrate();
  return [...mem.values()].sort((a, b) => b.createdAt - a.createdAt);
}
