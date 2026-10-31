// scripts/clean-test-data.mjs
// Safely removes throwaway unit test records, orphaned fixtures, and ephemeral accounts from live Supabase DB.

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

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

async function cleanTestData() {
  const env = loadEnv();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("[clean-test-data] Missing credentials.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("==> Cleaning throwaway test records from live database...");

  // 1. Find throwaway test customers
  const { data: testCustomers, error: custErr } = await supabase
    .from("customers")
    .select("id, email, user_id");

  if (custErr) {
    console.error("[clean-test-data] Error fetching customers:", custErr.message);
    process.exit(1);
  }

  const preserveEmails = new Set([
    "demo.customer@brightloop.com",
    "billing@nexacorp.com",
    "finance@blueskylogistics.in",
    "accounts@zenflowhealth.com",
  ]);

  const toDeleteCusts = (testCustomers || []).filter((c) => {
    if (preserveEmails.has(c.email)) return false;
    const isTestEmail =
      c.email.includes("duplicate_test") ||
      c.email.includes("customer_role") ||
      c.email.includes("staff_disc") ||
      c.email.includes("v2_") ||
      c.email.includes("customerA") ||
      c.email.includes("customerB") ||
      c.email.includes("test_") ||
      c.email.includes("test-") ||
      c.email.includes("perf") ||
      c.email.includes("@example.") ||
      /_\d{10,}/.test(c.email);
    return isTestEmail;
  });

  console.log(`Found ${toDeleteCusts.length} test customers to clean.`);

  const toDeleteCustIds = toDeleteCusts.map((c) => c.id);
  const toDeleteUserIds = toDeleteCusts.map((c) => c.user_id).filter(Boolean);

  if (toDeleteCustIds.length > 0) {
    // Delete payments for invoices of test customers
    const { data: testInvs } = await supabase
      .from("invoices")
      .select("id")
      .in("customer_id", toDeleteCustIds);
    const testInvIds = (testInvs || []).map((i) => i.id);

    if (testInvIds.length > 0) {
      await supabase.from("payments").delete().in("invoice_id", testInvIds);
      await supabase.from("invoice_lines").delete().in("invoice_id", testInvIds);
      await supabase.from("invoices").delete().in("id", testInvIds);
      console.log(`Cleaned ${testInvIds.length} test invoices.`);
    }

    // Delete subscriptions of test customers
    const { data: testSubs } = await supabase
      .from("subscriptions")
      .select("id")
      .in("customer_id", toDeleteCustIds);
    const testSubIds = (testSubs || []).map((s) => s.id);

    if (testSubIds.length > 0) {
      await supabase.from("subscription_lines").delete().in("subscription_id", testSubIds);
      await supabase.from("subscription_status_history").delete().in("subscription_id", testSubIds);
      await supabase.from("subscriptions").delete().in("id", testSubIds);
      console.log(`Cleaned ${testSubIds.length} test subscriptions.`);
    }

    // Delete customers
    await supabase.from("customers").delete().in("id", toDeleteCustIds);
    console.log(`Cleaned ${toDeleteCustIds.length} test customers.`);
  }

  // 2. Clean test discounts
  const { data: testDiscs } = await supabase
    .from("discounts")
    .select("id, name");

  const toDeleteDiscIds = (testDiscs || [])
    .filter((d) => /\d{10,}/.test(d.name) || d.name.includes("Vector") || d.name.includes("Unauthorized") || d.name.includes("Staff Discount"))
    .map((d) => d.id);

  if (toDeleteDiscIds.length > 0) {
    await supabase.from("discount_products").delete().in("discount_id", toDeleteDiscIds);
    await supabase.from("discount_subscriptions").delete().in("discount_id", toDeleteDiscIds);
    await supabase.from("discounts").delete().in("id", toDeleteDiscIds);
    console.log(`Cleaned ${toDeleteDiscIds.length} test discounts.`);
  }

  // 3. Clean test plans and products created with timestamps
  const { data: allPlans } = await supabase.from("plans").select("id, name");
  const toDeletePlanIds = (allPlans || [])
    .filter((p) => /\d{10,}/.test(p.name) || p.name.includes("Perf") || p.name.includes("Monthly Plan V2"))
    .map((p) => p.id);

  if (toDeletePlanIds.length > 0) {
    await supabase.from("plans").delete().in("id", toDeletePlanIds);
    console.log(`Cleaned ${toDeletePlanIds.length} test plans.`);
  }

  const { data: allProds } = await supabase.from("products").select("id, name");
  const toDeleteProdIds = (allProds || [])
    .filter((p) => /\d{10,}/.test(p.name))
    .map((p) => p.id);

  if (toDeleteProdIds.length > 0) {
    await supabase.from("product_variants").delete().in("product_id", toDeleteProdIds);
    await supabase.from("products").delete().in("id", toDeleteProdIds);
    console.log(`Cleaned ${toDeleteProdIds.length} test products.`);
  }

  // 4. Clean test taxes created with timestamps
  const { data: allTaxes } = await supabase.from("taxes").select("id, name");
  const toDeleteTaxIds = (allTaxes || [])
    .filter((t) => /\d{10,}/.test(t.name))
    .map((t) => t.id);

  if (toDeleteTaxIds.length > 0) {
    await supabase.from("taxes").delete().in("id", toDeleteTaxIds);
    console.log(`Cleaned ${toDeleteTaxIds.length} test taxes.`);
  }

  // 5. Clean test auth users
  const { data: userList } = await supabase.auth.admin.listUsers();
  const preserveAuthEmails = new Set([
    "sinan@brightloop.local",
    "staff@brightloop.local",
    "demo.customer@brightloop.com",
  ]);

  let deletedUsers = 0;
  for (const u of userList?.users || []) {
    if (!preserveAuthEmails.has(u.email)) {
      if (
        u.email.includes("duplicate_test") ||
        u.email.includes("customer_role") ||
        u.email.includes("staff_disc") ||
        u.email.includes("v2_") ||
        u.email.includes("customerA") ||
        u.email.includes("customerB") ||
        u.email.includes("test-reset") ||
        u.email.includes("@example.") ||
        /_\d{10,}/.test(u.email)
      ) {
        await supabase.from("profiles").delete().eq("id", u.id);
        await supabase.auth.admin.deleteUser(u.id);
        deletedUsers++;
      }
    }
  }
  console.log(`Cleaned ${deletedUsers} test auth users.`);

  console.log("==> Live database cleanup completed successfully!");
}

cleanTestData().catch((err) => {
  console.error("[clean-test-data] Error:", err.message);
  process.exit(1);
});

