"use client";

import React from "react";
import { Button } from "@/components/ui/Button";

export interface LineItemColumn<T> {
  key: keyof T | string;
  label: string;
  width?: string;
  align?: "left" | "right" | "center";
  renderCell: (
    item: T,
    index: number,
    update: (fields: Partial<T>) => void
  ) => React.ReactNode;
}

export interface LineItemsEditorProps<T extends { id?: string | number }> {
  columns: LineItemColumn<T>[];
  items: T[];
  onChange: (items: T[]) => void;
  createDefaultItem: () => T;
  readOnly?: boolean;
  addLabel?: string;
  footerSummary?: React.ReactNode;
  className?: string;
}

export function LineItemsEditor<T extends { id?: string | number }>({
  columns,
  items,
  onChange,
  createDefaultItem,
  readOnly = false,
  addLabel = "Add line",
  footerSummary,
  className = "",
}: LineItemsEditorProps<T>) {
  function handleUpdate(index: number, fields: Partial<T>) {
    const updated = [...items];
    updated[index] = { ...updated[index], ...fields };
    onChange(updated);
  }

  function handleAdd() {
    onChange([...items, createDefaultItem()]);
  }

  function handleRemove(index: number) {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  }

  return (
    <div className={`w-full overflow-x-auto flex flex-col gap-2 ${className}`}>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-ink h-[36px]">
            {columns.map((col) => {
              const alignClass =
                col.align === "right"
                  ? "text-right"
                  : col.align === "center"
                  ? "text-center"
                  : "text-left";

              return (
                <th
                  key={String(col.key)}
                  style={{ width: col.width }}
                  className={`px-3 py-2 text-[12px] font-sans font-semibold text-ink-2 select-none ${alignClass}`}
                >
                  {col.label}
                </th>
              );
            })}
            {!readOnly && (
              <th className="px-3 py-2 text-[12px] font-sans font-semibold text-ink-2 text-right w-[80px]">
                Remove
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={item.id ?? index}
              className="border-b border-rule h-[40px] hover:bg-hover transition-colors"
            >
              {columns.map((col) => {
                const alignClass =
                  col.align === "right"
                    ? "text-right"
                    : col.align === "center"
                    ? "text-center"
                    : "text-left";

                return (
                  <td
                    key={String(col.key)}
                    className={`px-3 py-1.5 text-[13px] font-sans text-ink ${alignClass}`}
                  >
                    {col.renderCell(item, index, (fields) =>
                      handleUpdate(index, fields)
                    )}
                  </td>
                );
              })}
              {!readOnly && (
                <td className="px-3 py-1.5 text-right">
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="text-[12px] font-sans text-bad underline decoration-1 decoration-rule hover:opacity-80"
                  >
                    Remove
                  </button>
                </td>
              )}
            </tr>
          ))}
          {items.length === 0 && (
            <tr className="border-b border-rule">
              <td
                colSpan={columns.length + (readOnly ? 0 : 1)}
                className="py-4 text-center text-[13px] font-sans text-ink-2"
              >
                No items added yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Footer row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-rule">
        {!readOnly ? (
          <Button
            type="button"
            variant="quiet"
            onClick={handleAdd}
            className="text-[13px] font-medium"
          >
            {addLabel}
          </Button>
        ) : (
          <div />
        )}

        {footerSummary && (
          <div className="ml-auto text-right font-mono text-[13px] tabular-nums">
            {footerSummary}
          </div>
        )}
      </div>
    </div>
  );
}
