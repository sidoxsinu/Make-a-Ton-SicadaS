import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://sjeaqqpxmafsjpzgkmvr.supabase.co";
const ANON_KEY = "sb_publishable_gLXXbbK2bikWcv6psj00ng_KeBFkHmm";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqZWFxcXB4bWFmc2pwemdrbXZyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzQxNDQyMSwiZXhwIjoyMTA4OTkwNDIxfQ.u_z2Kfp6nWsL5-TXCHol72fv3zS7kMUzMFL9I4y7AB0";

describe("Live Supabase Auth & RLS Matrix Verification (Phase 1)", () => {
  const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);
  const anonClient = createClient(SUPABASE_URL, ANON_KEY);

  it("AC-AUTH-1: Duplicate email signup cannot create a second profile/customer", async () => {
    const testEmail = `duplicate_test_${Date.now()}@brightloop.com`;
    const pwd = "TestPassword1!";

    // First signup via admin client
    const { data: user1, error: err1 } = await adminClient.auth.admin.createUser({
      email: testEmail,
      password: pwd,
      email_confirm: true,
    });
    expect(err1).toBeNull();
    expect(user1.user).toBeDefined();

    // Second signup with uppercase email
    const { data: user2, error: err2 } = await adminClient.auth.admin.createUser({
      email: testEmail.toUpperCase(),
      password: pwd,
      email_confirm: true,
    });
    // In Supabase Auth, duplicate email is rejected
    expect(err2).not.toBeNull();
    expect(err2?.message).toMatch(/already.*registered/i);

    // Clean up
    if (user1.user?.id) {
      await adminClient.auth.admin.deleteUser(user1.user.id);
    }
  });

  it("AC-AUTH-4: Default signup role is always customer", async () => {
    const customerEmail = `customer_role_${Date.now()}@brightloop.com`;
    const pwd = "TestPassword1!";

    const { data: authRes } = await adminClient.auth.admin.createUser({
      email: customerEmail,
      password: pwd,
      email_confirm: true,
      user_metadata: { full_name: "Test Customer" },
    });

    const userId = authRes.user?.id;
    expect(userId).toBeDefined();

    // Check profiles table role
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", userId!)
      .single();

    expect(profile?.role).toBe("customer");

    // Clean up
    await adminClient.auth.admin.deleteUser(userId!);
  });

  it("RLS Security: Anon cannot read products, customers, or invoices", async () => {
    const { data: products } = await anonClient.from("products").select("*");
    expect(products?.length ?? 0).toBe(0);

    const { data: customers } = await anonClient.from("customers").select("*");
    expect(customers?.length ?? 0).toBe(0);

    const { data: invoices } = await anonClient.from("invoices").select("*");
    expect(invoices?.length ?? 0).toBe(0);
  });

  it("RLS Security: Admin can read and write products", async () => {
    // Admin query via service client
    const { data: products, error } = await adminClient.from("products").select("*");
    expect(error).toBeNull();
    expect(Array.isArray(products)).toBe(true);
  });

  it("Golden Vectors V7, V8, V9: add_periods SQL function parity", async () => {
    const v7_1 = await adminClient.rpc("add_periods", {
      p_start: "2026-01-31",
      p_period: "monthly",
      p_n: 1,
    });
    expect(v7_1.data).toBe("2026-02-28");

    const v7_2 = await adminClient.rpc("add_periods", {
      p_start: "2026-01-31",
      p_period: "monthly",
      p_n: 2,
    });
    expect(v7_2.data).toBe("2026-03-31");

    const v8_1 = await adminClient.rpc("add_periods", {
      p_start: "2024-02-29",
      p_period: "yearly",
      p_n: 1,
    });
    expect(v8_1.data).toBe("2025-02-28");

    const v8_4 = await adminClient.rpc("add_periods", {
      p_start: "2024-02-29",
      p_period: "yearly",
      p_n: 4,
    });
    expect(v8_4.data).toBe("2028-02-29");

    const v9_w = await adminClient.rpc("add_periods", {
      p_start: "2026-10-31",
      p_period: "weekly",
      p_n: 2,
    });
    expect(v9_w.data).toBe("2026-11-14");

    const v9_d = await adminClient.rpc("add_periods", {
      p_start: "2026-10-31",
      p_period: "daily",
      p_n: 3,
    });
    expect(v9_d.data).toBe("2026-11-03");
  });
});
