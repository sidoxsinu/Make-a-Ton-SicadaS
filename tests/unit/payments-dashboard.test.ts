import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://sjeaqqpxmafsjpzgkmvr.supabase.co";
const ANON_KEY = "sb_publishable_gLXXbbK2bikWcv6psj00ng_KeBFkHmm";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqZWFxcXB4bWFmc2pwemdrbXZyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzQxNDQyMSwiZXhwIjoyMTA4OTkwNDIxfQ.u_z2Kfp6nWsL5-TXCHol72fv3zS7kMUzMFL9I4y7AB0";

describe("Payments & Dashboard Reporting Verification (Phase 6)", () => {
  const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);
  const teamClient = createClient(SUPABASE_URL, ANON_KEY);
  const staffClient = createClient(SUPABASE_URL, ANON_KEY);

  let staffUserId: string;
  const staffEmail = `staff_pay_${Date.now()}@brightloop.com`;
  const staffPassword = "BrightloopStaff1!";

  beforeAll(async () => {
    // 1. Admin login for teamClient
    await teamClient.auth.signInWithPassword({
      email: "sinan@brightloop.local",
      password: "Brightloop1!",
    });

    // 2. Staff user login for AC-PAY-3
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

  it("AC-PAY-1: Partial payment, overpayment rejection, draft payment rejection, and full payment status transition", async () => {
    const today = new Date().toISOString().split("T")[0];

    const { data: customer } = await adminClient
      .from("customers")
      .insert({
        name: "Pay Test Customer",
        email: `pay_test_${Date.now()}@brightloop.com`,
      })
      .select()
      .single();

    const { data: plan } = await adminClient
      .from("plans")
      .insert({
        name: `Pay Plan ${Date.now()}`,
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
        start_date: today,
        expiry_date: "2027-10-31",
        payment_term_id: term!.id,
        status: "draft",
      })
      .select()
      .single();

    // 1. Create a Draft invoice directly
    const { data: draftInv, error: draftInvErr } = await adminClient
      .from("invoices")
      .insert({
        subscription_id: sub!.id,
        customer_id: customer!.id,
        status: "draft",
        invoice_date: today,
        due_date: today,
        period_start: today,
        period_end: today,
        subtotal: 1000.0,
        total: 1000.0,
      })
      .select()
      .single();
    expect(draftInvErr).toBeNull();

    try {
      // Payment on Draft invoice must be rejected
      const { error: draftPayErr } = await teamClient.from("payments").insert({
        invoice_id: draftInv.id,
        amount: 500.0,
        method: "bank_transfer",
      });
      expect(draftPayErr).not.toBeNull();

      // Transition invoice to confirmed
      await adminClient
        .from("invoices")
        .update({ status: "confirmed" })
        .eq("id", draftInv.id);

      // Partial payment: 400
      const { data: pay1, error: pay1Err } = await teamClient
        .from("payments")
        .insert({
          invoice_id: draftInv.id,
          amount: 400.0,
          method: "bank_transfer",
        })
        .select()
        .single();

      expect(pay1Err).toBeNull();
      expect(pay1).toBeDefined();

      // Verify invoice balance: amount_paid = 400, status remains confirmed
      const { data: invAfterPart } = await adminClient
        .from("invoices")
        .select("status, amount_paid, total")
        .eq("id", draftInv.id)
        .single();

      expect(Number(invAfterPart!.amount_paid)).toBe(400.0);
      expect(invAfterPart!.status).toBe("confirmed");

      // Overpayment: 700 (amount due is 600) -> must be rejected
      const { error: overpayErr } = await teamClient
        .from("payments")
        .insert({
          invoice_id: draftInv.id,
          amount: 700.0,
          method: "upi",
        });
      expect(overpayErr).not.toBeNull();

      // Final payment: exactly 600 -> invoice status must become paid
      const { data: pay2, error: pay2Err } = await teamClient
        .from("payments")
        .insert({
          invoice_id: draftInv.id,
          amount: 600.0,
          method: "upi",
        })
        .select()
        .single();

      expect(pay2Err).toBeNull();
      expect(pay2).toBeDefined();

      const { data: invAfterFull } = await adminClient
        .from("invoices")
        .select("status, amount_paid, total")
        .eq("id", draftInv.id)
        .single();

      expect(Number(invAfterFull!.amount_paid)).toBe(1000.0);
      expect(invAfterFull!.status).toBe("paid");
    } finally {
      await adminClient.from("payments").delete().eq("invoice_id", draftInv.id);
      await adminClient.from("invoices").delete().eq("id", draftInv.id);
      await adminClient.from("subscriptions").delete().eq("id", sub.id);
      await adminClient.from("plans").delete().eq("id", plan.id);
      await adminClient.from("customers").delete().eq("id", customer.id);
    }
  });

  it("AC-PAY-2: Overdue detection on confirmed invoices; paid invoices are never overdue", async () => {
    const pastDueDate = "2026-01-01";
    const today = new Date().toISOString().split("T")[0];

    const { data: customer } = await adminClient
      .from("customers")
      .insert({
        name: "Overdue Test Customer",
        email: `overdue_${Date.now()}@brightloop.com`,
      })
      .select()
      .single();

    const { data: plan } = await adminClient
      .from("plans")
      .insert({
        name: `Overdue Plan ${Date.now()}`,
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
        start_date: "2026-01-01",
        expiry_date: "2027-10-31",
        payment_term_id: term!.id,
        status: "draft",
      })
      .select()
      .single();

    // Create confirmed invoice past due
    const { data: inv, error: invErr } = await adminClient
      .from("invoices")
      .insert({
        subscription_id: sub!.id,
        customer_id: customer!.id,
        status: "confirmed",
        invoice_date: "2026-01-01",
        due_date: pastDueDate,
        period_start: "2026-01-01",
        period_end: "2026-01-31",
        subtotal: 500.0,
        total: 500.0,
        amount_paid: 0.0,
      })
      .select()
      .single();
    expect(invErr).toBeNull();

    try {
      // Check overdue view v_invoices
      const { data: vInv } = await adminClient
        .from("v_invoices")
        .select("is_overdue, days_overdue")
        .eq("id", inv.id)
        .single();

      expect(vInv!.is_overdue).toBe(true);
      expect(Number(vInv!.days_overdue)).toBeGreaterThan(0);

      // Record full payment
      await teamClient.from("payments").insert({
        invoice_id: inv.id,
        amount: 500.0,
        method: "cash",
      });

      // Once paid, must NOT be overdue
      const { data: vInvPaid } = await adminClient
        .from("v_invoices")
        .select("status, is_overdue")
        .eq("id", inv.id)
        .single();

      expect(vInvPaid!.status).toBe("paid");
      expect(vInvPaid!.is_overdue).toBe(false);
    } finally {
      await adminClient.from("payments").delete().eq("invoice_id", inv.id);
      await adminClient.from("invoices").delete().eq("id", inv.id);
      await adminClient.from("subscriptions").delete().eq("id", sub.id);
      await adminClient.from("plans").delete().eq("id", plan.id);
      await adminClient.from("customers").delete().eq("id", customer.id);
    }
  });

  it("AC-PAY-3: Admin deletes payment reverting invoice to Confirmed; staff cannot delete payment", async () => {
    const today = new Date().toISOString().split("T")[0];

    const { data: customer } = await adminClient
      .from("customers")
      .insert({
        name: "Delete Pay Customer",
        email: `delpay_${Date.now()}@brightloop.com`,
      })
      .select()
      .single();

    const { data: plan } = await adminClient
      .from("plans")
      .insert({
        name: `DelPay Plan ${Date.now()}`,
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
        start_date: today,
        expiry_date: "2027-10-31",
        payment_term_id: term!.id,
        status: "draft",
      })
      .select()
      .single();

    const { data: inv, error: invErr } = await adminClient
      .from("invoices")
      .insert({
        subscription_id: sub!.id,
        customer_id: customer!.id,
        status: "confirmed",
        invoice_date: today,
        due_date: today,
        period_start: today,
        period_end: today,
        subtotal: 800.0,
        total: 800.0,
        amount_paid: 0.0,
      })
      .select()
      .single();
    expect(invErr).toBeNull();

    // Record payment making it paid
    const { data: pay } = await teamClient
      .from("payments")
      .insert({
        invoice_id: inv.id,
        amount: 800.0,
        method: "card",
      })
      .select()
      .single();

    try {
      // 1. Staff attempt to delete payment -> fails due to RLS pay_admin_delete
      const { data: staffDel } = await staffClient
        .from("payments")
        .delete()
        .eq("id", pay!.id)
        .select();

      // Staff delete affected 0 rows
      expect(staffDel?.length || 0).toBe(0);

      const { data: checkPay } = await adminClient
        .from("payments")
        .select("id")
        .eq("id", pay!.id)
        .single();
      expect(checkPay).not.toBeNull();

      // 2. Admin deletes payment -> succeeds
      const { error: adminDelErr } = await adminClient
        .from("payments")
        .delete()
        .eq("id", pay!.id);
      expect(adminDelErr).toBeNull();

      // 3. Invoice balance decremented and status reverted from paid to confirmed
      const { data: invReverted } = await adminClient
        .from("invoices")
        .select("status, amount_paid, total")
        .eq("id", inv.id)
        .single();

      expect(invReverted!.status).toBe("confirmed");
      expect(Number(invReverted!.amount_paid)).toBe(0.0);
    } finally {
      await adminClient.from("invoices").delete().eq("id", inv.id);
      await adminClient.from("subscriptions").delete().eq("id", sub.id);
      await adminClient.from("plans").delete().eq("id", plan.id);
      await adminClient.from("customers").delete().eq("id", customer.id);
    }
  });

  it("AC-RPT-1 & Golden Vector V10: Dashboard summary matches independent SQL sums and MRR calculation", async () => {
    const today = new Date().toISOString().split("T")[0];

    const { data: customer } = await adminClient
      .from("customers")
      .insert({
        name: "V10 Customer",
        email: `v10_${Date.now()}@brightloop.com`,
      })
      .select()
      .single();

    const { data: term } = await adminClient
      .from("payment_terms")
      .select("id")
      .limit(1)
      .single();

    // Create 4 plans: monthly, yearly, weekly, daily
    const { data: pMonthly } = await adminClient
      .from("plans")
      .insert({ name: `Monthly ${Date.now()}`, billing_period: "monthly" })
      .select()
      .single();

    const { data: pYearly } = await adminClient
      .from("plans")
      .insert({ name: `Yearly ${Date.now()}`, billing_period: "yearly" })
      .select()
      .single();

    const { data: pWeekly } = await adminClient
      .from("plans")
      .insert({ name: `Weekly ${Date.now()}`, billing_period: "weekly" })
      .select()
      .single();

    const { data: pDaily } = await adminClient
      .from("plans")
      .insert({ name: `Daily ${Date.now()}`, billing_period: "daily" })
      .select()
      .single();

    // Subscriptions setup for Golden Vector V10:
    // monthly line 500, yearly line 12000, weekly line 100, daily line 10
    const configs = [
      { plan: pMonthly, price: 500.0 },
      { plan: pYearly, price: 12000.0 },
      { plan: pWeekly, price: 100.0 },
      { plan: pDaily, price: 10.0 },
    ];

    const subIds: string[] = [];

    try {
      for (const cfg of configs) {
        const { data: s } = await adminClient
          .from("subscriptions")
          .insert({
            customer_id: customer.id,
            plan_id: cfg.plan.id,
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
          description: "Contract line",
          quantity: 1,
          unit_price: cfg.price,
          position: 0,
        });

        await teamClient.rpc("sub_transition", { p_id: s.id, p_to: "quotation" });
        await teamClient.rpc("sub_transition", { p_id: s.id, p_to: "confirmed" });
        await teamClient.rpc("sub_transition", { p_id: s.id, p_to: "active" });
      }

      // Call dashboard_summary RPC
      const { data: summary, error: rpcErr } = await teamClient.rpc(
        "dashboard_summary",
        {
          p_from: "2026-01-01",
          p_to: today,
        }
      );

      expect(rpcErr).toBeNull();
      expect(summary).toBeDefined();

      // Verify Golden Vector V10 MRR calculation:
      // 500 + 1000 + (100 * 52/12) + (10 * 365/12) = 2,237.50
      expect(Number(summary.mrr)).toBe(2237.5);

      // Verify AC-RPT-1: Figures match independent SQL queries
      const { count: sqlActiveSubs } = await adminClient
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      expect(Number(summary.active_subscriptions)).toBe(sqlActiveSubs);

      const { data: confInvs } = await adminClient
        .from("invoices")
        .select("total, amount_paid")
        .eq("status", "confirmed");

      const sqlOutstanding = (confInvs || []).reduce(
        (sum, i) => sum + (Number(i.total) - Number(i.amount_paid)),
        0
      );
      expect(Number(summary.outstanding)).toBeCloseTo(sqlOutstanding, 2);
    } finally {
      if (subIds.length > 0) {
        await adminClient.from("subscriptions").delete().in("id", subIds);
      }
      await adminClient
        .from("plans")
        .delete()
        .in("id", [pMonthly.id, pYearly.id, pWeekly.id, pDaily.id]);
      await adminClient.from("customers").delete().eq("id", customer.id);
    }
  });
});
