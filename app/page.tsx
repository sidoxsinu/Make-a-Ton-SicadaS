"use client";

import React, { useState } from "react";
import { TeamShell } from "@/components/shell/TeamShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Money } from "@/components/ui/Money";
import { DateText } from "@/components/ui/DateText";
import { Table, Column } from "@/components/ui/Table";
import { Pager } from "@/components/ui/Pager";
import { Drawer } from "@/components/ui/Drawer";
import { Dialog } from "@/components/ui/Dialog";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { Field } from "@/components/ui/Field";
import { TextInput, NumberInput, DateInput, Select, Toggle } from "@/components/ui/Inputs";

interface DemoRow {
  id: string;
  number: string;
  customer: string;
  plan: string;
  amount: number;
  date: string;
  status: string;
}

const DEMO_ROWS: DemoRow[] = [
  {
    id: "1",
    number: "SUB-000001",
    customer: "Acme Corp",
    plan: "Enterprise Monthly",
    amount: 18408.0,
    date: "2026-10-31",
    status: "active",
  },
  {
    id: "2",
    number: "SUB-000002",
    customer: "Globex Ltd",
    plan: "Growth Annual",
    amount: 45000.0,
    date: "2026-10-15",
    status: "confirmed",
  },
  {
    id: "3",
    number: "SUB-000003",
    customer: "Soylent Industries",
    plan: "Basic Monthly",
    amount: 1560.0,
    date: "2026-10-01",
    status: "overdue",
  },
  {
    id: "4",
    number: "SUB-000004",
    customer: "Initech",
    plan: "Professional Weekly",
    amount: 2500.0,
    date: "2026-09-20",
    status: "paused",
  },
];

export default function HomePage() {
  const toast = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [toggleVal, setToggleVal] = useState(true);

  const columns: Column<DemoRow>[] = [
    { key: "number", label: "Number", sortable: true },
    { key: "customer", label: "Customer" },
    { key: "plan", label: "Plan" },
    {
      key: "amount",
      label: "Amount",
      align: "right",
      render: (r) => <Money value={r.amount} />,
    },
    {
      key: "date",
      label: "Start Date",
      render: (r) => <DateText value={r.date} />,
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <Badge status={r.status} />,
    },
  ];

  return (
    <TeamShell
      title="Phase 0 UI Ledger Showcase"
      userEmail="sinan@sicadas.local"
      role="admin"
    >
      <div className="flex flex-col gap-8 pb-12">
        {/* Header Block */}
        <div className="flex flex-col gap-1 border-b border-rule pb-4">
          <h2 className="text-[20px] font-sans font-semibold text-ink">
            Phase 0: Foundation & Shell
          </h2>
          <p className="text-[13px] font-sans text-ink-2">
            Ledger-style interface: IBM Plex fonts, 2px maximum radius, flat fills, and 1px rules.
          </p>
        </div>

        {/* Buttons and Badges */}
        <section className="flex flex-col gap-3">
          <h3 className="text-[14px] font-sans font-semibold text-ink">
            Buttons & Status Badges
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary Action</Button>
            <Button variant="secondary">Secondary Action</Button>
            <Button variant="danger">Danger Action</Button>
            <Button variant="quiet">Quiet Text Action</Button>
            <Button disabled>Disabled Action</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Badge status="draft" />
            <Badge status="quotation" />
            <Badge status="confirmed" />
            <Badge status="active" />
            <Badge status="paused" />
            <Badge status="closed" />
            <Badge status="cancelled" />
            <Badge status="paid" />
            <Badge status="overdue" />
            <Badge status="partial" />
          </div>
        </section>

        {/* Form Inputs */}
        <section className="flex flex-col gap-4 max-w-[560px]">
          <h3 className="text-[14px] font-sans font-semibold text-ink">
            Form Field Primitives
          </h3>
          <Field label="Customer Name" name="customer" help="Full registered company or individual name">
            <TextInput placeholder="e.g. Acme Corporation" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Unit Price" name="price">
              <NumberInput placeholder="0.00" defaultValue="1560.00" />
            </Field>
            <Field label="Start Date" name="start_date">
              <DateInput defaultValue="2026-10-31" />
            </Field>
          </div>
          <Field label="Tax Rate" name="tax">
            <Select
              options={[
                { value: "gst-18", label: "GST 18% (Goods & Services)" },
                { value: "exempt-0", label: "Exempt 0%" },
              ]}
              defaultValue="gst-18"
            />
          </Field>
          <div className="pt-1">
            <Toggle
              checked={toggleVal}
              onChange={setToggleVal}
              label="Close automatically when subscription ends"
            />
          </div>
        </section>

        {/* Table & Pager */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-sans font-semibold text-ink">
              Subscriptions Table
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => toast.success("Toast message: Invoice created successfully.")}
              >
                Test Success Toast
              </Button>
              <Button
                variant="secondary"
                onClick={() => toast.error("Error: That transition is not allowed from the current state.")}
              >
                Test Error Toast
              </Button>
              <Button variant="primary" onClick={() => setDrawerOpen(true)}>
                Open Drawer
              </Button>
              <Button variant="danger" onClick={() => setDialogOpen(true)}>
                Open Dialog
              </Button>
            </div>
          </div>

          <Tabs
            items={[
              { key: "all", label: "All Subscriptions", count: 4 },
              { key: "active", label: "Active", count: 1 },
              { key: "overdue", label: "Overdue", count: 1 },
            ]}
            value={activeTab}
            onChange={setActiveTab}
          />

          <Table
            columns={columns}
            rows={DEMO_ROWS}
            sort={{ key: "number", dir: "asc" }}
            onSortHref={(k, dir) => `?sort=${k}&dir=${dir}`}
            rowHref={(r) => `/subscriptions/${r.id}`}
          />

          <Pager
            page={1}
            pageSize={25}
            total={10240}
            hrefFor={(p) => `?page=${p}`}
          />
        </section>
      </div>

      {/* Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Edit Subscription Details"
      >
        <div className="flex flex-col gap-4">
          <p className="text-[13px] text-ink-2">
            Drawer panel width 480px, sheet background, 1px ink rule.
          </p>
          <Field label="Customer Reference">
            <TextInput defaultValue="SUB-000001" />
          </Field>
          <Field label="Notes">
            <TextInput placeholder="Additional internal notes" />
          </Field>
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setDrawerOpen(false)}>
              Save Changes
            </Button>
          </div>
        </div>
      </Drawer>

      {/* Dialog */}
      <Dialog
        open={dialogOpen}
        title="Cancel Subscription"
        body="Are you sure you want to cancel subscription SUB-000001? This action cannot be undone once confirmed."
        confirmLabel="Cancel Subscription"
        cancelLabel="Keep Subscription"
        variant="danger"
        onConfirm={() => {
          setDialogOpen(false);
          toast.success("Subscription SUB-000001 has been closed.");
        }}
        onCancel={() => setDialogOpen(false)}
      />
    </TeamShell>
  );
}
