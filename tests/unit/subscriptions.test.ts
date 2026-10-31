import { describe, it, expect, beforeAll } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, ANON_KEY, SERVICE_KEY } from "../helpers/supabase";

describe("Subscription Lifecycle & Transitions (Phase 3)", () => {
  const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);
  const teamClient = createClient(SUPABASE_URL, ANON_KEY);

  beforeAll(async () => {
    // Authenticate teamClient as admin user
    const { error } = await teamClient.auth.signInWithPassword({
      email: "sinan@brightloop.local",
      password: "Brightloop1!",
    });
    if (error) {
      console.error("Sign-in failed for test user:", error);
    }
  });

  it("AC-SUB-2: Legal and illegal transitions in the state machine matrix", async () => {
    // Create customer, plan, term
    const { data: customer } = await adminClient
      .from("customers")
      .insert({
        name: "Transition Test Customer",
        email: `trans_test_${Date.now()}@brightloop.com`,
      })
      .select()
      .single();

    const { data: plan } = await adminClient
      .from("plans")
      .insert({
        name: `Transition Plan ${Date.now()}`,
        billing_period: "monthly",
        price: 0,
        min_quantity: 1,
        available_from: "2026-01-01",
        pausable: true,
        closable: true,
        renewable: true,
      })
      .select()
      .single();

    const { data: term } = await adminClient
      .from("payment_terms")
      .select("id")
      .limit(1)
      .single();

    // Create draft subscription
    const { data: sub, error: subErr } = await adminClient
      .from("subscriptions")
      .insert({
        customer_id: customer.id,
        plan_id: plan.id,
        start_date: "2026-10-31",
        expiry_date: "2027-10-31",
        payment_term_id: term!.id,
        status: "draft",
      })
      .select()
      .single();

    expect(subErr).toBeNull();
    expect(sub.status).toBe("draft");

    // Add a valid line item so readiness check passes
    await adminClient.from("subscription_lines").insert({
      subscription_id: sub.id,
      description: "Test service",
      quantity: 1,
      unit_price: 100,
    });

    // 1. Illegal move: draft -> confirmed (must fail)
    const { error: errIllegal1 } = await teamClient.rpc("sub_transition", {
      p_id: sub.id,
      p_to: "confirmed",
    });
    expect(errIllegal1).not.toBeNull();

    // 2. Legal move: draft -> quotation
    const { error: errQuote } = await teamClient.rpc("sub_transition", {
      p_id: sub.id,
      p_to: "quotation",
    });
    expect(errQuote).toBeNull();

    // 3. Legal move: quotation -> confirmed
    const { error: errConf } = await teamClient.rpc("sub_transition", {
      p_id: sub.id,
      p_to: "confirmed",
    });
    expect(errConf).toBeNull();

    // 4. AC-SUB-3: Editing lines on a Confirmed subscription must fail by trigger
    const { error: errLineLock } = await adminClient
      .from("subscription_lines")
      .insert({
        subscription_id: sub.id,
        description: "Illegal line insert",
        quantity: 1,
        unit_price: 50,
      });
    expect(errLineLock).not.toBeNull();
    expect(errLineLock?.message).toMatch(/locked/i);

    // 5. Legal move: confirmed -> active
    const { error: errAct } = await teamClient.rpc("sub_transition", {
      p_id: sub.id,
      p_to: "active",
    });
    expect(errAct).toBeNull();

    // 6. Legal move: active -> paused (plan is pausable)
    const { error: errPause } = await teamClient.rpc("sub_transition", {
      p_id: sub.id,
      p_to: "paused",
    });
    expect(errPause).toBeNull();

    // 7. Legal move: paused -> active (resume)
    const { error: errResume } = await teamClient.rpc("sub_transition", {
      p_id: sub.id,
      p_to: "active",
    });
    expect(errResume).toBeNull();

    // 8. Legal move: active -> closed
    const { error: errClose } = await teamClient.rpc("sub_transition", {
      p_id: sub.id,
      p_to: "closed",
    });
    expect(errClose).toBeNull();

    // 9. Illegal move: closed -> anything (must fail)
    const { error: errClosedMove } = await teamClient.rpc("sub_transition", {
      p_id: sub.id,
      p_to: "draft",
    });
    expect(errClosedMove).not.toBeNull();

    // 10. Verify audit history rows were written for each transition
    const { data: history } = await adminClient
      .from("subscription_status_history")
      .select("*")
      .eq("subscription_id", sub.id);

    expect(history?.length).toBeGreaterThanOrEqual(6);

    // Clean up
    await adminClient.from("subscriptions").delete().eq("id", sub.id);
    await adminClient.from("plans").delete().eq("id", plan.id);
    await adminClient.from("customers").delete().eq("id", customer.id);
  });

  it("AC-SUB-4: Readiness checks prevent quotation transition when minimum quantity is violated", async () => {
    const { data: customer } = await adminClient
      .from("customers")
      .insert({
        name: "Min Qty Customer",
        email: `min_qty_${Date.now()}@brightloop.com`,
      })
      .select()
      .single();

    const { data: plan } = await adminClient
      .from("plans")
      .insert({
        name: `Min 10 Plan ${Date.now()}`,
        billing_period: "monthly",
        min_quantity: 10,
        available_from: "2026-01-01",
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
        status: "draft",
      })
      .select()
      .single();

    const { data: product } = await adminClient
      .from("products")
      .insert({
        name: "Min Qty Product",
        sales_price: 100,
        type: "service",
      })
      .select()
      .single();

    // Add line with quantity 2 (below plan minimum of 10) on a real product
    await adminClient.from("subscription_lines").insert({
      subscription_id: sub.id,
      product_id: product.id,
      description: "Under minimum item",
      quantity: 2,
      unit_price: 100,
    });

    // Attempting to move draft -> quotation should fail
    const { error: errMin } = await teamClient.rpc("sub_transition", {
      p_id: sub.id,
      p_to: "quotation",
    });

    expect(errMin).not.toBeNull();
    expect(errMin?.message).toMatch(/minimum/i);

    // Clean up
    await adminClient.from("subscriptions").delete().eq("id", sub.id);
    await adminClient.from("products").delete().eq("id", product.id);
    await adminClient.from("plans").delete().eq("id", plan.id);
    await adminClient.from("customers").delete().eq("id", customer.id);
  });
});
