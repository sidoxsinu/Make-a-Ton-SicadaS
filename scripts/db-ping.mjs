// scripts/db-ping.mjs
// Verifies round-trip latency and connectivity to live Supabase PostgreSQL.

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

async function pingDatabase() {
  const env = loadEnv();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    console.error("[db:ping] Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not found in environment.");
    process.exit(1);
  }

  const start = performance.now();
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/app_settings?select=key&limit=1`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });

    const duration = (performance.now() - start).toFixed(2);
    if (!res.ok) {
      console.error(`[db:ping] Connection failed: HTTP ${res.status} (${duration}ms)`);
      process.exit(1);
    }

    console.log(`[db:ping] Success: Connected to Supabase PostgreSQL in ${duration}ms (HTTP 200)`);
  } catch (err) {
    console.error(`[db:ping] Connection error: ${err.message}`);
    process.exit(1);
  }
}

pingDatabase();

