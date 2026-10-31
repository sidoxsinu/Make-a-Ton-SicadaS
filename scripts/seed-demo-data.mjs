// scripts/seed-demo-data.mjs
// Seeds rich, realistic demonstration data for live hackathon pitch and judging.

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

async function seedDemoData() {
  const env = loadEnv();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("[demo-seed] Error: Missing Supabase credentials in .env.local");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("==> Initializing Brightloop SMS Demo Seed...");

  const { data: userList } = await supabase.auth.admin.listUsers();

  // 0. Create or ensure Demo Admin Auth Account
  const demoAdminEmail = "sinan@brightloop.local";
  const existingAdmin = userList?.users?.find((u) => u.email === demoAdminEmail);
  if (!existingAdmin) {
    const { data: newAdmin, error: adminErr } = await supabase.auth.admin.createUser({
      email: demoAdminEmail,
      password: "Brightloop1!",
      email_confirm: true,
      user_metadata: { full_name: "Muhammed Sinan (Admin)" },
    });
    if (!adminErr && newAdmin) {
      await supabase.from("profiles").upsert({
        id: newAdmin.user.id,
        full_name: "Muhammed Sinan",
        role: "admin",
      });
      console.log(`[demo-seed] Created demo admin: ${demoAdminEmail} / Brightloop1!`);
    }
  } else {
    await supabase.auth.admin.updateUserById(existingAdmin.id, {
      password: "Brightloop1!",
      email_confirm: true,
    });
    await supabase.from("profiles").upsert({
      id: existingAdmin.id,
      full_name: "Muhammed Sinan",
      role: "admin",
    });
    console.log(`[demo-seed] Ensured demo admin: ${demoAdminEmail} / Brightloop1!`);
  }

  // 1. Create or ensure Demo Customer Auth Account
  const demoCustomerEmail = "demo.customer@brightloop.com";
  let demoCustomerUserId = null;
  const existingCustomer = userList?.users?.find((u) => u.email === demoCustomerEmail);

  if (!existingCustomer) {
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: demoCustomerEmail,
      password: "Customer1!",
      email_confirm: true,
      user_metadata: { full_name: "Rahul Sharma (Acme Corp)" },
    });
    if (createErr) {
      console.warn("[demo-seed] Could not create demo customer user:", createErr.message);
    } else {
      demoCustomerUserId = newUser.user.id;
      await supabase.from("profiles").upsert({
        id: demoCustomerUserId,
        full_name: "Rahul Sharma (Acme Corp)",
        role: "customer",
      });
      console.log(`[demo-seed] Created demo customer: ${demoCustomerEmail} / Customer1!`);
    }
  } else {
    demoCustomerUserId = existingCustomer.id;
    await supabase.auth.admin.updateUserById(existingCustomer.id, {
      password: "Customer1!",
      email_confirm: true,
    });
    await supabase.from("profiles").upsert({
      id: existingCustomer.id,
      full_name: "Rahul Sharma (Acme Corp)",
      role: "customer",
    });
    console.log(`[demo-seed] Ensured demo customer: ${demoCustomerEmail} / Customer1!`);
  }

  // 2. Create or ensure Demo Staff Auth Account
  const demoStaffEmail = "staff@brightloop.local";
  const existingStaff = userList?.users?.find((u) => u.email === demoStaffEmail);
  if (!existingStaff) {
    const { data: newStaff, error: staffErr } = await supabase.auth.admin.createUser({
      email: demoStaffEmail,
      password: "Brightloop1!",
      email_confirm: true,
      user_metadata: { full_name: "Vikram Staff Analyst" },
    });
    if (!staffErr && newStaff) {
      await supabase.from("profiles").upsert({
        id: newStaff.user.id,
        full_name: "Vikram Staff Analyst",
        role: "staff",
      });
      console.log(`[demo-seed] Created demo staff: ${demoStaffEmail} / Brightloop1!`);
    }
  } else {
    await supabase.auth.admin.updateUserById(existingStaff.id, {
      password: "Brightloop1!",
      email_confirm: true,
    });
    await supabase.from("profiles").upsert({
      id: existingStaff.id,
      full_name: "Vikram Staff Analyst",
      role: "staff",
    });
    console.log(`[demo-seed] Ensured demo staff: ${demoStaffEmail} / Brightloop1!`);
  }

  // 3. Ensure Tax Tiers & Payment Terms exist
  let { data: gst18 } = await supabase.from("taxes").select("*").eq("name", "GST 18%").maybeSingle();
  if (!gst18) {
    const { data } = await supabase.from("taxes").insert({ name: "GST 18%", rate: 18.0, active: true }).select().single();
    gst18 = data;
  }

  let { data: net30 } = await supabase.from("payment_terms").select("*").eq("name", "Net 30").maybeSingle();
  if (!net30) {
    const { data } = await supabase.from("payment_terms").insert({ name: "Net 30", days: 30 }).select().single();
    net30 = data;
  }

  // 4. Products & Variants
  let { data: prodCloud } = await supabase.from("products").select("*").eq("name", "Enterprise Cloud Suite").maybeSingle();
  if (!prodCloud) {
    const { data } = await supabase.from("products").insert({
      name: "Enterprise Cloud Suite",
      type: "service",
      sales_price: 15000.0,
      cost_price: 6000.0,
      default_tax_id: gst18?.id,
      notes: "Dedicated high-availability cloud infrastructure with 99.99% uptime SLA.",
      active: true,
    }).select().single();
    prodCloud = data;

    if (prodCloud) {
      await supabase.from("product_variants").insert([
        { product_id: prodCloud.id, attribute: "Tier", value: "Dedicated VPC", extra_price: 5000.0 },
        { product_id: prodCloud.id, attribute: "Backup", value: "Realtime Multi-Region", extra_price: 2500.0 },
      ]);
    }
  }

  let { data: prodSeat } = await supabase.from("products").select("*").eq("name", "Developer Seat License").maybeSingle();
  if (!prodSeat) {
    const { data } = await supabase.from("products").insert({
      name: "Developer Seat License",
      type: "service",
      sales_price: 1200.0,
      cost_price: 300.0,
      default_tax_id: gst18?.id,
      notes: "Seat licence per engineer per month.",
      active: true,
    }).select().single();
    prodSeat = data;
  }

  // 5. Subscription Plans
  let { data: planEnterprise } = await supabase.from("plans").select("*").eq("name", "Enterprise Scale Monthly").maybeSingle();
  if (!planEnterprise) {
    const { data } = await supabase.from("plans").insert({
      name: "Enterprise Scale Monthly",
      price: 5000.0,
      billing_period: "monthly",
      min_quantity: 1,
      closable: true,
      pausable: true,
      renewable: true,
      auto_close: false,
    }).select().single();
    planEnterprise = data;
  }

  let { data: planPro } = await supabase.from("plans").select("*").eq("name", "Pro Growth Monthly").maybeSingle();
  if (!planPro) {
    const { data } = await supabase.from("plans").insert({
      name: "Pro Growth Monthly",
      price: 2500.0,
      billing_period: "monthly",
      min_quantity: 1,
      closable: true,
      pausable: true,
      renewable: true,
      auto_close: false,
    }).select().single();
    planPro = data;
  }

  // 6. Demo Customers
  const demoCustomers = [
    {
      name: "Acme Technologies Private Limited",
      email: demoCustomerEmail,
      company: "Acme Tech Group",
      phone: "+91 98450 12345",
      address: "Tower B, Cyber City, Phase 2, Gurugram, HR 122002",
      user_id: demoCustomerUserId,
    },
    {
      name: "NexaCorp Software Systems",
      email: "billing@nexacorp.com",
      company: "NexaCorp India",
      phone: "+91 97110 56789",
      address: "Brigade Tech Gardens, Whitefield, Bengaluru, KA 560066",
    },
    {
      name: "BlueSky Logistics Global",
      email: "finance@blueskylogistics.in",
      company: "BlueSky Freight Networks",
      phone: "+91 99200 45678",
      address: "MIDC Andheri East, Mumbai, MH 400093",
    },
    {
      name: "ZenFlow Healthcare Analytics",
      email: "accounts@zenflowhealth.com",
      company: "ZenFlow Tech Pvt Ltd",
      phone: "+91 98840 98765",
      address: "TIDEL Park, OMR, Chennai, TN 600113",
    },
  ];

  const customerMap = {};
  for (const c of demoCustomers) {
    let { data: existingCust } = await supabase.from("customers").select("*").eq("email", c.email).maybeSingle();
    if (!existingCust) {
      const { data } = await supabase.from("customers").insert(c).select().single();
      customerMap[c.email] = data;
    } else {
      customerMap[c.email] = existingCust;
      if (c.user_id && !existingCust.user_id) {
        await supabase.from("customers").update({ user_id: c.user_id }).eq("id", existingCust.id);
      }
    }
  }

  // 7. Active Subscriptions
  console.log("==> Creating active subscriptions and lines...");
  const today = new Date().toISOString().split("T")[0];
  const subConfigs = [
    {
      cust: customerMap[demoCustomerEmail],
      plan: planEnterprise,
      lines: [
        { desc: "Enterprise Cloud Suite (Dedicated VPC)", qty: 2, price: 20000.0, tax: gst18?.id },
        { desc: "Developer Seat License", qty: 15, price: 1200.0, tax: gst18?.id },
      ],
    },
    {
      cust: customerMap["billing@nexacorp.com"],
      plan: planPro,
      lines: [
        { desc: "Enterprise Cloud Suite", qty: 1, price: 15000.0, tax: gst18?.id },
        { desc: "Developer Seat License", qty: 10, price: 1200.0, tax: gst18?.id },
      ],
    },
    {
      cust: customerMap["finance@blueskylogistics.in"],
      plan: planPro,
      lines: [
        { desc: "Enterprise Cloud Suite", qty: 1, price: 15000.0, tax: gst18?.id },
        { desc: "Developer Seat License", qty: 5, price: 1200.0, tax: gst18?.id },
      ],
    },
    {
      cust: customerMap["accounts@zenflowhealth.com"],
      plan: planEnterprise,
      lines: [
        { desc: "Enterprise Cloud Suite (Realtime Multi-Region)", qty: 1, price: 17500.0, tax: gst18?.id },
        { desc: "Developer Seat License", qty: 8, price: 1200.0, tax: gst18?.id },
      ],
    },
  ];

  for (const cfg of subConfigs) {
    if (!cfg.cust || !cfg.plan) continue;

    // Check if customer already has active subscription
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("customer_id", cfg.cust.id)
      .eq("status", "active")
      .maybeSingle();

    if (existingSub) continue;

    const { data: sub } = await supabase
      .from("subscriptions")
      .insert({
        customer_id: cfg.cust.id,
        plan_id: cfg.plan.id,
        payment_term_id: net30?.id,
        start_date: "2026-06-01",
        expiry_date: "2027-12-31",
        status: "draft",
      })
      .select()
      .single();

    if (!sub) continue;

    for (let i = 0; i < cfg.lines.length; i++) {
      const l = cfg.lines[i];
      await supabase.from("subscription_lines").insert({
        subscription_id: sub.id,
        description: l.desc,
        quantity: l.qty,
        unit_price: l.price,
        tax_id: l.tax,
        position: i + 1,
      });
    }

    // Transition draft -> quotation -> confirmed -> active
    await supabase.from("subscriptions").update({ status: "quotation" }).eq("id", sub.id);
    await supabase.from("subscriptions").update({ status: "confirmed" }).eq("id", sub.id);
    await supabase.from("subscriptions").update({
      status: "active",
      anchor_date: "2026-06-01",
      cycles_billed: 4,
      next_invoice_date: "2026-11-01",
    }).eq("id", sub.id);
  }

  // 8. Historical Invoices and Cashflow Payments (for the 12-month BarSeries chart)
  console.log("==> Seeding historical invoices and payments for collections chart...");
  const months = [
    { start: "2026-05-01", end: "2026-05-31", paidOn: "2026-05-15", amount: 68440.0, method: "bank_transfer" },
    { start: "2026-06-01", end: "2026-06-30", paidOn: "2026-06-12", amount: 75520.0, method: "bank_transfer" },
    { start: "2026-07-01", end: "2026-07-31", paidOn: "2026-07-10", amount: 84370.0, method: "upi" },
    { start: "2026-08-01", end: "2026-08-31", paidOn: "2026-08-14", amount: 92040.0, method: "card" },
    { start: "2026-09-01", end: "2026-09-30", paidOn: "2026-09-18", amount: 106200.0, method: "bank_transfer" },
    { start: "2026-10-01", end: "2026-10-31", paidOn: "2026-10-15", amount: 112100.0, method: "upi" },
  ];

  const targetCustomer = customerMap[demoCustomerEmail] || Object.values(customerMap)[0];
  const { data: targetSub } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("customer_id", targetCustomer.id)
    .limit(1)
    .single();

  for (const m of months) {
    const { data: existingInv } = await supabase
      .from("invoices")
      .select("id")
      .eq("period_start", m.start)
      .eq("customer_id", targetCustomer.id)
      .maybeSingle();

    if (existingInv) continue;

    const subtotal = m.amount / 1.18;
    const tax = m.amount - subtotal;

    const { data: inv } = await supabase
      .from("invoices")
      .insert({
        subscription_id: targetSub?.id,
        customer_id: targetCustomer.id,
        invoice_date: m.start,
        due_date: m.paidOn,
        period_start: m.start,
        period_end: m.end,
        status: "confirmed",
        subtotal: subtotal.toFixed(2),
        tax_total: tax.toFixed(2),
        total: m.amount,
        amount_paid: 0,
      })
      .select()
      .single();

    if (!inv) continue;

    await supabase.from("invoice_lines").insert({
      invoice_id: inv.id,
      description: "Monthly Managed Cloud Subscription Fee",
      quantity: 1,
      unit_price: subtotal.toFixed(2),
      tax_rate: 18.0,
      tax_amount: tax.toFixed(2),
      line_total: m.amount,
      position: 1,
    });

    // Record payment (triggers auto transition to paid)
    await supabase.from("payments").insert({
      invoice_id: inv.id,
      amount: m.amount,
      paid_on: m.paidOn,
      method: m.method,
      note: `Monthly auto-settlement via ${m.method.toUpperCase()}`,
    });
  }

  // 9. One Overdue Invoice for Alert Verification
  const overduePeriodStart = "2026-09-01";
  const overdueCustomer = customerMap["finance@blueskylogistics.in"];
  const { data: overdueSub } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("customer_id", overdueCustomer.id)
    .limit(1)
    .single();

  let { data: overdueInv } = await supabase
    .from("invoices")
    .select("id")
    .eq("period_start", overduePeriodStart)
    .eq("customer_id", overdueCustomer.id)
    .maybeSingle();

  if (!overdueInv) {
    const { data: inv } = await supabase
      .from("invoices")
      .insert({
        subscription_id: overdueSub?.id,
        customer_id: overdueCustomer.id,
        invoice_date: "2026-09-01",
        due_date: "2026-09-20", // Past due!
        period_start: overduePeriodStart,
        period_end: "2026-09-30",
        status: "confirmed",
        subtotal: 21000.0,
        tax_total: 3780.0,
        total: 24780.0,
        amount_paid: 0.0,
      })
      .select()
      .single();

    if (inv) {
      await supabase.from("invoice_lines").insert({
        invoice_id: inv.id,
        description: "Cloud Compute Scale Add-on - Overdue",
        quantity: 1,
        unit_price: 21000.0,
        tax_rate: 18.0,
        tax_amount: 3780.0,
        line_total: 24780.0,
        position: 1,
      });
      console.log(`[demo-seed] Created overdue invoice #${inv.number || inv.id}`);
    }
  }

  console.log("==> Brightloop SMS Demo Seed Complete!");
  console.log("---------------------------------------------------------------");
  console.log("DEMO ACCOUNTS READY FOR LIVE PITCH:");
  console.log("1. Admin Portal:    sinan@brightloop.local    / Brightloop1! (Full Admin Control)");
  console.log("2. Customer Portal: demo.customer@brightloop.com / Customer1! (Self-Service)");
  console.log("3. Staff View:      staff@brightloop.local    / Brightloop1! (Operations)");
  console.log("---------------------------------------------------------------");
}

seedDemoData().catch((err) => {
  console.error("[demo-seed] Error:", err.message);
  process.exit(1);
});
