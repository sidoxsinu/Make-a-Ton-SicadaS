// scripts/db-benchmark.mjs
// Measures PostgreSQL query execution times against the performance budget (AC-RPT-3)

import fs from "fs";
import path from "path";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, "utf8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      env[key] = val;
    }
  }
  return env;
}

async function benchmarkQuery(name, targetMs, url, headers) {
  const times = [];
  const iterations = 5;

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const res = await fetch(url, { headers });
    const duration = performance.now() - start;
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }
    await res.json();
    times.push(duration);
  }

  times.sort((a, b) => a - b);
  const p95 = times[Math.floor(times.length * 0.95)];
  const avg = (times.reduce((sum, t) => sum + t, 0) / times.length).toFixed(1);
  const status = p95 <= targetMs ? "PASS" : "WARN";

  console.log(`| ${name.padEnd(35)} | Target: < ${targetMs}ms | p95: ${p95.toFixed(1)}ms (avg: ${avg}ms) | ${status} |`);
  return { name, p95, avg, status };
}

async function runBenchmarks() {
  const env = loadEnv();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("[benchmark] Missing Supabase credentials.");
    process.exit(1);
  }

  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };

  console.log("-----------------------------------------------------------------------------------------");
  console.log("PostgreSQL Query & API Benchmark (AC-RPT-3 Budget Verification)");
  console.log("-----------------------------------------------------------------------------------------");

  await benchmarkQuery(
    "Active Subscriptions (MRR Index)",
    150,
    `${supabaseUrl}/rest/v1/subscriptions?status=eq.active&select=id,status,cycles_billed,next_invoice_date&limit=50`,
    headers
  );

  await benchmarkQuery(
    "Confirmed Invoices (Due Index)",
    150,
    `${supabaseUrl}/rest/v1/invoices?status=eq.confirmed&select=id,number,status,due_date,total,amount_paid&limit=50`,
    headers
  );

  const today = new Date().toISOString().split("T")[0];
  await benchmarkQuery(
    "Overdue Invoices Query",
    150,
    `${supabaseUrl}/rest/v1/invoices?status=eq.confirmed&due_date=lt.${today}&select=id,number,due_date,total,amount_paid&limit=50`,
    headers
  );

  await benchmarkQuery(
    "Payments Timeline (Date Index)",
    150,
    `${supabaseUrl}/rest/v1/payments?select=id,paid_on,amount,method&order=paid_on.desc&limit=50`,
    headers
  );

  await benchmarkQuery(
    "Customer Trigram Search (GIN)",
    150,
    `${supabaseUrl}/rest/v1/customers?name=ilike.*Customer*&select=id,name,email,company&limit=50`,
    headers
  );

  await benchmarkQuery(
    "Customer Portal Subscriptions",
    100,
    `${supabaseUrl}/rest/v1/subscriptions?select=id,number,status,start_date,expiry_date&limit=20`,
    headers
  );

  console.log("-----------------------------------------------------------------------------------------");
}

runBenchmarks().catch((err) => {
  console.error("[benchmark] Error:", err.message);
  process.exit(1);
});
