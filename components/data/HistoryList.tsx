import React from "react";
import { DateText } from "@/components/ui/DateText";

export interface StatusHistoryItem {
  id: string;
  from_status: string | null;
  to_status: string;
  changed_at: string;
  changed_by?: string | null;
}

export interface HistoryListProps {
  items: StatusHistoryItem[];
  className?: string;
}

export function HistoryList({ items, className = "" }: HistoryListProps) {
  if (items.length === 0) {
    return (
      <div className="py-4 text-[13px] font-sans text-ink-2">
        No transition history recorded.
      </div>
    );
  }

  return (
    <div className={`flex flex-col border border-rule rounded-sm bg-sheet text-[13px] font-sans ${className}`}>
      <div className="px-3 py-2 border-b border-rule font-semibold text-ink-2 uppercase tracking-[0.04em] text-[11px]">
        Audit Log & State Transitions
      </div>
      <ul className="divide-y divide-rule">
        {items.map((item) => (
          <li key={item.id} className="p-3 flex items-start justify-between gap-4">
            <div className="flex flex-col">
              <span className="font-medium text-ink">
                {item.from_status ? (
                  <>
                    <span className="uppercase text-ink-2">{item.from_status}</span>
                    <span className="mx-1 text-rule">to</span>
                    <span className="uppercase font-semibold text-accent">{item.to_status}</span>
                  </>
                ) : (
                  <>
                    Created in <span className="uppercase font-semibold text-ink">{item.to_status}</span>
                  </>
                )}
              </span>
              {item.changed_by && (
                <span className="text-[11px] font-mono text-ink-2">
                  by {item.changed_by}
                </span>
              )}
            </div>
            <DateText value={item.changed_at} className="text-[12px] text-ink-2 shrink-0" />
          </li>
        ))}
      </ul>
    </div>
  );
}

