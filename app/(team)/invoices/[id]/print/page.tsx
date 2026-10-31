import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Money } from "@/components/ui/Money";
import { DateText } from "@/components/ui/DateText";
import { PrintButton } from "./PrintButton";

interface PageProps {
  params: { id: string };
}

export default async function InvoicePrintPage({ params }: PageProps) {
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

  const { data: appSettings } = await supabase
    .from("app_settings")
    .select("*");

  const companyNameSetting = appSettings?.find((s) => s.key === "company_name");
  const companyName = companyNameSetting?.value
    ? typeof companyNameSetting.value === "string"
      ? companyNameSetting.value
      : JSON.stringify(companyNameSetting.value).replace(/"/g, "")
    : "Brightloop Software";

  return (
    <div className="min-h-screen bg-sheet text-ink p-8 print:p-0 print:bg-transparent">
      {/* Top action bar hidden in print */}
      <div className="max-w-[760px] mx-auto mb-6 flex justify-between items-center print:hidden border-b border-rule pb-4">
        <a
          href={`/invoices/${invoice.id}`}
          className="text-[13px] underline text-ink hover:text-ink-2"
        >
          Back to invoice
        </a>
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
                Description
              </th>
              <th className="py-2 text-[12px] font-semibold text-ink-2 uppercase text-right w-[60px]">
                Qty
              </th>
              <th className="py-2 text-[12px] font-semibold text-ink-2 uppercase text-right w-[100px]">
                Unit Price
              </th>
              <th className="py-2 text-[12px] font-semibold text-ink-2 uppercase text-right w-[80px]">
                Tax Rate
              </th>
              <th className="py-2 text-[12px] font-semibold text-ink-2 uppercase text-right w-[110px]">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {(lines || []).map((l: any) => (
              <tr key={l.id} className="border-b border-rule">
                <td className="py-2 text-ink">{l.description}</td>
                <td className="py-2 text-right font-mono">{l.quantity}</td>
                <td className="py-2 text-right font-mono">
                  <Money value={l.unit_price} />
                </td>
                <td className="py-2 text-right font-mono">{Number(l.tax_rate)}%</td>
                <td className="py-2 text-right font-mono font-medium">
                  <Money value={l.line_total} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="flex justify-end pt-2">
          <div className="w-[300px] flex flex-col gap-1.5 font-mono text-[13px]">
            <div className="flex justify-between text-ink-2">
              <span className="font-sans">Subtotal:</span>
              <Money value={invoice.subtotal} />
            </div>
            {invoice.discount_total > 0 && (
              <div className="flex justify-between text-warn">
                <span className="font-sans">Discount:</span>
                <span>-<Money value={invoice.discount_total} /></span>
              </div>
            )}
            <div className="flex justify-between text-ink-2">
              <span className="font-sans">Tax Total:</span>
              <Money value={invoice.tax_total} />
            </div>
            <div className="flex justify-between font-semibold text-[15px] border-t-2 border-ink pt-1.5 text-ink">
              <span className="font-sans">Total:</span>
              <Money value={invoice.total} />
            </div>
            {invoice.amount_paid > 0 && (
              <div className="flex justify-between text-ok">
                <span className="font-sans">Amount Paid:</span>
                <Money value={invoice.amount_paid} />
              </div>
            )}
            <div className="flex justify-between font-semibold border-t border-rule pt-1 text-ink">
              <span className="font-sans">Amount Due:</span>
              <Money value={invoice.total - (invoice.amount_paid || 0)} />
            </div>
          </div>
        </div>

        {/* Footer notes */}
        <div className="border-t border-rule pt-4 text-[12px] text-ink-2 flex justify-between">
          <p>Thank you for your business. Terms and conditions apply.</p>
          <p className="font-mono">Page 1 of 1</p>
        </div>
      </div>
    </div>
  );
}
