import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { DateText } from "@/components/ui/DateText";
import { Money } from "@/components/ui/Money";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function CustomerPortalPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Fetch linked customer row
  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", user?.id)
    .maybeSingle();

  // 2. Fetch customer's subscriptions (RLS also filters by owns_customer)
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("*, plan:plans(name)")
    .order("created_at", { ascending: false });

  // 3. Fetch customer's invoices
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*, subscription:subscriptions(number)")
    .order("invoice_date", { ascending: false });

  const subsList = subscriptions || [];
  const invList = invoices || [];

  const todayStr = new Date().toISOString().split("T")[0];

  // Quick summary counts
  const activeSubsCount = subsList.filter((s) => s.status === "active").length;
  const unpaidInvoices = invList.filter(
    (inv) => inv.status === "confirmed" && Number(inv.total) - Number(inv.amount_paid) > 0
  );
  const totalAmountDue = unpaidInvoices.reduce(
    (acc, inv) => acc + (Number(inv.total) - Number(inv.amount_paid)),
    0
  );

  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-8">
      {/* Top Banner / Welcome */}
      <div className="border border-rule bg-sheet p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-ink-2">
            Customer Portal
          </span>
          <h1 className="text-[20px] font-sans font-semibold text-ink mt-1">
            Welcome, {customer?.name || user?.email}
          </h1>
          <p className="text-[13px] font-sans text-ink-2 mt-1">
            Review your active subscriptions, manage renewals, and inspect your billing receipts.
          </p>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-rule pt-4 md:pt-0 md:pl-6 text-[13px] font-sans">
          <div>
            <span className="block text-[11px] font-mono uppercase text-ink-2">
              Active Subs
            </span>
            <span className="font-mono text-[16px] font-semibold text-ink">
              {activeSubsCount}
            </span>
          </div>
          <div>
            <span className="block text-[11px] font-mono uppercase text-ink-2">
              Unpaid Invoices
            </span>
            <span className="font-mono text-[16px] font-semibold text-ink">
              {unpaidInvoices.length}
            </span>
          </div>
          <div>
            <span className="block text-[11px] font-mono uppercase text-ink-2">
              Total Due
            </span>
            <Money value={totalAmountDue} className="text-[16px] font-semibold" />
          </div>
        </div>
      </div>

      {/* Section 1: Subscriptions Ledger */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-sans font-semibold text-ink uppercase tracking-wide">
            My Subscriptions
          </h2>
          <span className="text-[12px] font-mono text-ink-2">
            {subsList.length} total
          </span>
        </div>

        {subsList.length === 0 ? (
          <div className="border border-rule bg-sheet">
            <EmptyState message="You do not have any subscriptions registered yet." />
          </div>
        ) : (
          <div className="border border-rule bg-sheet overflow-x-auto">
            <table className="w-full border-collapse text-left text-[13px] font-sans">
              <thead>
                <tr className="border-b border-rule bg-paper text-[11px] font-mono uppercase tracking-wider text-ink-2">
                  <th className="py-2.5 px-4 font-semibold">Subscription Number</th>
                  <th className="py-2.5 px-4 font-semibold">Plan</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 font-semibold">Next Invoice</th>
                  <th className="py-2.5 px-4 font-semibold">Expiry Date</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {subsList.map((sub) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-hover transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-ink">
                      <Link
                        href={`/portal/subscriptions/${sub.id}`}
                        className="underline decoration-1 decoration-rule hover:text-accent font-semibold"
                      >
                        {sub.number}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-ink">
                      {(sub.plan as { name?: string })?.name || "-"}
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={sub.status} />
                    </td>
                    <td className="py-3 px-4">
                      {sub.next_invoice_date ? (
                        <DateText value={sub.next_invoice_date} />
                      ) : (
                        <span className="font-mono text-ink-2 text-[12px]">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <DateText value={sub.expiry_date} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/portal/subscriptions/${sub.id}`}
                        className="inline-block px-2.5 py-1 text-[12px] font-sans border border-ink text-ink rounded-sm hover:bg-hover"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Section 2: Invoices Ledger */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-sans font-semibold text-ink uppercase tracking-wide">
            My Invoices
          </h2>
          <span className="text-[12px] font-mono text-ink-2">
            {invList.length} total
          </span>
        </div>

        {invList.length === 0 ? (
          <div className="border border-rule bg-sheet">
            <EmptyState message="No billing invoices have been issued to your account." />
          </div>
        ) : (
          <div className="border border-rule bg-sheet overflow-x-auto">
            <table className="w-full border-collapse text-left text-[13px] font-sans">
              <thead>
                <tr className="border-b border-rule bg-paper text-[11px] font-mono uppercase tracking-wider text-ink-2">
                  <th className="py-2.5 px-4 font-semibold">Invoice Number</th>
                  <th className="py-2.5 px-4 font-semibold">Invoice Date</th>
                  <th className="py-2.5 px-4 font-semibold">Due Date</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Total</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Amount Due</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {invList.map((inv) => {
                  const amountDue = Math.max(0, Number(inv.total) - Number(inv.amount_paid));
                  const isOverdue = inv.status === "confirmed" && inv.due_date < todayStr && amountDue > 0;

                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-hover transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-ink">
                        <Link
                          href={`/portal/invoices/${inv.id}`}
                          className="underline decoration-1 decoration-rule hover:text-accent font-semibold"
                        >
                          {inv.number}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <DateText value={inv.invoice_date} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <DateText value={inv.due_date} />
                          {isOverdue && (
                            <span className="px-1 py-0.2 border border-bad text-bad text-[10px] font-mono uppercase rounded-sm">
                              Overdue
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Money value={inv.total} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Money
                          value={amountDue}
                          className={amountDue > 0 ? "text-bad font-semibold" : "text-ok"}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Badge status={inv.status} />
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {amountDue > 0 ? (
                          <Link
                            href={`/portal/invoices/${inv.id}`}
                            className="inline-block px-2.5 py-1 text-[12px] font-sans bg-ink text-sheet rounded-sm hover:opacity-90 font-semibold"
                          >
                            Pay Now
                          </Link>
                        ) : (
                          <Link
                            href={`/portal/invoices/${inv.id}`}
                            className="inline-block px-2.5 py-1 text-[12px] font-sans border border-ink text-ink rounded-sm hover:bg-hover"
                          >
                            View
                          </Link>
                        )}
                        <Link
                          href={`/portal/invoices/${inv.id}/print`}
                          target="_blank"
                          className="inline-block px-2.5 py-1 text-[12px] font-sans border border-rule text-ink-2 rounded-sm hover:bg-hover hover:text-ink"
                        >
                          Print
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

