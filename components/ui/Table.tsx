import React from "react";
import Link from "next/link";

export interface Column<T = Record<string, unknown>> {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  width?: string;
  sortable?: boolean;
  type?: "text" | "number" | "money" | "date" | "badge" | "custom";
  render?: (row: T, index: number) => React.ReactNode;
}

export interface TableProps<T = Record<string, unknown>> {
  columns: Column<T>[];
  rows: T[];
  sort?: { key: string; dir: "asc" | "desc" };
  onSortHref?: (key: string, nextDir: "asc" | "desc") => string;
  empty?: React.ReactNode;
  rowHref?: (row: T) => string;
  keyExtractor?: (row: T, index: number) => string | number;
  className?: string;
}

export function Table<T = Record<string, unknown>>({
  columns,
  rows,
  sort,
  onSortHref,
  empty,
  rowHref,
  keyExtractor,
  className = "",
}: TableProps<T>) {
  if (rows.length === 0 && empty) {
    return <div className="w-full border-b border-rule">{empty}</div>;
  }

  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-ink h-[36px]">
            {columns.map((col) => {
              const isSorted = sort?.key === col.key;
              const nextDir = isSorted && sort?.dir === "asc" ? "desc" : "asc";
              const sortLabel = isSorted ? ` (${sort.dir})` : "";
              const alignClass =
                col.align === "right"
                  ? "text-right"
                  : col.align === "center"
                  ? "text-center"
                  : "text-left";

              return (
                <th
                  key={col.key}
                  scope="col"
                  style={col.width ? { width: col.width } : undefined}
                  aria-sort={
                    isSorted
                      ? sort.dir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  className={`px-3 py-2 text-[12px] font-sans font-semibold text-ink-2 select-none ${alignClass}`}
                >
                  {col.sortable && onSortHref ? (
                    <Link
                      href={onSortHref(col.key, nextDir)}
                      className="inline-flex items-center gap-1 hover:text-ink focus-visible:outline-1 focus-visible:outline-accent"
                    >
                      <span>{col.label}</span>
                      <span className="font-mono text-[11px] text-ink lowercase">
                        {sortLabel}
                      </span>
                    </Link>
                  ) : (
                    <span>
                      {col.label}
                      {sortLabel && (
                        <span className="font-mono text-[11px] text-ink lowercase">
                          {sortLabel}
                        </span>
                      )}
                    </span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => {
            const rowKey = keyExtractor
              ? keyExtractor(row, rowIndex)
              : ((row as Record<string, unknown>)?.id as string | number) ??
                rowIndex;
            const href = rowHref ? rowHref(row) : undefined;

            return (
              <tr
                key={rowKey}
                className="border-b border-rule h-[36px] hover:bg-hover transition-colors group"
              >
                {columns.map((col, colIndex) => {
                  const val = (row as Record<string, unknown>)[col.key];
                  const alignClass =
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                      ? "text-center"
                      : "text-left";
                  const isMono =
                    col.type === "number" ||
                    col.type === "money" ||
                    col.type === "date" ||
                    col.align === "right";

                  let cellContent: React.ReactNode = val as React.ReactNode;
                  if (col.render) {
                    cellContent = col.render(row, rowIndex);
                  }

                  // First column with link
                  if (colIndex === 0 && href) {
                    return (
                      <td
                        key={col.key}
                        style={col.width ? { width: col.width } : undefined}
                        className={`px-3 py-1.5 text-[13px] text-ink ${alignClass} ${
                          isMono ? "font-mono tabular-nums" : "font-sans"
                        }`}
                      >
                        <Link
                          href={href}
                          className="font-medium text-ink underline decoration-1 decoration-rule hover:text-accent hover:decoration-accent focus-visible:outline-1 focus-visible:outline-accent"
                        >
                          {cellContent}
                        </Link>
                      </td>
                    );
                  }

                  return (
                    <td
                      key={col.key}
                      style={col.width ? { width: col.width } : undefined}
                      className={`px-3 py-1.5 text-[13px] text-ink ${alignClass} ${
                        isMono ? "font-mono tabular-nums" : "font-sans"
                      }`}
                    >
                      {cellContent}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

