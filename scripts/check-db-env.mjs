// scripts/check-db-env.mjs
// Verifies presence and format of required database environment variables.

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

function checkEnvironment() {
  const env = loadEnv();
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];

  const missing = [];
  for (const key of required) {
    const val = process.env[key] || env[key];
    if (!val || val.includes("<your-")) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error(`[check-db-env] Missing or unconfigured variables: ${missing.join(", ")}`);
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url.startsWith("https://") || !url.includes(".supabase.co")) {
    console.error(`[check-db-env] Invalid NEXT_PUBLIC_SUPABASE_URL format: ${url}`);
    process.exit(1);
  }

  console.log("[check-db-env] Environment validation passed: All Supabase keys configured.");
}

checkEnvironment();

