import React from "react";
import { DateText } from "./DateText";

export interface HistoryItem {
  at: string;
  label: string;
  by: string;
}

export interface HistoryListProps {
  items: HistoryItem[];
  className?: string;
}

export function HistoryList({ items, className = "" }: HistoryListProps) {
  if (items.length === 0) {
    return (
      <p className={`text-[13px] font-sans text-ink-2 py-2 ${className}`}>
        No status changes recorded yet.
      </p>
    );
  }

  return (
    <ol className={`border-t border-ink ${className}`}>
      {items.map((item, i) => (
        <li key={`${item.at}-${i}`} className="py-2 border-b border-rule">
          <p className="text-[13px] font-sans font-medium text-ink">
            {item.label}
          </p>
          <p className="text-[12px] font-sans text-ink-2">
            {item.by}, <DateText value={item.at} className="text-[12px] text-ink-2" />
          </p>
        </li>
      ))}
    </ol>
  );
}
