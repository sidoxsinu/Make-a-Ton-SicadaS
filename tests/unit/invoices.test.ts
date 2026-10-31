import { describe, it, expect, beforeAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://sjeaqqpxmafsjpzgkmvr.supabase.co";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_gLXXbbK2bikWcv6psj00ng_KeBFkHmm";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

describe("Billing Engine & Invoices Verification (Phase 4)", () => {
  const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);
  const teamClient = createClient(SUPABASE_URL, ANON_KEY);

  beforeAll(async () => {
    await teamClient.auth.signInWithPassword({
      email: "sinan@brightloop.local",
      password: "Brightloop1!",
    });
  });

  it("AC-INV-1 & AC-INV-2: Billing generation, idempotency, and double-run rejection", async () => {
    // 1. Create customer, plan, term
    const { data: customer } = await adminClient
      .from("customers")
      .insert({
        name: "Billing Test Customer",
        email: `bill_test_${Date.now()}@brightloop.com`,
      })
      .select()
      .single();

    const { data: plan } = await adminClient
      .from("plans")
      .insert({
        name: `Billing Monthly Plan ${Date.now()}`,
        billing_period: "monthly",
        price: 0,
        available_from: "2026-01-01",
      })
      .select()
      .single();

    const { data: term } = await adminClient
      .from("payment_terms")
      .select("id")
      .limit(1)
      .single();

    // Create subscription in draft state
    const today = new Date().toISOString().split("T")[0];
    const { data: sub } = await adminClient
      .from("subscriptions")
      .insert({
        customer_id: customer.id,
        plan_id: plan.id,
        start_date: today,
        expiry_date: "2027-10-31",
        payment_term_id: term!.id,
        status: "draft",
        cycles_billed: 0,
      })
      .select()
      .single();

    // Insert line item (Vector V1: 10 x 1560) while in draft
    const { error: lineErr } = await adminClient.from("subscription_lines").insert({
      subscription_id: sub.id,
      description: "Service line",
      quantity: 10,
      unit_price: 1560.0,
      position: 0,
    });
    expect(lineErr).toBeNull();

    // Transition: draft -> quotation -> confirmed -> active
    const t1 = await teamClient.rpc("sub_transition", { p_id: sub.id, p_to: "quotation" });
    expect(t1.error).toBeNull();
    const t2 = await teamClient.rpc("sub_transition", { p_id: sub.id, p_to: "confirmed" });
    expect(t2.error).toBeNull();
    const t3 = await teamClient.rpc("sub_transition", { p_id: sub.id, p_to: "active" });
    expect(t3.error).toBeNull();

    // Run billing for this subscription
    const { data: runRes1, error: runErr1 } = await teamClient.rpc("run_billing", {
      p_sub: sub.id,
    });

    expect(runErr1).toBeNull();
    expect(runRes1?.created).toBe(1);

    // Verify invoice created with totals
    const { data: inv } = await adminClient
      .from("invoices")
      .select("*, lines:invoice_lines(*)")
      .eq("subscription_id", sub.id)
      .single();

    expect(inv).toBeDefined();
    expect(Number(inv.subtotal)).toBe(15600.0);
    expect(inv.lines.length).toBe(1);

    // AC-INV-2: Run billing a second time on the same day -> must create 0 new invoices
    const { data: runRes2 } = await teamClient.rpc("run_billing", {
      p_sub: sub.id,
    });
    expect(runRes2?.created).toBe(0);

    // Clean up
    await adminClient.from("invoices").delete().eq("id", inv.id);
    await adminClient.from("subscriptions").delete().eq("id", sub.id);
    await adminClient.from("plans").delete().eq("id", plan.id);
    await adminClient.from("customers").delete().eq("id", customer.id);
  });

  it("AC-INV-5: Invoice amounts are frozen after Draft", async () => {
    const { data: customer } = await adminClient
      .from("customers")
      .insert({
        name: "Freeze Test Customer",
        email: `freeze_test_${Date.now()}@brightloop.com`,
      })
      .select()
      .single();

    const { data: plan } = await adminClient
      .from("plans")
      .insert({
        name: `Freeze Plan ${Date.now()}`,
        billing_period: "monthly",
      })
      .select()
      .single();

    const { data: term } = await adminClient
      .from("payment_terms")
      .select("id")
      .limit(1)
      .single();

    const { data: sub } = await adminClient
      .from("subscriptions")
      .insert({
        customer_id: customer.id,
        plan_id: plan.id,
        start_date: "2026-10-31",
        expiry_date: "2027-10-31",
        payment_term_id: term!.id,
        status: "active",
      })
      .select()
      .single();

    // Create an invoice directly in confirmed state
    const { data: inv } = await adminClient
      .from("invoices")
      .insert({
        subscription_id: sub.id,
        customer_id: customer.id,
        status: "confirmed",
        invoice_date: "2026-10-31",
        due_date: "2026-11-30",
        period_start: "2026-10-31",
        period_end: "2026-11-30",
        subtotal: 1000,
        total: 1000,
      })
      .select()
      .single();

    // Attempt to mutate total directly while confirmed
    const { error: freezeErr } = await adminClient
      .from("invoices")
      .update({ total: 500 })
      .eq("id", inv.id);

    expect(freezeErr).not.toBeNull();
    expect(freezeErr?.message).toMatch(/frozen/i);

    // Clean up
    await adminClient.from("invoices").delete().eq("id", inv.id);
    await adminClient.from("subscriptions").delete().eq("id", sub.id);
    await adminClient.from("plans").delete().eq("id", plan.id);
    await adminClient.from("customers").delete().eq("id", customer.id);
  });
});
