import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StateStepper } from "@/components/ui/StateStepper";
import { KpiLedger } from "@/components/ui/KpiLedger";
import { BarSeries } from "@/components/ui/BarSeries";
import { TotalsLedger } from "@/components/ui/TotalsLedger";
import { HistoryList } from "@/components/ui/HistoryList";
import { ActionBar } from "@/components/ui/ActionBar";
import { LineItemsEditor, type LineColumn } from "@/components/ui/LineItemsEditor";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";

const h = React.createElement;
const html = (el: React.ReactElement) => renderToStaticMarkup(el);

describe("Phase A components render without JavaScript", () => {
  it("StateStepper writes every state name and marks the current one", () => {
    const out = html(h(StateStepper, { steps: ["Draft", "Quotation", "Confirmed", "Active", "Closed"], current: "Confirmed" }));
    for (const s of ["Draft", "Quotation", "Confirmed", "Active", "Closed"]) expect(out).toContain(s);
    expect(out).toContain('aria-current="step"');
    expect(out).toContain("Current");
  });

  it("KpiLedger prints final values and context", () => {
    const out = html(h(KpiLedger, { rows: [{ label: "Outstanding", value: 18408, format: "money", context: "All confirmed invoices with an amount due" }] }));
    expect(out).toContain("\u20B918,408.00");
    expect(out).toContain("All confirmed invoices with an amount due");
  });

  it("BarSeries draws bars, labels and a text table", () => {
    const out = html(h(BarSeries, { title: "Collected per month", format: "money", data: [{ label: "Nov 25", value: 1000 }, { label: "Dec 25", value: 2500 }] }));
    expect(out).toContain("bar-series-rect");
    expect(out).toContain("<table");
    expect(out).toContain("Dec 25");
  });

  it("BarSeries with no data says so", () => {
    expect(html(h(BarSeries, { title: "t", format: "number", data: [] }))).toContain("No values to chart");
  });

  it("TotalsLedger shows discount as a negative and optional rows", () => {
    const out = html(h(TotalsLedger, { subtotal: 15600, discount: 2060, tax: 2437.2, total: 15977.2, paid: 0, due: 15977.2 }));
    expect(out).toContain("-\u20B92,060.00");
    expect(out).toContain("Paid");
    expect(out).toContain("Due");
    expect(html(h(TotalsLedger, { subtotal: 1, discount: 0, tax: 0, total: 1 }))).not.toContain("-\u20B90.00");
  });

  it("HistoryList renders items and an empty sentence", () => {
    expect(html(h(HistoryList, { items: [{ at: "2026-10-31", label: "Confirmed", by: "Test staff" }] }))).toContain("31 Oct 2026");
    expect(html(h(HistoryList, { items: [] }))).toContain("No status changes recorded yet.");
  });

  it("ActionBar hides invisible actions", () => {
    const out = html(h(ActionBar, { actions: [
      { label: "Confirm", onClick: () => {}, variant: "primary", visible: true },
      { label: "Pause", onClick: () => {}, variant: "secondary", visible: false },
    ] }));
    expect(out).toContain("Confirm");
    expect(out).not.toContain("Pause");
    expect(html(h(ActionBar, { actions: [] }))).toBe("");
  });

  it("LineItemsEditor renders inputs, errors, remove, add and totals", () => {
    const columns: LineColumn[] = [
      { key: "description", label: "Description", type: "text" },
      { key: "quantity", label: "Quantity", type: "number", default: 1, error: (r) => (Number(r.quantity) < 5 ? "Use at least 5" : undefined) },
      { key: "unit", label: "Unit price", type: "money" },
      { key: "amount", label: "Amount", type: "computed", sum: true, compute: (r) => Number(r.quantity) * Number(r.unit) },
    ];
    const out = html(h(LineItemsEditor, { columns, onChange: () => {}, value: [{ id: "a", description: "Odoo CRM", quantity: 3, unit: 1560 }] }));
    expect(out).toContain('scope="col"');
    expect(out).toContain("Use at least 5");
    expect(out).toContain("Remove");
    expect(out).toContain("Add line");
    expect(out).toContain("\u20B94,680.00");
    const ro = html(h(LineItemsEditor, { columns, readOnly: true, onChange: () => {}, value: [{ id: "a", description: "x", quantity: 2, unit: 10 }] }));
    expect(ro).not.toContain("Add line");
    expect(ro).not.toContain("<input");
  });

  it("Loading and Error states are text", () => {
    expect(html(h(LoadingState, { label: "invoices" }))).toContain("Loading invoices");
    expect(html(h(ErrorState, { message: "Reload the page." }))).toContain('role="alert"');
  });
});
