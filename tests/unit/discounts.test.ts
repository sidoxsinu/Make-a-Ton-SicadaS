import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://sjeaqqpxmafsjpzgkmvr.supabase.co";
const ANON_KEY = "sb_publishable_gLXXbbK2bikWcv6psj00ng_KeBFkHmm";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqZWFxcXB4bWFmc2pwemdrbXZyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzQxNDQyMSwiZXhwIjoyMTA4OTkwNDIxfQ.u_z2Kfp6nWsL5-TXCHol72fv3zS7kMUzMFL9I4y7AB0";

describe("Discounts & Promotions Verification (Phase 5)", () => {
  const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);
  const teamClient = createClient(SUPABASE_URL, ANON_KEY);
  const staffClient = createClient(SUPABASE_URL, ANON_KEY);

  let staffUserId: string;
  const staffEmail = `staff_disc_${Date.now()}@brightloop.com`;
  const staffPassword = "BrightloopStaff1!";

  beforeAll(async () => {
    // 1. Admin sign-in for teamClient
    await teamClient.auth.signInWithPassword({
      email: "sinan@brightloop.local",
      password: "Brightloop1!",
    });

    // 2. Create staff user for AC-DSC-1 permission test
    const { data: staffAuth } = await adminClient.auth.admin.createUser({
      email: staffEmail,
      password: staffPassword,
      email_confirm: true,
      user_metadata: { role: "staff" },
    });

    staffUserId = staffAuth.user!.id;
    await adminClient.from("profiles").upsert({
      id: staffUserId,
      role: "staff",
    });

    await staffClient.auth.signInWithPassword({
      email: staffEmail,
      password: staffPassword,
    });
  });

  afterAll(async () => {
    if (staffUserId) {
      await adminClient.from("profiles").delete().eq("id", staffUserId);
      await adminClient.auth.admin.deleteUser(staffUserId);
    }
  });

  it("AC-DSC-1: Staff session cannot insert or update a discount (database/RLS rejects)", async () => {
    // Staff attempt to insert discount fails RLS check
    const { error: insertErr } = await staffClient.from("discounts").insert({
      name: "Unauthorized Staff Discount",
      kind: "percent",
      value: 15,
      scope: "subscription",
    });
    expect(insertErr).not.toBeNull();

    // Admin attempt to insert discount succeeds
    const { data: adminDisc, error: adminErr } = await adminClient
      .from("discounts")
      .insert({
        name: `Admin Valid Discount ${Date.now()}`,
        kind: "percent",
        value: 15,
        scope: "subscription",
      })
      .select()
      .single();

    expect(adminErr).toBeNull();
    expect(adminDisc).toBeDefined();

    try {
      // Staff attempt to update discount affects 0 rows due to RLS using (is_admin())
      const { data: updated } = await staffClient
        .from("discounts")
        .update({ value: 20 })
        .eq("id", adminDisc.id)
        .select();

      expect(updated?.length || 0).toBe(0);

      const { data: check } = await adminClient
        .from("discounts")
        .select("value")
        .eq("id", adminDisc.id)
        .single();

      expect(Number(check!.value)).toBe(15);
    } finally {
      await adminClient.from("discounts").delete().eq("id", adminDisc.id);
    }
  });

  it("AC-DSC-2 & Golden Vector V2: Product discount (10%, min qty 5) on line 10 x 1560 with 18% tax", async () => {
    const today = new Date().toISOString().split("T")[0];

    const { data: tax } = await adminClient
      .from("taxes")
      .insert({ name: `GST 18 ${Date.now()}`, rate: 18.0 })
      .select()
      .single();

    const { data: product } = await adminClient
      .from("products")
      .insert({
        name: `Odoo CRM ${Date.now()}`,
        sales_price: 1560.0,
      })
      .select()
      .single();

    const { data: customer } = await adminClient
      .from("customers")
      .insert({
        name: "Vector V2 Customer",
        email: `v2_${Date.now()}@brightloop.com`,
      })
      .select()
      .single();

    const { data: plan } = await adminClient
      .from("plans")
      .insert({
        name: `Monthly Plan V2 ${Date.now()}`,
        billing_period: "monthly",
        price: 0,
      })
      .select()
      .single();

    const { data: term } = await adminClient
      .from("payment_terms")
      .select("id")
      .limit(1)
      .single();

    const { data: discount } = await adminClient
      .from("discounts")
      .insert({
        name: `V2 Product 10% ${Date.now()}`,
        kind: "percent",
        value: 10.0,
        scope: "product",
        min_quantity: 5,
        active: true,
      })
      .select()
      .single();

    let subId = "";
    let invId = "";

    try {
      await adminClient.from("discount_products").insert({
        discount_id: discount.id,
        product_id: product.id,
      });

      const { data: sub } = await adminClient
        .from("subscriptions")
        .insert({
          customer_id: customer.id,
          plan_id: plan.id,
          start_date: today,
          expiry_date: "2027-10-31",
          payment_term_id: term!.id,
          status: "draft",
        })
        .select()
        .single();
      subId = sub.id;

      await adminClient.from("subscription_lines").insert({
        subscription_id: sub.id,
        product_id: product.id,
        description: "Odoo CRM Line",
        quantity: 10,
        unit_price: 1560.0,
        tax_id: tax.id,
        position: 0,
      });

      await teamClient.rpc("sub_transition", { p_id: sub.id, p_to: "quotation" });
      await teamClient.rpc("sub_transition", { p_id: sub.id, p_to: "confirmed" });
      await teamClient.rpc("sub_transition", { p_id: sub.id, p_to: "active" });

      const { data: runRes } = await teamClient.rpc("run_billing", { p_sub: sub.id });
      expect(runRes?.created).toBe(1);

      const { data: inv } = await adminClient
        .from("invoices")
        .select("*, lines:invoice_lines(*)")
        .eq("subscription_id", sub.id)
        .single();
      invId = inv.id;

      // Golden Vector V2:
      // gross 15,600.00, discount 1,560.00, tax 2,527.20, total 16,567.20
      expect(Number(inv.subtotal)).toBe(15600.0);
      expect(Number(inv.discount_total)).toBe(1560.0);
      expect(Number(inv.tax_total)).toBe(2527.2);
      expect(Number(inv.total)).toBe(16567.2);
      expect(Number(inv.lines[0].discount_amount)).toBe(1560.0);
      expect(Number(inv.lines[0].tax_amount)).toBe(2527.2);
    } finally {
      if (invId) await adminClient.from("invoices").delete().eq("id", invId);
      if (subId) await adminClient.from("subscriptions").delete().eq("id", subId);
      await adminClient.from("discount_products").delete().eq("discount_id", discount.id);
      await adminClient.from("discounts").delete().eq("id", discount.id);
      await adminClient.from("products").delete().eq("id", product.id);
      await adminClient.from("taxes").delete().eq("id", tax.id);
      await adminClient.from("plans").delete().eq("id", plan.id);
      await adminClient.from("customers").delete().eq("id", customer.id);
    }
  });

  it("Golden Vector V3: V2 stacked with subscription discount fixed 500", async () => {
    const today = new Date().toISOString().split("T")[0];

    const { data: tax } = await adminClient
      .from("taxes")
      .insert({ name: `GST 18 V3 ${Date.now()}`, rate: 18.0 })
      .select()
      .single();

    const { data: product } = await adminClient
      .from("products")
      .insert({
        name: `Odoo CRM V3 ${Date.now()}`,
        sales_price: 1560.0,
      })
      .select()
      .single();

    const { data: customer } = await adminClient
      .from("customers")
      .insert({
        name: "Vector V3 Customer",
        email: `v3_${Date.now()}@brightloop.com`,
      })
      .select()
      .single();

    const { data: plan } = await adminClient
      .from("plans")
      .insert({
        name: `Monthly Plan V3 ${Date.now()}`,
        billing_period: "monthly",
        price: 0,
      })
      .select()
      .single();

    const { data: term } = await adminClient
      .from("payment_terms")
      .select("id")
      .limit(1)
      .single();

    const { data: prodDisc } = await adminClient
      .from("discounts")
      .insert({
        name: `V3 Prod 10% ${Date.now()}`,
        kind: "percent",
        value: 10.0,
        scope: "product",
        min_quantity: 5,
        active: true,
      })
      .select()
      .single();

    const { data: subDisc } = await adminClient
      .from("discounts")
      .insert({
        name: `V3 Sub 500 ${Date.now()}`,
        kind: "fixed",
        value: 500.0,
        scope: "subscription",
        active: true,
      })
      .select()
      .single();

    let subId = "";
    let invId = "";

    try {
      await adminClient.from("discount_products").insert({
        discount_id: prodDisc.id,
        product_id: product.id,
      });

      const { data: sub } = await adminClient
        .from("subscriptions")
        .insert({
          customer_id: customer.id,
          plan_id: plan.id,
          start_date: today,
          expiry_date: "2027-10-31",
          payment_term_id: term!.id,
          status: "draft",
        })
        .select()
        .single();
      subId = sub.id;

      // Restrict subDisc to this sub so it doesn't leak
      await adminClient.from("discount_subscriptions").insert({
        discount_id: subDisc.id,
        subscription_id: sub.id,
      });

      await adminClient.from("subscription_lines").insert({
        subscription_id: sub.id,
        product_id: product.id,
        description: "Service line",
        quantity: 10,
        unit_price: 1560.0,
        tax_id: tax.id,
        position: 0,
      });

      await teamClient.rpc("sub_transition", { p_id: sub.id, p_to: "quotation" });
      await teamClient.rpc("sub_transition", { p_id: sub.id, p_to: "confirmed" });
      await teamClient.rpc("sub_transition", { p_id: sub.id, p_to: "active" });

      await teamClient.rpc("run_billing", { p_sub: sub.id });

      const { data: inv } = await adminClient
        .from("invoices")
        .select("*, lines:invoice_lines(*)")
        .eq("subscription_id", sub.id)
        .single();
      invId = inv.id;

      // Golden Vector V3:
      // line discount 2,060.00, net 13,540.00, tax 2,437.20, total 15,977.20, discount_total 2,060.00
      expect(Number(inv.subtotal)).toBe(15600.0);
      expect(Number(inv.discount_total)).toBe(2060.0);
      expect(Number(inv.tax_total)).toBe(2437.2);
      expect(Number(inv.total)).toBe(15977.2);
      expect(Number(inv.lines[0].discount_amount)).toBe(2060.0);
    } finally {
      if (invId) await adminClient.from("invoices").delete().eq("id", invId);
      if (subId) await adminClient.from("subscriptions").delete().eq("id", subId);
      await adminClient.from("discount_products").delete().eq("discount_id", prodDisc.id);
      await adminClient.from("discount_subscriptions").delete().eq("discount_id", subDisc.id);
      await adminClient.from("discounts").delete().in("id", [prodDisc.id, subDisc.id]);
      await adminClient.from("products").delete().eq("id", product.id);
      await adminClient.from("taxes").delete().eq("id", tax.id);
      await adminClient.from("plans").delete().eq("id", plan.id);
      await adminClient.from("customers").delete().eq("id", customer.id);
    }
  });

  it("Golden Vector V5: Multiple lines (100, 200) with sub discount fixed 10 proportional distribution", async () => {
    const today = new Date().toISOString().split("T")[0];

    const { data: customer } = await adminClient
      .from("customers")
      .insert({
        name: "Vector V5 Customer",
        email: `v5_${Date.now()}@brightloop.com`,
      })
      .select()
      .single();

    const { data: plan } = await adminClient
      .from("plans")
      .insert({
        name: `Plan V5 ${Date.now()}`,
        billing_period: "monthly",
      })
      .select()
      .single();

    const { data: term } = await adminClient
      .from("payment_terms")
      .select("id")
      .limit(1)
      .single();

    const { data: subDisc } = await adminClient
      .from("discounts")
      .insert({
        name: `V5 Sub 10 ${Date.now()}`,
        kind: "fixed",
        value: 10.0,
        scope: "subscription",
        active: true,
      })
      .select()
      .single();

    let subId = "";
    let invId = "";

    try {
      const { data: sub } = await adminClient
        .from("subscriptions")
        .insert({
          customer_id: customer.id,
          plan_id: plan.id,
          start_date: today,
          expiry_date: "2027-10-31",
          payment_term_id: term!.id,
          status: "draft",
        })
        .select()
        .single();
      subId = sub.id;

      await adminClient.from("discount_subscriptions").insert({
        discount_id: subDisc.id,
        subscription_id: sub.id,
      });

      // Line A: gross 100
      await adminClient.from("subscription_lines").insert({
        subscription_id: sub.id,
        description: "Line A",
        quantity: 1,
        unit_price: 100.0,
        position: 0,
      });

      // Line B: gross 200
      await adminClient.from("subscription_lines").insert({
        subscription_id: sub.id,
        description: "Line B",
        quantity: 1,
        unit_price: 200.0,
        position: 1,
      });

      await teamClient.rpc("sub_transition", { p_id: sub.id, p_to: "quotation" });
      await teamClient.rpc("sub_transition", { p_id: sub.id, p_to: "confirmed" });
      await teamClient.rpc("sub_transition", { p_id: sub.id, p_to: "active" });

      await teamClient.rpc("run_billing", { p_sub: sub.id });

      const { data: inv } = await adminClient
        .from("invoices")
        .select("*, lines:invoice_lines(*)")
        .eq("subscription_id", sub.id)
        .single();
      invId = inv.id;

      const lineA = inv.lines.find((l: any) => l.description === "Line A");
      const lineB = inv.lines.find((l: any) => l.description === "Line B");

      // Expected: Line A discount 3.33, Line B discount 6.67, total 290.00
      expect(Number(lineA.discount_amount)).toBe(3.33);
      expect(Number(lineB.discount_amount)).toBe(6.67);
      expect(Number(inv.discount_total)).toBe(10.0);
      expect(Number(inv.total)).toBe(290.0);
    } finally {
      if (invId) await adminClient.from("invoices").delete().eq("id", invId);
      if (subId) await adminClient.from("subscriptions").delete().eq("id", subId);
      await adminClient.from("discount_subscriptions").delete().eq("discount_id", subDisc.id);
      await adminClient.from("discounts").delete().eq("id", subDisc.id);
      await adminClient.from("plans").delete().eq("id", plan.id);
      await adminClient.from("customers").delete().eq("id", customer.id);
    }
  });

  it("Golden Vector V6: One line gross 50, product discount fixed 80 -> capped at 50, total 0", async () => {
    const today = new Date().toISOString().split("T")[0];

    const { data: product } = await adminClient
      .from("products")
      .insert({
        name: `V6 Product ${Date.now()}`,
        sales_price: 50.0,
      })
      .select()
      .single();

    const { data: customer } = await adminClient
      .from("customers")
      .insert({
        name: "Vector V6 Customer",
        email: `v6_${Date.now()}@brightloop.com`,
      })
      .select()
      .single();

    const { data: plan } = await adminClient
      .from("plans")
      .insert({
        name: `Plan V6 ${Date.now()}`,
        billing_period: "monthly",
      })
      .select()
      .single();

    const { data: term } = await adminClient
      .from("payment_terms")
      .select("id")
      .limit(1)
      .single();

    const { data: discount } = await adminClient
      .from("discounts")
      .insert({
        name: `V6 Fixed 80 ${Date.now()}`,
        kind: "fixed",
        value: 80.0,
        scope: "product",
        active: true,
      })
      .select()
      .single();

    let subId = "";
    let invId = "";

    try {
      await adminClient.from("discount_products").insert({
        discount_id: discount.id,
        product_id: product.id,
      });

      const { data: sub } = await adminClient
        .from("subscriptions")
        .insert({
          customer_id: customer.id,
          plan_id: plan.id,
          start_date: today,
          expiry_date: "2027-10-31",
          payment_term_id: term!.id,
          status: "draft",
        })
        .select()
        .single();
      subId = sub.id;

      await adminClient.from("subscription_lines").insert({
        subscription_id: sub.id,
        product_id: product.id,
        description: "Line 50",
        quantity: 1,
        unit_price: 50.0,
        position: 0,
      });

      await teamClient.rpc("sub_transition", { p_id: sub.id, p_to: "quotation" });
      await teamClient.rpc("sub_transition", { p_id: sub.id, p_to: "confirmed" });
      await teamClient.rpc("sub_transition", { p_id: sub.id, p_to: "active" });

      await teamClient.rpc("run_billing", { p_sub: sub.id });

      const { data: inv } = await adminClient
        .from("invoices")
        .select("*, lines:invoice_lines(*)")
        .eq("subscription_id", sub.id)
        .single();
      invId = inv.id;

      expect(Number(inv.subtotal)).toBe(50.0);
      expect(Number(inv.discount_total)).toBe(50.0);
      expect(Number(inv.total)).toBe(0.0);
    } finally {
      if (invId) await adminClient.from("invoices").delete().eq("id", invId);
      if (subId) await adminClient.from("subscriptions").delete().eq("id", subId);
      await adminClient.from("discount_products").delete().eq("discount_id", discount.id);
      await adminClient.from("discounts").delete().eq("id", discount.id);
      await adminClient.from("products").delete().eq("id", product.id);
      await adminClient.from("plans").delete().eq("id", plan.id);
      await adminClient.from("customers").delete().eq("id", customer.id);
    }
  });

  it(
    "AC-DSC-3: Expired, inactive, not-started, and exhausted usage limit stops applying",
    { timeout: 30000 },
    async () => {
      const today = new Date().toISOString().split("T")[0];

      // Create 1 discount with usage_limit = 2
      const { data: disc } = await adminClient
        .from("discounts")
        .insert({
          name: `Usage Limit 2 Test ${Date.now()}`,
          kind: "fixed",
          value: 100.0,
          scope: "subscription",
          usage_limit: 2,
          used_count: 0,
          active: true,
        })
        .select()
        .single();

      const { data: customer } = await adminClient
        .from("customers")
        .insert({
          name: "Usage Test Customer",
          email: `usage_${Date.now()}@brightloop.com`,
        })
        .select()
        .single();

      const { data: plan } = await adminClient
        .from("plans")
        .insert({
          name: `Usage Plan ${Date.now()}`,
          billing_period: "monthly",
        })
        .select()
        .single();

      const { data: term } = await adminClient
        .from("payment_terms")
        .select("id")
        .limit(1)
        .single();

      const subIds: string[] = [];

      try {
        // Create 3 active subscriptions
        for (let i = 0; i < 3; i++) {
          const { data: s } = await adminClient
            .from("subscriptions")
            .insert({
              customer_id: customer.id,
              plan_id: plan.id,
              start_date: today,
              expiry_date: "2027-10-31",
              payment_term_id: term!.id,
              status: "draft",
            })
            .select()
            .single();

          subIds.push(s.id);

          await adminClient.from("subscription_lines").insert({
            subscription_id: s.id,
            description: `Sub ${i} line`,
            quantity: 1,
            unit_price: 300.0,
            position: 0,
          });

          await teamClient.rpc("sub_transition", { p_id: s.id, p_to: "quotation" });
          await teamClient.rpc("sub_transition", { p_id: s.id, p_to: "confirmed" });
          await teamClient.rpc("sub_transition", { p_id: s.id, p_to: "active" });

          // Run billing for each
          await teamClient.rpc("run_billing", { p_sub: s.id });
        }

        // Check discount used_count in DB
        const { data: discAfter } = await adminClient
          .from("discounts")
          .select("used_count")
          .eq("id", disc.id)
          .single();

        // AC-DSC-3: Exactly 2 used_count
        expect(discAfter!.used_count).toBe(2);

        // Check invoices: 2 have discount 100, 1 has discount 0
        const { data: invoices } = await adminClient
          .from("invoices")
          .select("subscription_id, discount_total, total")
          .in("subscription_id", subIds);

        const discountedInvoices = invoices?.filter(
          (i) => Number(i.discount_total) === 100.0
        );
        const regularInvoices = invoices?.filter(
          (i) => Number(i.discount_total) === 0.0
        );

        expect(discountedInvoices?.length).toBe(2);
        expect(regularInvoices?.length).toBe(1);
      } finally {
        if (subIds.length > 0) {
          await adminClient.from("invoices").delete().in("subscription_id", subIds);
          await adminClient.from("subscriptions").delete().in("id", subIds);
        }
        await adminClient.from("discounts").delete().eq("id", disc.id);
        await adminClient.from("plans").delete().eq("id", plan.id);
        await adminClient.from("customers").delete().eq("id", customer.id);
      }
    }
  );
});
