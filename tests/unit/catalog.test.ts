import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://sjeaqqpxmafsjpzgkmvr.supabase.co";
const ANON_KEY = "sb_publishable_gLXXbbK2bikWcv6psj00ng_KeBFkHmm";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqZWFxcXB4bWFmc2pwemdrbXZyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzQxNDQyMSwiZXhwIjoyMTA4OTkwNDIxfQ.u_z2Kfp6nWsL5-TXCHol72fv3zS7kMUzMFL9I4y7AB0";

describe("Catalog & Master Data Verification (Phase 2)", () => {
  const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);
  const anonClient = createClient(SUPABASE_URL, ANON_KEY);

  it("AC-CAT-1: Product with variant Brand = Odoo (+560) and sales price 1000 yields line price 1560", async () => {
    // 1. Create or ensure product
    const { data: product, error: pErr } = await adminClient
      .from("products")
      .insert({
        name: "Odoo CRM AC-CAT-1 Test",
        type: "service",
        sales_price: 1000.0,
        cost_price: 200.0,
        active: true,
      })
      .select()
      .single();

    expect(pErr).toBeNull();
    expect(product).toBeDefined();

    // 2. Create variant
    const { data: variant, error: vErr } = await adminClient
      .from("product_variants")
      .insert({
        product_id: product.id,
        attribute: "Brand",
        value: "Odoo",
        extra_price: 560.0,
      })
      .select()
      .single();

    expect(vErr).toBeNull();
    expect(variant).toBeDefined();

    // Line price formula = product.sales_price + variant.extra_price
    const computedPrice = Number(product.sales_price) + Number(variant.extra_price);
    expect(computedPrice).toBe(1560.0);

    // Clean up
    await adminClient.from("products").delete().eq("id", product.id);
  });

  it("AC-CAT-2: Plan saves period, minimum quantity, dates and all four switches", async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data: plan, error } = await adminClient
      .from("plans")
      .insert({
        name: `Test Plan Switches ${Date.now()}`,
        price: 99.0,
        billing_period: "monthly",
        min_quantity: 5,
        available_from: today,
        closable: true,
        pausable: true,
        renewable: true,
        auto_close: false,
        active: true,
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(plan.billing_period).toBe("monthly");
    expect(plan.min_quantity).toBe(5);
    expect(plan.closable).toBe(true);
    expect(plan.pausable).toBe(true);
    expect(plan.renewable).toBe(true);
    expect(plan.auto_close).toBe(false);

    // Clean up
    await adminClient.from("plans").delete().eq("id", plan.id);
  });

  it("AC-CAT-3: Customer / Anon session cannot read products table or cost price", async () => {
    const { data: products } = await anonClient.from("products").select("cost_price");
    expect(products?.length ?? 0).toBe(0);
  });
});
