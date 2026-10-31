import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, ANON_KEY, SERVICE_KEY } from "../helpers/supabase";

describe("Customer Portal Verification (Phase 7 - AC-POR-1)", () => {
  const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);

  let userAId: string;
  let userBId: string;
  let clientA: any;
  let clientB: any;

  let customerAId: string;
  let customerBId: string;

  let pausablePlanId: string;
  let strictPlanId: string;
  let paymentTermId: string;
  let productId: string;

  let subAId: string;
  let subBId: string;
  let subStrictAId: string;
  let invAId: string;
  let invBId: string;

  beforeAll(async () => {
    const timestamp = Date.now();
    const pwd = "PortalTest123!";
    const emailA = `portal_a_${timestamp}@brightloop.com`;
    const emailB = `portal_b_${timestamp}@brightloop.com`;

    // 1. Create Auth Users
    const { data: userARes } = await adminClient.auth.admin.createUser({
      email: emailA,
      password: pwd,
      email_confirm: true,
      user_metadata: { full_name: "Customer Alice" },
    });
    userAId = userARes.user!.id;

    const { data: userBRes } = await adminClient.auth.admin.createUser({
      email: emailB,
      password: pwd,
      email_confirm: true,
      user_metadata: { full_name: "Customer Bob" },
    });
    userBId = userBRes.user!.id;

    // 2. Query linked customer rows (created automatically by handle_new_user trigger)
    const { data: custA } = await adminClient
      .from("customers")
      .select("id")
      .eq("user_id", userAId)
      .single();
    customerAId = custA!.id;

    const { data: custB } = await adminClient
      .from("customers")
      .select("id")
      .eq("user_id", userBId)
      .single();
    customerBId = custB!.id;

    // 3. Create authenticated clients for Alice and Bob
    clientA = createClient(SUPABASE_URL, ANON_KEY);
    await clientA.auth.signInWithPassword({ email: emailA, password: pwd });

    clientB = createClient(SUPABASE_URL, ANON_KEY);
    await clientB.auth.signInWithPassword({ email: emailB, password: pwd });

    // 4. Setup Master Data
    const { data: term } = await adminClient
      .from("payment_terms")
      .insert({ name: `Portal Term ${timestamp}`, days: 15 })
      .select()
      .single();
    paymentTermId = term!.id;

    const { data: pPlan } = await adminClient
      .from("plans")
      .insert({
        name: `Pausable Plan ${timestamp}`,
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
    pausablePlanId = pPlan!.id;

    const { data: sPlan } = await adminClient
      .from("plans")
      .insert({
        name: `Strict Plan ${timestamp}`,
        billing_period: "monthly",
        price: 0,
        min_quantity: 1,
        available_from: "2026-01-01",
        pausable: false,
        closable: false,
        renewable: false,
      })
      .select()
      .single();
    strictPlanId = sPlan!.id;

    const { data: prod } = await adminClient
      .from("products")
      .insert({
        name: `Portal Product ${timestamp}`,
        sales_price: 2500,
        cost_price: 1000,
      })
      .select()
      .single();
    productId = prod!.id;

    // 5. Create Subscriptions
    // Sub A (Customer A, pausable plan, active)
    const { data: subA } = await adminClient
      .from("subscriptions")
      .insert({
        customer_id: customerAId,
        plan_id: pausablePlanId,
        payment_term_id: paymentTermId,
        start_date: "2026-01-01",
        expiry_date: "2026-12-31",
        status: "draft",
      })
      .select()
      .single();
    subAId = subA!.id;

    await adminClient.from("subscription_lines").insert({
      subscription_id: subAId,
      product_id: productId,
      description: "Portal Cloud Service Line",
      quantity: 1,
      unit_price: 2500,
      position: 1,
    });

    // Advance to active step by step through legal state machine
    await adminClient.from("subscriptions").update({ status: "quotation" }).eq("id", subAId);
    await adminClient.from("subscriptions").update({ status: "confirmed" }).eq("id", subAId);
    await adminClient.from("subscriptions").update({ status: "active" }).eq("id", subAId);

    // Sub Strict A (Customer A, strict non-pausable plan, active)
    const { data: subStrictA } = await adminClient
      .from("subscriptions")
      .insert({
        customer_id: customerAId,
        plan_id: strictPlanId,
        payment_term_id: paymentTermId,
        start_date: "2026-01-01",
        expiry_date: "2026-12-31",
        status: "draft",
      })
      .select()
      .single();
    subStrictAId = subStrictA!.id;

    await adminClient.from("subscription_lines").insert({
      subscription_id: subStrictAId,
      product_id: productId,
      description: "Strict Service Line",
      quantity: 1,
      unit_price: 2500,
      position: 1,
    });

    await adminClient.from("subscriptions").update({ status: "quotation" }).eq("id", subStrictAId);
    await adminClient.from("subscriptions").update({ status: "confirmed" }).eq("id", subStrictAId);
    await adminClient.from("subscriptions").update({ status: "active" }).eq("id", subStrictAId);

    // Sub B (Customer B, active)
    const { data: subB } = await adminClient
      .from("subscriptions")
      .insert({
        customer_id: customerBId,
        plan_id: pausablePlanId,
        payment_term_id: paymentTermId,
        start_date: "2026-01-01",
        expiry_date: "2026-12-31",
        status: "draft",
      })
      .select()
      .single();
    subBId = subB!.id;

    await adminClient.from("subscription_lines").insert({
      subscription_id: subBId,
      product_id: productId,
      description: "Bob Cloud Service Line",
      quantity: 1,
      unit_price: 2500,
      position: 1,
    });

    await adminClient.from("subscriptions").update({ status: "quotation" }).eq("id", subBId);
    await adminClient.from("subscriptions").update({ status: "confirmed" }).eq("id", subBId);
    await adminClient.from("subscriptions").update({ status: "active" }).eq("id", subBId);

    // 6. Create Invoices for A and B
    const { data: invA } = await adminClient
      .from("invoices")
      .insert({
        subscription_id: subAId,
        customer_id: customerAId,
        status: "confirmed",
        invoice_date: "2026-01-01",
        due_date: "2026-01-15",
        period_start: "2026-01-01",
        period_end: "2026-01-31",
        subtotal: 2500,
        discount_total: 0,
        tax_total: 0,
        total: 2500,
        amount_paid: 500,
      })
      .select()
      .single();
    invAId = invA!.id;

    const { data: invB } = await adminClient
      .from("invoices")
      .insert({
        subscription_id: subBId,
        customer_id: customerBId,
        status: "confirmed",
        invoice_date: "2026-01-01",
        due_date: "2026-01-15",
        period_start: "2026-01-01",
        period_end: "2026-01-31",
        subtotal: 2500,
        discount_total: 0,
        tax_total: 0,
        total: 2500,
        amount_paid: 0,
      })
      .select()
      .single();
    invBId = invB!.id;
  }, 40000);

  afterAll(async () => {
    // 1. Close all created subscriptions and delete lines to prevent MRR leakage in shared DB
    for (const sid of [subAId, subStrictAId, subBId]) {
      if (sid) {
        await adminClient.from("subscriptions").update({ status: "closed" }).eq("id", sid);
        await adminClient.from("subscription_lines").delete().eq("subscription_id", sid);
      }
    }

    // 2. Cleanup users
    if (userAId) await adminClient.auth.admin.deleteUser(userAId);
    if (userBId) await adminClient.auth.admin.deleteUser(userBId);
    if (pausablePlanId) await adminClient.from("plans").delete().eq("id", pausablePlanId);
    if (strictPlanId) await adminClient.from("plans").delete().eq("id", strictPlanId);
    if (paymentTermId) await adminClient.from("payment_terms").delete().eq("id", paymentTermId);
    if (productId) await adminClient.from("products").delete().eq("id", productId);
  });

  it("AC-POR-1 (RLS Data Isolation): Customer A sees only Customer A rows; Customer B data is invisible", async () => {
    // 1. Customer A queries subscriptions
    const { data: subsA } = await clientA.from("subscriptions").select("id, number");
    expect(subsA).toBeDefined();
    const subAIds = ((subsA as any[]) || []).map((s: any) => s.id);
    expect(subAIds).toContain(subAId);
    expect(subAIds).toContain(subStrictAId);
    expect(subAIds).not.toContain(subBId);

    // 2. Direct query for Bob's subscription with Alice's token returns 0 rows
    const { data: subBDirect } = await clientA
      .from("subscriptions")
      .select("id")
      .eq("id", subBId);
    expect((subBDirect as any[])?.length).toBe(0);

    // 3. Customer A queries invoices
    const { data: invsA } = await clientA.from("invoices").select("id, number");
    expect(invsA).toBeDefined();
    const invAIds = ((invsA as any[]) || []).map((i: any) => i.id);
    expect(invAIds).toContain(invAId);
    expect(invAIds).not.toContain(invBId);

    // 4. Direct query for Bob's invoice with Alice's token returns 0 rows
    const { data: invBDirect } = await clientA
      .from("invoices")
      .select("id")
      .eq("id", invBId);
    expect((invBDirect as any[])?.length).toBe(0);
  });

  it("AC-POR-1 (Cross-Tenant Execution): Customer A cannot execute actions on Customer B subscription", async () => {
    // Alice tries to pause Bob's subscription
    const { error } = await clientA.rpc("customer_sub_action", {
      p_id: subBId,
      p_action: "pause",
    });

    expect(error).not.toBeNull();
    expect(error?.message).toMatch(/Not allowed/i);

    // Verify Bob's subscription remains active
    const { data: bobSub } = await adminClient
      .from("subscriptions")
      .select("status")
      .eq("id", subBId)
      .single();
    expect(bobSub?.status).toBe("active");
  });

  it("AC-POR-1 (Plan Switch Enforcement): Pause rejected when plan pausable is false", async () => {
    // Alice tries to pause subStrictA (strictPlan has pausable = false)
    const { error } = await clientA.rpc("customer_sub_action", {
      p_id: subStrictAId,
      p_action: "pause",
    });

    expect(error).not.toBeNull();
    expect(error?.message).toMatch(/Action pause is not available/i);

    // Verify status did not change
    const { data: sub } = await adminClient
      .from("subscriptions")
      .select("status")
      .eq("id", subStrictAId)
      .single();
    expect(sub?.status).toBe("active");
  });

  it("AC-POR-1 (Lifecycle Self-Service): Customer can Pause, Resume, and Close permitted subscriptions", async () => {
    // 1. Pause pausable subscription
    const { error: pauseErr } = await clientA.rpc("customer_sub_action", {
      p_id: subAId,
      p_action: "pause",
    });
    expect(pauseErr).toBeNull();

    const { data: pausedSub } = await adminClient
      .from("subscriptions")
      .select("status, next_invoice_date")
      .eq("id", subAId)
      .single();
    expect(pausedSub?.status).toBe("paused");
    expect(pausedSub?.next_invoice_date).toBeNull();

    // 2. Resume pausable subscription
    const { error: resumeErr } = await clientA.rpc("customer_sub_action", {
      p_id: subAId,
      p_action: "resume",
    });
    expect(resumeErr).toBeNull();

    const { data: resumedSub } = await adminClient
      .from("subscriptions")
      .select("status, anchor_date")
      .eq("id", subAId)
      .single();
    expect(resumedSub?.status).toBe("active");
    const today = new Date().toISOString().split("T")[0];
    expect(resumedSub?.anchor_date).toBe(today);

    // 3. Close subscription
    const { error: closeErr } = await clientA.rpc("customer_sub_action", {
      p_id: subAId,
      p_action: "close",
    });
    expect(closeErr).toBeNull();

    const { data: closedSub } = await adminClient
      .from("subscriptions")
      .select("status")
      .eq("id", subAId)
      .single();
    expect(closedSub?.status).toBe("closed");
  });

  it("AC-POR-1 (Customer Self-Edit): Customer can update name, phone, and address via update_my_details", async () => {
    const updatedName = "Alice In Wonderland";
    const updatedPhone = "+91 91234 56789";
    const updatedAddress = "42 Rabbit Hole Lane, Wonderland";

    const { error } = await clientA.rpc("update_my_details", {
      p_name: updatedName,
      p_phone: updatedPhone,
      p_address: updatedAddress,
    });
    expect(error).toBeNull();

    // Verify in database
    const { data: updatedCustomer } = await adminClient
      .from("customers")
      .select("name, phone, address")
      .eq("id", customerAId)
      .single();

    expect(updatedCustomer?.name).toBe(updatedName);
    expect(updatedCustomer?.phone).toBe(updatedPhone);
    expect(updatedCustomer?.address).toBe(updatedAddress);
  });
});
