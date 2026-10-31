import { describe, it, expect, beforeAll } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, ANON_KEY, SERVICE_KEY } from "../helpers/supabase";

describe("Database Performance & Query Benchmarks (AC-RPT-3)", () => {
  let adminClient: any;
  let teamClient: any;

  beforeAll(async () => {
    adminClient = createClient(SUPABASE_URL, SERVICE_KEY);
    teamClient = createClient(SUPABASE_URL, ANON_KEY);

    const { error: signInErr } = await teamClient.auth.signInWithPassword({
      email: "sinan@brightloop.local",
      password: "Brightloop1!",
    });
    if (signInErr) {
      throw new Error(`Failed to sign in team user: ${signInErr.message}`);
    }
  });

  it("Executes dashboard_summary RPC within acceptable budget", async () => {
    const today = new Date().toISOString().split("T")[0];
    const start = performance.now();
    const { data, error } = await teamClient.rpc("dashboard_summary", {
      p_from: "2026-01-01",
      p_to: today,
    });
    const duration = performance.now() - start;

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.mrr).toBeDefined();
    expect(data.active_subscriptions).toBeDefined();
    expect(data.outstanding).toBeDefined();
    expect(duration).toBeLessThan(3000); // 3s network threshold over cloud TLS
  });

  it("Queries active subscriptions efficiently", async () => {
    const start = performance.now();
    const { data, error } = await teamClient
      .from("subscriptions")
      .select("id, status, cycles_billed, next_invoice_date")
      .eq("status", "active")
      .limit(50);
    const duration = performance.now() - start;

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(duration).toBeLessThan(2000);
  });

  it("Queries confirmed invoices with due date filter efficiently", async () => {
    const today = new Date().toISOString().split("T")[0];
    const start = performance.now();
    const { data, error } = await teamClient
      .from("invoices")
      .select("id, number, status, due_date, total, amount_paid")
      .eq("status", "confirmed")
      .lt("due_date", today)
      .limit(50);
    const duration = performance.now() - start;

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(duration).toBeLessThan(2000);
  });

  it("Executes customer text search efficiently", async () => {
    const start = performance.now();
    const { data, error } = await teamClient
      .from("customers")
      .select("id, name, email, company")
      .ilike("name", "%Customer%")
      .limit(50);
    const duration = performance.now() - start;

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(duration).toBeLessThan(2000);
  });

  it("Queries payments ledger sorted by date efficiently", async () => {
    const start = performance.now();
    const { data, error } = await teamClient
      .from("payments")
      .select("id, paid_on, amount, method")
      .order("paid_on", { ascending: false })
      .limit(50);
    const duration = performance.now() - start;

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(duration).toBeLessThan(2000);
  });
});
