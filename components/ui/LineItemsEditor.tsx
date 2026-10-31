"use client";

import React from "react";
import { Button } from "./Button";
import { Money } from "./Money";
import { NumberInput, Select, TextInput } from "./Inputs";

export type LineValue = string | number | null;

export interface LineRow {
  id: string;
  [key: string]: LineValue;
}

export interface LineOption {
  value: string;
  label: string;
}

export interface LineColumn {
  key: string;
  label: string;
  type: "text" | "number" | "money" | "select" | "computed";
  align?: "left" | "right";
  // Static list, or a list that depends on the row (variants of the chosen product).
  options?: LineOption[] | ((row: LineRow) => LineOption[]);
  min?: number;
  step?: number;
  // Value of a new row.
  default?: LineValue;
  // Required for type computed. Displayed through Money.
  compute?: (row: LineRow) => number;
  // Adds the column total to the footer. Do not set on the first column.
  sum?: boolean;
  // Inline error shown under the input.
  error?: (row: LineRow) => string | undefined;
}

export interface LineItemsEditorProps {
  columns: LineColumn[];
  value: LineRow[];
  onChange: (rows: LineRow[]) => void;
  // Called after each edit. Returns fields to overwrite, for example the
  // description, unit price and tax filled from the chosen product and variant.
  priceFn?: (row: LineRow, changedKey: string) => Record<string, LineValue>;
  readOnly?: boolean;
  currency?: string;
  addLabel?: string;
  emptyMessage?: string;
}

function optionsOf(col: LineColumn, row: LineRow): LineOption[] {
  if (typeof col.options === "function") return col.options(row);
  return col.options ?? [];
}

function cellNumber(col: LineColumn, row: LineRow): number {
  if (col.type === "computed" && col.compute) return col.compute(row);
  const n = Number(row[col.key]);
  return Number.isFinite(n) ? n : 0;
}

export function LineItemsEditor({
  columns,
  value,
  onChange,
  priceFn,
  readOnly = false,
  currency,
  addLabel = "Add line",
  emptyMessage = "No lines yet.",
}: LineItemsEditorProps) {
  function update(rowId: string, key: string, next: LineValue) {
    onChange(
      value.map((row) => {
        if (row.id !== rowId) return row;
        const edited: LineRow = { ...row, [key]: next };
        return priceFn ? { ...edited, ...priceFn(edited, key) } : edited;
      })
    );
  }

  function addRow() {
    const blank: LineRow = { id: crypto.randomUUID() };
    for (const col of columns) {
      if (col.type === "computed") continue;
      blank[col.key] = col.default ?? (col.type === "number" || col.type === "money" ? 0 : "");
    }
    onChange([...value, priceFn ? { ...blank, ...priceFn(blank, "") } : blank]);
  }

  function removeRow(rowId: string) {
    onChange(value.filter((row) => row.id !== rowId));
  }

  const firstSum = columns.findIndex((c) => c.sum);
  const hasSums = firstSum > 0;

  function renderCell(col: LineColumn, row: LineRow, index: number) {
    const errorText = col.error?.(row);
    const errorId = `${row.id}-${col.key}-error`;
    const label = `${col.label}, line ${index + 1}`;
    const raw = row[col.key];

    if (col.type === "computed") {
      return <Money value={cellNumber(col, row)} currency={currency} />;
    }

    if (readOnly) {
      if (col.type === "money") return <Money value={Number(raw ?? 0)} currency={currency} />;
      if (col.type === "select") {
        const match = optionsOf(col, row).find((o) => o.value === String(raw ?? ""));
        return <span>{match?.label ?? (raw ? String(raw) : "-")}</span>;
      }
      return <span>{raw === null || raw === "" ? "-" : String(raw)}</span>;
    }

    const describedBy = errorText ? errorId : undefined;
    let input: React.ReactNode;

    if (col.type === "select") {
      input = (
        <Select
          aria-label={label}
          aria-describedby={describedBy}
          aria-invalid={errorText ? true : undefined}
          hasError={!!errorText}
          options={optionsOf(col, row)}
          placeholder="Select"
          value={String(raw ?? "")}
          onChange={(e) => update(row.id, col.key, e.target.value)}
          className="min-w-[140px]"
        />
      );
    } else if (col.type === "number" || col.type === "money") {
      input = (
        <NumberInput
          aria-label={label}
          aria-describedby={describedBy}
          aria-invalid={errorText ? true : undefined}
          hasError={!!errorText}
          min={col.min}
          step={col.step ?? (col.type === "money" ? 0.01 : 1)}
          value={raw ?? ""}
          onChange={(e) =>
            update(row.id, col.key, e.target.value === "" ? "" : Number(e.target.value))
          }
          className="w-[104px]"
        />
      );
    } else {
      input = (
        <TextInput
          aria-label={label}
          aria-describedby={describedBy}
          aria-invalid={errorText ? true : undefined}
          hasError={!!errorText}
          value={String(raw ?? "")}
          onChange={(e) => update(row.id, col.key, e.target.value)}
          className="min-w-[160px]"
        />
      );
    }

    return (
      <>
        {input}
        {errorText && (
          <p id={errorId} className="mt-1 text-[12px] font-sans text-bad text-left">
            {errorText}
          </p>
        )}
      </>
    );
  }

  const alignOf = (col: LineColumn) =>
    col.align === "right" || col.type === "number" || col.type === "money" || col.type === "computed"
      ? "text-right"
      : "text-left";

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-ink h-[36px]">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-3 py-2 text-[12px] font-sans font-semibold text-ink-2 ${alignOf(col)}`}
              >
                {col.label}
              </th>
            ))}
            {!readOnly && (
              <th scope="col" className="px-3 py-2">
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {value.length === 0 && (
            <tr className="border-b border-rule h-[36px]">
              <td
                colSpan={columns.length + (readOnly ? 0 : 1)}
                className="px-3 py-2 text-[13px] font-sans text-ink-2"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
          {value.map((row, index) => (
            <tr key={row.id} className="border-b border-rule align-top">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-3 py-1.5 text-[13px] text-ink ${alignOf(col)} ${
                    col.type === "number" || col.type === "money" || col.type === "computed"
                      ? "font-mono tabular-nums"
                      : "font-sans"
                  }`}
                >
                  {renderCell(col, row, index)}
                </td>
              ))}
              {!readOnly && (
                <td className="px-3 py-1.5 text-right">
                  <Button
                    variant="quiet"
                    onClick={() => removeRow(row.id)}
                    className="h-[36px] text-[13px]"
                  >
                    Remove
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
        {(!readOnly || hasSums) && (
          <tfoot>
            <tr className="border-b border-ink h-[36px]">
              {hasSums ? (
                <>
                  <td colSpan={firstSum} className="px-3 py-1.5 text-left">
                    {!readOnly && (
                      <Button variant="quiet" onClick={addRow} className="text-[13px]">
                        {addLabel}
                      </Button>
                    )}
                  </td>
                  {columns.slice(firstSum).map((col) => (
                    <td key={col.key} className="px-3 py-1.5 text-right">
                      {col.sum && (
                        <Money
                          value={value.reduce((acc, row) => acc + cellNumber(col, row), 0)}
                          currency={currency}
                          className="font-medium"
                        />
                      )}
                    </td>
                  ))}
                  {!readOnly && <td />}
                </>
              ) : (
                <td
                  colSpan={columns.length + (readOnly ? 0 : 1)}
                  className="px-3 py-1.5 text-left"
                >
                  <Button variant="quiet" onClick={addRow} className="text-[13px]">
                    {addLabel}
                  </Button>
                </td>
              )}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
