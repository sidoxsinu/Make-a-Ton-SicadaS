import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Money } from "@/components/ui/Money";
import { DateText } from "@/components/ui/DateText";
import { PrintButton } from "@/app/(team)/invoices/[id]/print/PrintButton";

interface PageProps {
  params: { id: string };
}

export default async function PortalInvoicePrintPage({ params }: PageProps) {
  const supabase = createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, customer:customers(*), subscription:subscriptions(*)")
    .eq("id", params.id)
    .single();

  if (!invoice) notFound();

  const { data: lines } = await supabase
    .from("invoice_lines")
    .select("*")
    .eq("invoice_id", params.id)
    .order("position", { ascending: true });

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("invoice_id", params.id)
    .order("payment_date", { ascending: false });

  const { data: appSettings } = await supabase
    .from("app_settings")
    .select("*");

  const companyNameSetting = appSettings?.find((s) => s.key === "company_name");
  const companyName = companyNameSetting?.value
    ? typeof companyNameSetting.value === "string"
      ? companyNameSetting.value
      : JSON.stringify(companyNameSetting.value).replace(/"/g, "")
    : "Brightloop Software";

  const amountDue = Math.max(0, Number(invoice.total) - Number(invoice.amount_paid));

  return (
    <div className="min-h-screen bg-sheet text-ink p-8 print:p-0 print:bg-transparent">
      {/* Top action bar hidden in print */}
      <div className="max-w-[760px] mx-auto mb-6 flex justify-between items-center print:hidden border-b border-rule pb-4">
        <Link
          href={`/portal/invoices/${invoice.id}`}
          className="text-[13px] underline text-ink hover:text-ink-2"
        >
          {"< Back to invoice"}
        </Link>
        <PrintButton />
      </div>

      {/* Printable Invoice Container */}
      <div className="max-w-[760px] mx-auto bg-sheet print:bg-transparent border border-rule print:border-none p-8 print:p-0 flex flex-col gap-8 text-[13px] font-sans">
        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b-2 border-ink pb-6">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-ink uppercase">
              {companyName}
            </h1>
            <p className="text-[12px] text-ink-2">Tax Invoice & Billing Statement</p>
          </div>
          <div className="text-right">
            <span className="font-mono text-[18px] font-semibold block text-ink">
              {invoice.number}
            </span>
            <span className="text-[12px] text-ink-2 block">
              Status: <span className="uppercase font-semibold text-ink">{invoice.status}</span>
            </span>
          </div>
        </div>

        {/* Customer & Dates Section */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <span className="text-[11px] font-semibold text-ink-2 uppercase tracking-[0.04em] block mb-1">
              Billed To:
            </span>
            <p className="font-semibold text-ink text-[15px]">{invoice.customer?.name}</p>
            {invoice.customer?.company && (
              <p className="text-ink">{invoice.customer.company}</p>
            )}
            <p className="text-ink-2">{invoice.customer?.email}</p>
            {invoice.customer?.address && (
              <p className="text-ink-2 whitespace-pre-line mt-1">
                {invoice.customer.address}
              </p>
            )}
            {invoice.customer?.tax_number && (
              <p className="font-mono text-[12px] text-ink mt-1">
                GSTIN / Tax ID: {invoice.customer.tax_number}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5 text-right font-mono text-[13px]">
            <div className="flex justify-between">
              <span className="text-ink-2 font-sans">Invoice Date:</span>
              <DateText value={invoice.invoice_date} />
            </div>
            <div className="flex justify-between">
              <span className="text-ink-2 font-sans">Due Date:</span>
              <DateText value={invoice.due_date} className="font-semibold text-ink" />
            </div>
            <div className="flex justify-between">
              <span className="text-ink-2 font-sans">Period Start:</span>
              <DateText value={invoice.period_start} />
            </div>
            <div className="flex justify-between">
              <span className="text-ink-2 font-sans">Period End:</span>
              <DateText value={invoice.period_end} />
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-ink text-left">
              <th className="py-2 text-[12px] font-semibold text-ink-2 uppercase">
                Item
              </th>
              <th className="py-2 text-[12px] font-semibold text-ink-2 uppercase text-right">
                Qty
              </th>
              <th className="py-2 text-[12px] font-semibold text-ink-2 uppercase text-right">
                Unit Price
              </th>
              <th className="py-2 text-[12px] font-semibold text-ink-2 uppercase text-right">
                Discount
              </th>
              <th className="py-2 text-[12px] font-semibold text-ink-2 uppercase text-right">
                Tax
              </th>
              <th className="py-2 text-[12px] font-semibold text-ink-2 uppercase text-right">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule font-mono text-[13px]">
            {lines?.map((line) => (
              <tr key={line.id}>
                <td className="py-3 text-left font-sans text-ink">
                  {line.description}
                </td>
                <td className="py-3 text-right text-ink">{line.quantity}</td>
                <td className="py-3 text-right text-ink">
                  <Money value={line.unit_price} />
                </td>
                <td className="py-3 text-right text-ink-2">
                  {Number(line.discount_amount) > 0 ? (
                    <Money value={line.discount_amount} />
                  ) : (
                    "-"
                  )}
                </td>
                <td className="py-3 text-right text-ink-2">
                  {Number(line.tax_amount) > 0 ? (
                    <Money value={line.tax_amount} />
                  ) : (
                    "-"
                  )}
                </td>
                <td className="py-3 text-right font-semibold text-ink">
                  <Money value={line.line_total} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="flex justify-end pt-4">
          <div className="w-[300px] flex flex-col gap-1.5 font-mono text-[13px]">
            <div className="flex justify-between py-1 border-b border-rule">
              <span className="text-ink-2 font-sans">Subtotal</span>
              <Money value={invoice.subtotal} />
            </div>
            {Number(invoice.discount_total) > 0 && (
              <div className="flex justify-between py-1 border-b border-rule text-ok">
                <span className="font-sans">Discounts</span>
                <span>-<Money value={invoice.discount_total} /></span>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-rule">
              <span className="text-ink-2 font-sans">Tax Total</span>
              <Money value={invoice.tax_total} />
            </div>
            <div className="flex justify-between py-2 border-b-2 border-ink text-[16px] font-semibold">
              <span className="font-sans">Total</span>
              <Money value={invoice.total} />
            </div>
            <div className="flex justify-between py-1 border-b border-rule text-ink-2">
              <span className="font-sans">Amount Paid</span>
              <Money value={invoice.amount_paid} />
            </div>
            <div className="flex justify-between py-1 text-[14px] font-semibold">
              <span className="font-sans">Amount Due</span>
              <Money value={amountDue} />
            </div>
          </div>
        </div>

        {/* Payments History */}
        {payments && payments.length > 0 && (
          <div className="border-t border-rule pt-4">
            <h3 className="text-[12px] font-semibold uppercase text-ink-2 mb-2 font-sans">
              Recorded Payments
            </h3>
            <table className="w-full border-collapse font-mono text-[12px]">
              <tbody className="divide-y divide-rule">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-1.5 text-left text-ink-2">
                      <DateText value={p.payment_date} />
                    </td>
                    <td className="py-1.5 text-left uppercase text-ink">
                      {p.payment_method.replace("_", " ")}
                    </td>
                    <td className="py-1.5 text-left text-ink-2">
                      {p.transaction_reference || "-"}
                    </td>
                    <td className="py-1.5 text-right font-semibold text-ok">
                      <Money value={p.amount} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Note */}
        <div className="border-t border-rule pt-6 text-[11px] text-ink-2 text-center">
          <p>Thank you for your business. For any inquiries, please contact support.</p>
        </div>
      </div>
    </div>
  );
}

