"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Table, Column } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { DateText } from "@/components/ui/DateText";
import { useToast } from "@/components/ui/Toast";
import { runBillingAction } from "../invoices/actions";

interface BillingRunRow {
  id: string;
  ran_at: string;
  created: number;
  failed: number;
  detail: any;
}

export interface BillingRunsClientProps {
  runs: BillingRunRow[];
  dueCount: number;
}

export function BillingRunsClient({ runs, dueCount }: BillingRunsClientProps) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedRun, setSelectedRun] = useState<BillingRunRow | null>(null);

  async function handleRunBilling() {
    setLoading(true);
    const res = await runBillingAction();
    setLoading(false);

    if (res.ok) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  const columns: Column<BillingRunRow>[] = [
    {
      key: "ran_at",
      label: "Execution Time",
      render: (r) => <DateText value={r.ran_at} />,
    },
    {
      key: "created",
      label: "Invoices Created",
      align: "right",
      render: (r) => (
        <span className="font-mono text-ok font-semibold">
          +{r.created}
        </span>
      ),
    },
    {
      key: "failed",
      label: "Failures",
      align: "right",
      render: (r) => (
        <span
          className={`font-mono font-semibold ${
            r.failed > 0 ? "text-bad" : "text-ink-2"
          }`}
        >
          {r.failed}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Details",
      align: "right",
      render: (r) => (
        <button
          type="button"
          onClick={() => setSelectedRun(r)}
          className="text-[13px] underline text-ink hover:text-accent"
        >
          View Log
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header Block */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-4">
        <div>
          <h2 className="text-[18px] font-sans font-semibold text-ink">
            Automated Billing Job Runs
          </h2>
          <p className="text-[12px] font-sans text-ink-2">
            Daily pg_cron executes generate_due_invoices() to create period bills.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right text-[13px]">
            <span className="text-ink-2">Subscriptions Due Today: </span>
            <span className="font-mono font-semibold text-ink">{dueCount}</span>
          </div>
          <Button
            variant="primary"
            onClick={handleRunBilling}
            loading={loading}
          >
            Run Billing Now
          </Button>
        </div>
      </div>

      {/* Runs Table */}
      <Table
        columns={columns}
        rows={runs}
        empty={
          <div className="p-6 text-center text-[13px] text-ink-2">
            No billing runs recorded yet.
          </div>
        }
      />

      {/* Detail Modal / Drawer if user clicks log */}
      {selectedRun && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(27,31,35,0.35)" }}
          onClick={() => setSelectedRun(null)}
        >
          <div
            className="w-full max-w-[600px] bg-sheet border border-ink p-6 rounded-sm flex flex-col gap-4 text-[13px] font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-rule pb-2">
              <h3 className="font-semibold text-[15px] text-ink">
                Run Execution Details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedRun(null)}
                className="underline"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-ink-2 text-[11px] block">Executed At:</span>
                <DateText value={selectedRun.ran_at} />
              </div>
              <div>
                <span className="text-ink-2 text-[11px] block">Created:</span>
                <span className="font-mono text-ok font-semibold">
                  {selectedRun.created}
                </span>
              </div>
              <div>
                <span className="text-ink-2 text-[11px] block">Failed:</span>
                <span className="font-mono text-bad font-semibold">
                  {selectedRun.failed}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold text-ink-2">Raw Log Detail:</span>
              <pre className="p-3 bg-paper border border-rule rounded-sm font-mono text-[11px] overflow-x-auto max-h-[250px]">
                {JSON.stringify(selectedRun.detail, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
