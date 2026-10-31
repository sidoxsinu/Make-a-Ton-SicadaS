import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { resource: string } }
) {
  const resource = params.resource.toLowerCase();
  const searchParams = req.nextUrl.searchParams;
  const today = new Date().toISOString().split("T")[0];

  const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);

  let headers: string[] = [];
  let rows: string[][] = [];

  if (resource === "invoices") {
    headers = [
      "Invoice Number",
      "Customer",
      "Status",
      "Invoice Date",
      "Due Date",
      "Subtotal",
      "Discount Total",
      "Tax Total",
      "Total",
      "Amount Paid",
      "Amount Due",
    ];

    let q = adminClient
      .from("invoices")
      .select("*, customer:customers(name)")
      .order("invoice_date", { ascending: false });

    if (searchParams.get("status")) {
      q = q.eq("status", searchParams.get("status")!);
    }

    const { data } = await q;

    rows = (data || []).map((inv: any) => [
      inv.number || "",
      inv.customer?.name || "",
      inv.status || "",
      inv.invoice_date || "",
      inv.due_date || "",
      Number(inv.subtotal || 0).toFixed(2),
      Number(inv.discount_total || 0).toFixed(2),
      Number(inv.tax_total || 0).toFixed(2),
      Number(inv.total || 0).toFixed(2),
      Number(inv.amount_paid || 0).toFixed(2),
      (Number(inv.total || 0) - Number(inv.amount_paid || 0)).toFixed(2),
    ]);
  } else if (resource === "payments") {
    headers = [
      "Payment ID",
      "Invoice Number",
      "Customer",
      "Method",
      "Amount",
      "Payment Date",
      "Reference Note",
    ];

    let q = adminClient
      .from("payments")
      .select("*, invoice:invoices(number, customer:customers(name))")
      .order("paid_on", { ascending: false });

    if (searchParams.get("method")) {
      q = q.eq("method", searchParams.get("method")!);
    }

    const { data } = await q;

    rows = (data || []).map((p: any) => [
      p.id,
      p.invoice?.number || "",
      p.invoice?.customer?.name || "",
      p.method || "",
      Number(p.amount || 0).toFixed(2),
      p.paid_on || "",
      p.note || "",
    ]);
  } else if (resource === "subscriptions") {
    headers = [
      "Subscription ID",
      "Customer",
      "Plan",
      "Status",
      "Start Date",
      "Expiry Date",
      "Next Invoice Date",
      "Cycles Billed",
    ];

    let q = adminClient
      .from("subscriptions")
      .select("*, customer:customers(name), plan:plans(name)")
      .order("created_at", { ascending: false });

    if (searchParams.get("status")) {
      q = q.eq("status", searchParams.get("status")!);
    }

    const { data } = await q;

    rows = (data || []).map((s: any) => [
      s.id,
      s.customer?.name || "",
      s.plan?.name || "",
      s.status || "",
      s.start_date || "",
      s.expiry_date || "",
      s.next_invoice_date || "",
      String(s.cycles_billed || 0),
    ]);
  } else if (resource === "customers") {
    headers = ["Customer ID", "Name", "Email", "Phone", "Company", "Address"];

    const { data } = await adminClient
      .from("customers")
      .select("*")
      .order("name");

    rows = (data || []).map((c: any) => [
      c.id,
      c.name || "",
      c.email || "",
      c.phone || "",
      c.company || "",
      c.address || "",
    ]);
  } else {
    return NextResponse.json(
      { error: `Resource "${resource}" not supported for CSV export` },
      { status: 400 }
    );
  }

  // Format CSV
  const headerLine = headers.map(csvEscape).join(",");
  const dataLines = rows.map((r) => r.map(csvEscape).join(","));
  const csvContent = [headerLine, ...dataLines].join("\r\n");

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${resource}-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

