"use client";

import { createClient } from "@/lib/supabase/browser";
import type { InvoiceStatus } from "@/types/invoice";
import type { PaymentMethod } from "@/types/payment";
import type { SubscriptionStatus } from "@/types/subscription";

type DbError = { message: string } | null;
type DbResult<T> = { data: T | null; error: DbError };
function assertResult<T>(result: DbResult<T>): T {
  if (result.error) throw new Error(result.error.message);
  if (result.data === null) throw new Error("Supabase returned no data.");
  return result.data;
}

function dateLabel(value: string | null): string {
  if (!value) return "";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function moneyNumber(value: string | number | null): number {
  return Number(value ?? 0);
}

function invoiceStatus(value: unknown): InvoiceStatus {
  const normalized = String(value ?? "").toUpperCase();
  if (["DRAFT", "CONFIRMED", "PAID", "OVERDUE", "PARTIAL", "CANCELLED"].includes(normalized)) {
    return normalized as InvoiceStatus;
  }
  throw new Error(`Unexpected invoice status: ${normalized || "(empty)"}`);
}

function paymentMethod(value: unknown): PaymentMethod {
  const normalized = String(value ?? "").toLowerCase();
  const methods: Record<string, PaymentMethod> = {
    bank_transfer: "Bank transfer",
    upi: "UPI",
    card: "Card",
    cheque: "Cheque",
    cash: "Cash",
    other: "Other",
  };
  const method = methods[normalized];
  if (!method) throw new Error(`Unexpected payment method: ${normalized || "(empty)"}`);
  return method;
}

function subscriptionStatus(value: unknown): SubscriptionStatus {
  const normalized = String(value ?? "").toUpperCase();
  if (["DRAFT", "QUOTATION", "CONFIRMED", "ACTIVE", "PAUSED", "CLOSED", "CANCELLED"].includes(normalized)) {
    return normalized as SubscriptionStatus;
  }
  throw new Error(`Unexpected subscription status: ${normalized || "(empty)"}`);
}

export async function fetchOrganizationSettings() {
  const supabase = createClient();
  const settings = assertResult(
    (await supabase.from("app_settings").select("key, value")) as DbResult<
      Array<{ key: string; value: unknown }>
    >
  );
  const values = new Map(settings.map(({ key, value }) => [key, value]));
  return {
    companyName: String(values.get("company_name") ?? ""),
    currencyCode: String(values.get("currency") ?? ""),
  };
}

export async function saveOrganizationSettings(input: { companyName: string; currencyCode: string }) {
  const supabase = createClient();
  const { error } = await supabase.from("app_settings").upsert(
    [
      { key: "company_name", value: input.companyName },
      { key: "currency", value: input.currencyCode },
    ],
    { onConflict: "key" }
  );
  if (error) throw new Error(error.message);
}

export async function fetchCustomers() {
  const supabase = createClient();
  const customers = assertResult(
    (await supabase
      .from("customers")
      .select("id, name, company, email, phone, address")
      .order("name")
      .range(0, 249)) as DbResult<Array<Record<string, unknown>>>
  );
  return customers.map((row) => ({
    id: String(row.id),
    name: String(row.name ?? ""),
    company: String(row.company ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    address: String(row.address ?? ""),
  }));
}

export async function fetchCustomer(id: string) {
  const supabase = createClient();
  const customer = assertResult(
    (await supabase
      .from("customers")
      .select("id, name, company, email, phone, address")
      .eq("id", id)
      .single()) as DbResult<Record<string, unknown>>
  );
  const subscriptions = assertResult(
    (await supabase
      .from("subscriptions")
      .select("id, number, status, start_date, expiry_date, next_invoice_date, plans(name)")
      .eq("customer_id", id)
      .order("created_at", { ascending: false })
      .limit(25)) as DbResult<Array<Record<string, unknown>>>
  );
  const invoices = assertResult(
    (await supabase
      .from("v_invoices")
      .select("id, number, subscription_id, invoice_date, due_date, total, amount_paid, amount_due, status, is_overdue, days_overdue")
      .eq("customer_id", id)
      .order("invoice_date", { ascending: false })
      .limit(25)) as DbResult<Array<Record<string, unknown>>>
  );
  const invoiceIds = invoices.map((invoice) => String(invoice.id));
  const subscriptionIds = Array.from(
    new Set(
      invoices
        .map((invoice) => invoice.subscription_id)
        .filter((subscriptionId): subscriptionId is string => typeof subscriptionId === "string")
    )
  );
  const [invoiceSubscriptions, payments] = await Promise.all([
    subscriptionIds.length
      ? supabase.from("subscriptions").select("id, number").in("id", subscriptionIds)
      : Promise.resolve({ data: [], error: null }),
    invoiceIds.length
      ? supabase
          .from("payments")
          .select("id, invoice_id, paid_on, method, amount, reference")
          .in("invoice_id", invoiceIds)
          .order("paid_on", { ascending: false })
          .limit(25)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (invoiceSubscriptions.error) throw new Error(invoiceSubscriptions.error.message);
  if (payments.error) throw new Error(payments.error.message);
  const invoiceSubscriptionNumbers = new Map(
    (invoiceSubscriptions.data ?? []).map((subscription) => [subscription.id, subscription.number])
  );
  const invoiceNumbers = new Map(invoices.map((invoice) => [String(invoice.id), String(invoice.number ?? "")]));
  return {
    id: String(customer.id),
    name: String(customer.name ?? ""),
    company: String(customer.company ?? ""),
    email: String(customer.email ?? ""),
    phone: String(customer.phone ?? ""),
    address: String(customer.address ?? ""),
    subscriptions: subscriptions.map((row) => ({
      id: String(row.id),
      number: String(row.number ?? ""),
      customerName: String(customer.name ?? ""),
      planName: String((row.plans as { name?: string } | null)?.name ?? ""),
      status: subscriptionStatus(row.status),
      startDate: dateLabel(String(row.start_date ?? "")),
      expiryDate: dateLabel(String(row.expiry_date ?? "")),
      nextInvoiceDate: dateLabel(String(row.next_invoice_date ?? "")),
    })),
    invoices: invoices.map((row) => ({
      id: String(row.id),
      number: String(row.number ?? ""),
      customerName: String(customer.name ?? ""),
      subscriptionNumber: String(invoiceSubscriptionNumbers.get(String(row.subscription_id)) ?? ""),
      invoiceDate: dateLabel(String(row.invoice_date ?? "")),
      dueDate: dateLabel(String(row.due_date ?? "")),
      total: moneyNumber(row.total as string | number | null),
      paid: moneyNumber(row.amount_paid as string | number | null),
      due: moneyNumber(row.amount_due as string | number | null),
      status: invoiceStatus(row.is_overdue ? "OVERDUE" : row.status),
      daysOverdue: Number(row.days_overdue ?? 0),
    })),
    payments: (payments.data ?? []).map((row) => ({
      id: String(row.id),
      date: dateLabel(String(row.paid_on ?? "")),
      invoiceId: String(row.invoice_id ?? ""),
      invoiceNumber: String(invoiceNumbers.get(String(row.invoice_id)) ?? ""),
      customerName: String(customer.name ?? ""),
      method: paymentMethod(row.method),
      amount: moneyNumber(row.amount as string | number | null),
      note: String(row.reference ?? ""),
    })),
  };
}

export async function fetchInvoices() {
  const supabase = createClient();
  const rows = assertResult(
    (await supabase
      .from("v_invoices")
      .select("id, number, customer_id, subscription_id, invoice_date, due_date, total, amount_paid, amount_due, status, is_overdue, days_overdue")
      .order("invoice_date", { ascending: false })
      .range(0, 249)) as DbResult<Array<Record<string, unknown>>>
  );
  const customerIds = Array.from(new Set(rows.map((row) => String(row.customer_id))));
  const subscriptionIds = Array.from(new Set(rows.map((row) => String(row.subscription_id))));
  const [customers, subscriptions] = await Promise.all([
    customerIds.length
      ? supabase.from("customers").select("id, name").in("id", customerIds)
      : Promise.resolve({ data: [], error: null }),
    subscriptionIds.length
      ? supabase.from("subscriptions").select("id, number").in("id", subscriptionIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (customers.error) throw new Error(customers.error.message);
  if (subscriptions.error) throw new Error(subscriptions.error.message);
  const customerNames = new Map((customers.data ?? []).map((row) => [row.id, row.name]));
  const subscriptionNumbers = new Map((subscriptions.data ?? []).map((row) => [row.id, row.number]));
  return rows.map((row) => ({
    id: String(row.id),
    number: String(row.number ?? ""),
    customerName: String(customerNames.get(String(row.customer_id)) ?? ""),
    subscriptionNumber: String(subscriptionNumbers.get(String(row.subscription_id)) ?? ""),
    invoiceDate: dateLabel(String(row.invoice_date ?? "")),
    dueDate: dateLabel(String(row.due_date ?? "")),
    total: moneyNumber(row.total as string | number | null),
    paid: moneyNumber(row.amount_paid as string | number | null),
    due: moneyNumber(row.amount_due as string | number | null),
    status: invoiceStatus(row.is_overdue ? "OVERDUE" : row.status),
    daysOverdue: Number(row.days_overdue ?? 0),
  }));
}

export async function fetchInvoice(id: string) {
  const supabase = createClient();
  const invoice = assertResult(
    (await supabase
      .from("v_invoices")
      .select("id, number, customer_id, subscription_id, status, invoice_date, due_date, period_start, period_end, subtotal, discount_total, tax_total, total, amount_paid, amount_due")
      .eq("id", id)
      .single()) as DbResult<Record<string, unknown>>
  );
  const [customerResult, subscriptionResult, linesResult, paymentsResult] = await Promise.all([
    supabase.from("customers").select("id, name").eq("id", String(invoice.customer_id)).single(),
    supabase.from("subscriptions").select("id, number, payment_term_id").eq("id", String(invoice.subscription_id)).single(),
    supabase.from("invoice_lines").select("id, description, quantity, unit_price, discount_amount, tax_amount, line_total").eq("invoice_id", id).order("position"),
    supabase.from("payments").select("id, paid_on, method, amount, reference").eq("invoice_id", id).order("paid_on", { ascending: false }),
  ]);
  if (customerResult.error) throw new Error(customerResult.error.message);
  if (subscriptionResult.error) throw new Error(subscriptionResult.error.message);
  if (linesResult.error) throw new Error(linesResult.error.message);
  if (paymentsResult.error) throw new Error(paymentsResult.error.message);
  const subscription = subscriptionResult.data;
  const termResult = subscription?.payment_term_id
    ? await supabase.from("payment_terms").select("name").eq("id", subscription.payment_term_id).single()
    : { data: null, error: null };
  if (termResult.error) throw new Error(termResult.error.message);
  return {
    id: String(invoice.id),
    number: String(invoice.number ?? ""),
    customerName: String(customerResult.data?.name ?? ""),
    subscriptionNumber: String(subscription?.number ?? ""),
    subscriptionId: String(invoice.subscription_id),
    invoiceDate: dateLabel(String(invoice.invoice_date ?? "")),
    dueDate: dateLabel(String(invoice.due_date ?? "")),
    paymentTerms: String(termResult.data?.name ?? ""),
    billingPeriod: `${dateLabel(String(invoice.period_start ?? ""))} to ${dateLabel(String(invoice.period_end ?? ""))}`,
    status: invoiceStatus(invoice.status),
    subtotal: moneyNumber(invoice.subtotal as string | number | null),
    discountTotal: moneyNumber(invoice.discount_total as string | number | null),
    taxTotal: moneyNumber(invoice.tax_total as string | number | null),
    total: moneyNumber(invoice.total as string | number | null),
    paidTotal: moneyNumber(invoice.amount_paid as string | number | null),
    amountDue: moneyNumber(invoice.amount_due as string | number | null),
    lines: (linesResult.data ?? []).map((row) => ({
      id: String(row.id),
      description: String(row.description ?? ""),
      quantity: Number(row.quantity),
      unitPrice: moneyNumber(row.unit_price),
      discount: moneyNumber(row.discount_amount),
      tax: moneyNumber(row.tax_amount),
      total: moneyNumber(row.line_total),
    })),
    payments: (paymentsResult.data ?? []).map((row) => ({
      id: String(row.id),
      date: dateLabel(String(row.paid_on ?? "")),
      method: paymentMethod(row.method),
      amount: moneyNumber(row.amount),
      note: String(row.reference ?? ""),
    })),
  };
}

export async function fetchPayments() {
  const supabase = createClient();
  const payments = assertResult(
    (await supabase
      .from("payments")
      .select("id, invoice_id, paid_on, method, amount, reference")
      .order("paid_on", { ascending: false })
      .range(0, 249)) as DbResult<Array<Record<string, unknown>>>
  );
  const invoiceIds = Array.from(new Set(payments.map((row) => String(row.invoice_id))));
  const [invoices, customers] = await Promise.all([
    invoiceIds.length
      ? supabase.from("invoices").select("id, number, customer_id").in("id", invoiceIds)
      : Promise.resolve({ data: [], error: null }),
    supabase.from("customers").select("id, name"),
  ]);
  if (invoices.error) throw new Error(invoices.error.message);
  if (customers.error) throw new Error(customers.error.message);
  const customerNames = new Map((customers.data ?? []).map((row) => [row.id, row.name]));
  const invoiceById = new Map((invoices.data ?? []).map((row) => [row.id, row]));
  const rows = payments.map((row) => {
    const invoice = invoiceById.get(String(row.invoice_id));
    return {
      id: String(row.id),
      date: dateLabel(String(row.paid_on ?? "")),
      invoiceId: String(row.invoice_id ?? ""),
      invoiceNumber: String(invoice?.number ?? ""),
      customerName: String(customerNames.get(String(invoice?.customer_id)) ?? ""),
      method: paymentMethod(row.method),
      amount: moneyNumber(row.amount as string | number | null),
      note: String(row.reference ?? ""),
    };
  });
  const unpaid = assertResult(
    (await supabase
      .from("v_invoices")
      .select("id, number, customer_id, amount_due")
      .eq("status", "confirmed")
      .gt("amount_due", 0)
      .order("due_date")
      .limit(250)) as DbResult<Array<Record<string, unknown>>>
  );
  return {
    payments: rows,
    unpaidInvoices: unpaid.map((row) => ({
      id: String(row.id),
      number: String(row.number ?? ""),
      customerName: String(customerNames.get(String(row.customer_id)) ?? ""),
      amountDue: moneyNumber(row.amount_due as string | number | null),
    })),
  };
}

export async function fetchSubscriptions() {
  const supabase = createClient();
  const rows = assertResult(
    (await supabase
      .from("subscriptions")
      .select("id, number, status, start_date, expiry_date, next_invoice_date, customer:customers(name), plan:plans(name)")
      .order("created_at", { ascending: false })
      .range(0, 249)) as DbResult<Array<Record<string, unknown>>>
  );
  return rows.map((row) => ({
    id: String(row.id),
    number: String(row.number ?? ""),
    customerName: String((row.customer as { name?: string } | null)?.name ?? ""),
    planName: String((row.plan as { name?: string } | null)?.name ?? ""),
    status: subscriptionStatus(row.status),
    startDate: dateLabel(String(row.start_date ?? "")),
    expiryDate: dateLabel(String(row.expiry_date ?? "")),
    nextInvoiceDate: dateLabel(String(row.next_invoice_date ?? "")),
  }));
}

export async function fetchSubscriptionOptions() {
  const supabase = createClient();
  const [customers, plans, terms] = await Promise.all([
    supabase.from("customers").select("id, name").order("name").range(0, 249),
    supabase.from("plans").select("id, name").eq("active", true).order("name").range(0, 249),
    supabase.from("payment_terms").select("id, name").order("name").range(0, 249),
  ]);
  if (customers.error) throw new Error(customers.error.message);
  if (plans.error) throw new Error(plans.error.message);
  if (terms.error) throw new Error(terms.error.message);
  return {
    customers: customers.data ?? [],
    plans: plans.data ?? [],
    terms: terms.data ?? [],
  };
}

export async function createSubscription(input: {
  customerName: string;
  planName: string;
  startDate: string;
  expiryDate: string;
  paymentTerms: string;
}) {
  const supabase = createClient();
  const [customer, plan, term] = await Promise.all([
    supabase.from("customers").select("id").eq("name", input.customerName).single(),
    supabase.from("plans").select("id").eq("name", input.planName).single(),
    supabase.from("payment_terms").select("id").eq("name", input.paymentTerms).single(),
  ]);
  if (customer.error) throw new Error(customer.error.message);
  if (plan.error) throw new Error(plan.error.message);
  if (term.error) throw new Error(term.error.message);
  const { error } = await supabase.from("subscriptions").insert({
    customer_id: customer.data.id,
    plan_id: plan.data.id,
    payment_term_id: term.data.id,
    start_date: input.startDate,
    expiry_date: input.expiryDate,
  });
  if (error) throw new Error(error.message);
}

export async function fetchSubscription(id: string) {
  const supabase = createClient();
  const subscription = assertResult(
    (await supabase
      .from("subscriptions")
      .select("id, number, status, start_date, expiry_date, customer_id, plan_id, payment_term_id, customers(name), plans(name, pausable, renewable, closable)")
      .eq("id", id)
      .single()) as DbResult<Record<string, unknown>>
  );
  const [linesResult, invoicesResult, historyResult, termResult] = await Promise.all([
    supabase.from("subscription_lines").select("id, product_id, description, quantity, unit_price, tax_id, taxes(rate), product_variants(attribute, value), products(name)").eq("subscription_id", id).order("position"),
    supabase.from("invoices").select("id, number, invoice_date, total, status").eq("subscription_id", id).order("invoice_date", { ascending: false }).limit(25),
    supabase.from("subscription_status_history").select("id, from_status, to_status, changed_at, changed_by").eq("subscription_id", id).order("changed_at", { ascending: false }).limit(50),
    supabase.from("payment_terms").select("name").eq("id", String(subscription.payment_term_id)).single(),
  ]);
  if (linesResult.error) throw new Error(linesResult.error.message);
  if (invoicesResult.error) throw new Error(invoicesResult.error.message);
  if (historyResult.error) throw new Error(historyResult.error.message);
  if (termResult.error) throw new Error(termResult.error.message);
  const customer = subscription.customers as { name?: string } | null;
  const plan = subscription.plans as { name?: string; pausable?: boolean; renewable?: boolean; closable?: boolean } | null;
  return {
    id: String(subscription.id),
    number: String(subscription.number ?? ""),
    customerName: String(customer?.name ?? ""),
    planName: String(plan?.name ?? ""),
    status: subscriptionStatus(subscription.status),
    isPaused: subscription.status === "paused",
    startDate: dateLabel(String(subscription.start_date ?? "")),
    expiryDate: dateLabel(String(subscription.expiry_date ?? "")),
    paymentTerms: String(termResult.data?.name ?? ""),
    allowBillNow: subscription.status === "active",
    allowPause: Boolean(plan?.pausable),
    allowRenew: Boolean(plan?.renewable),
    lines: (linesResult.data ?? []).map((row) => ({
      id: String(row.id),
      productId: String(row.product_id ?? ""),
      productName: String((row.products as { name?: string } | null)?.name ?? ""),
      variant: String((row.product_variants as { value?: string } | null)?.value ?? ""),
      description: String(row.description ?? ""),
      quantity: Number(row.quantity),
      unitPrice: moneyNumber(row.unit_price),
      taxPercent: moneyNumber((row.taxes as { rate?: number } | null)?.rate ?? 0),
    })),
    invoices: (invoicesResult.data ?? []).map((row) => ({
      id: String(row.id),
      number: String(row.number ?? ""),
      date: dateLabel(String(row.invoice_date ?? "")),
      total: moneyNumber(row.total),
      status: invoiceStatus(row.status),
    })),
    history: (historyResult.data ?? []).map((row) => ({
      id: String(row.id),
      event: `Status changed to ${String(row.to_status ?? "")}`,
      user: String(row.changed_by ?? ""),
      timestamp: String(row.changed_at ?? ""),
    })),
  };
}

export async function transitionSubscription(id: string, status: string) {
  const supabase = createClient();
  const { error } = await supabase.rpc("sub_transition", {
    p_id: id,
    p_to: status.toLowerCase(),
  });
  if (error) throw new Error(error.message);
}

export async function updateSubscriptionLine(id: string, quantity: number) {
  const supabase = createClient();
  const { error } = await supabase.from("subscription_lines").update({ quantity }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function removeSubscriptionLine(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("subscription_lines").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function fetchBillingRuns() {
  const supabase = createClient();
  const rows = assertResult(
    (await supabase
      .from("billing_runs")
      .select("id, ran_at, created, failed, detail")
      .order("ran_at", { ascending: false })
      .range(0, 249)) as DbResult<Array<Record<string, unknown>>>
  );
  return rows.map((row) => ({
    id: String(row.id),
    ranAt: String(row.ran_at ?? ""),
    createdCount: Number(row.created ?? 0),
    failedCount: Number(row.failed ?? 0),
    errorDetail: String(row.detail ?? ""),
  }));
}

export async function fetchTemplates() {
  const supabase = createClient();
  const rows = assertResult(
    (await supabase
      .from("quotation_templates")
      .select("id, name, validity_days, plan:plans(id, name)")
      .order("name")
      .range(0, 249)) as DbResult<Array<Record<string, unknown>>>
  );
  return rows.map((row) => {
    const plan = row.plan as { id?: string; name?: string } | null;
    return {
      id: String(row.id),
      name: String(row.name ?? ""),
      validityDays: Number(row.validity_days ?? 0),
      planId: String(plan?.id ?? ""),
      planName: String(plan?.name ?? ""),
      lines: [],
    };
  });
}

export async function fetchStaff() {
  const supabase = createClient();
  const rows = assertResult(
    (await supabase
      .from("profiles")
      .select("id, full_name, role, created_at")
      .in("role", ["admin", "staff"])
      .order("created_at", { ascending: false })
      .range(0, 249)) as DbResult<Array<Record<string, unknown>>>
  );
  return rows.map((row) => ({
    id: String(row.id),
    name: String(row.full_name ?? ""),
    role: String(row.role ?? "").toUpperCase(),
    addedAt: dateLabel(String(row.created_at ?? "").slice(0, 10)),
  }));
}

export async function createCustomer(input: {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
}) {
  const supabase = createClient();
  const { error } = await supabase.from("customers").insert({
    name: input.name,
    company: input.company || null,
    email: input.email,
    phone: input.phone || null,
    address: input.address || null,
  });
  if (error) throw new Error(error.message);
}

export async function updateCustomer(id: string, input: {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
}) {
  const supabase = createClient();
  const { error } = await supabase.from("customers").update({
    name: input.name,
    company: input.company || null,
    email: input.email,
    phone: input.phone || null,
    address: input.address || null,
  }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function createPayment(input: {
  invoiceId: string;
  amount: number;
  date: string;
  method: string;
  note: string;
}) {
  const method = input.method.toLowerCase().replaceAll(" ", "_");
  const supabase = createClient();
  const { error } = await supabase.from("payments").insert({
    invoice_id: input.invoiceId,
    amount: input.amount,
    paid_on: input.date,
    method,
    reference: input.note || null,
  });
  if (error) throw new Error(error.message);
}

export async function updateInvoiceStatuses(ids: string[] | null, status: string) {
  const supabase = createClient();
  let request = supabase.from("invoices").update({ status });
  if (ids) request = request.in("id", ids);
  const { error } = await request.eq("status", "draft");
  if (error) throw new Error(error.message);
}

export async function updateInvoiceStatus(id: string, status: string) {
  const supabase = createClient();
  const { error } = await supabase.from("invoices").update({ status: status.toLowerCase() }).eq("id", id);
  if (error) throw new Error(error.message);
}
