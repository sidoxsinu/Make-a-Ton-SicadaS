import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

export function getEnvKey(key: string, fallback: string = ""): string {
  if (process.env[key]) return process.env[key]!;
  try {
    const envFile = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envFile)) {
      const text = fs.readFileSync(envFile, "utf8");
      const match = text.match(new RegExp(`^${key}=(.*)$`, "m"));
      if (match && match[1]) {
        const val = match[1].trim().replace(/^["']|["']$/g, "");
        process.env[key] = val;
        return val;
      }
    }
  } catch {
    // fallback
  }
  return fallback;
}

export const SUPABASE_URL = getEnvKey(
  "NEXT_PUBLIC_SUPABASE_URL",
  "https://sjeaqqpxmafsjpzgkmvr.supabase.co"
);

export const ANON_KEY = getEnvKey(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "sb_publishable_gLXXbbK2bikWcv6psj00ng_KeBFkHmm"
);

export const SERVICE_KEY = getEnvKey("SUPABASE_SERVICE_ROLE_KEY", "");

export function getAdminClient() {
  return createClient(SUPABASE_URL, SERVICE_KEY);
}

export function getAnonClient() {
  return createClient(SUPABASE_URL, ANON_KEY);
}
